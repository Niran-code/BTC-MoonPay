import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as liquidSdk from '@breeztech/react-native-breez-sdk-liquid';
import { PayAmountVariant } from '@breeztech/react-native-breez-sdk-liquid';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSend } from '../store/reducers/send';
import QRCode from 'react-native-qrcode-svg';

export default function SendFlow() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const prepareResponse = useAppSelector((store) => store.send.prepareResponse);

  const [step, setStep] = useState<'prepare' | 'confirm' | 'final'>('prepare');
  const [error, setError] = useState<string | undefined>();
  const [amount, setAmount] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [loadingPrepare, setLoadingPrepare] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);

  const isLightningInvoice = useMemo(() => {
    return destination?.toLowerCase().startsWith('ln') && destination.length > 10;
  }, [destination]);

  const fees = useMemo(() => prepareResponse?.feesSat ?? 0, [prepareResponse]);

  const prepareSend = async () => {
    setError(undefined);
    const amountSat = Number(amount);

    if (!destination.trim()) {
      setError('Please enter a valid destination address.');
      return;
    }

    if (!amount || amountSat <= 0 || !Number.isInteger(amountSat)) {
      setError('Enter a valid amount in whole SATS.');
      return;
    }

    try {
      setLoadingPrepare(true);
      const prepareResp = await liquidSdk.prepareSendPayment({
        destination,
        amount: {
          type: PayAmountVariant.BITCOIN,
          receiverAmountSat: amountSat,
        },
      });

      dispatch(setSend({ prepareResponse: prepareResp }));
      setStep('confirm');
    } catch (err: any) {
      setError(err.message ?? 'Failed to prepare payment.');
    } finally {
      setLoadingPrepare(false);
    }
  };

  const sendPayment = useCallback(async () => {
    if (!prepareResponse) {return;}
    try {
      setLoadingConfirm(true);
      const sendResp = await liquidSdk.sendPayment({ prepareResponse });
      dispatch(setSend({ sendResponse: sendResp }));
      setSuccess(true);
      setStep('final');
    } catch (err) {
      console.warn('Payment failed:', err);
      setSuccess(false);
      setStep('final');
    } finally {
      setLoadingConfirm(false);
    }
  }, [prepareResponse, dispatch]);

  const closeModal = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  const resetFlow = () => {
    setStep('prepare');
    setAmount('');
    setDestination('');
    setError(undefined);
    setSuccess(null);
    dispatch(setSend({ prepareResponse: undefined, sendResponse: undefined }));
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {step === 'prepare' && (
            <>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={destination}
                onChangeText={setDestination}
                placeholder="Enter Destination Address"
                placeholderTextColor="#AAAAAA"
                autoCapitalize="none"
                editable={!loadingPrepare}
              />

              {isLightningInvoice && (
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                  <QRCode value={destination} size={100} />
                  <Text style={{ fontSize: 12, marginTop: 4, color: 'white' }}>Lightning Invoice</Text>
                </View>
              )}

              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountContainer}>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#AAAAAA"
                  value={amount}
                  onChangeText={setAmount}
                  editable={!loadingPrepare}
                />
                <Text style={styles.satsLabel}>SATS</Text>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.sendButton]}
                  onPress={prepareSend}
                  disabled={loadingPrepare}
                >
                  {loadingPrepare ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Send</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 'confirm' && prepareResponse && (
            <>
              <Text style={styles.feeText}>Payment Fee: {fees} SATS</Text>
              <Text style={styles.confirmationText}>
                Do you want to confirm and proceed with the payment?
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setStep('prepare')}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={sendPayment}
                  disabled={loadingConfirm}
                >
                  {loadingConfirm ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Next</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 'final' && (
            <>
              <View style={styles.resultContainer}>
                {success ? (
                  <>
                    <Text style={styles.successText}>✓</Text>
                    <Text style={styles.resultMessage}>Transaction Successful</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.failureText}>✕</Text>
                    <Text style={styles.resultMessage}>Transaction Failed</Text>
                  </>
                )}
              </View>
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={success ? closeModal : resetFlow}
              >
                <Text style={styles.buttonText}>{success ? 'Close' : 'Try Again'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    borderColor: '#2e2e2e',
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#424242',
    color: 'white',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 16,
    paddingRight: 12,
    backgroundColor: '#424242',
  },
  amountInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: 'white',
  },
  satsLabel: {
    color: 'white',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#3A3A3C',
  },
  sendButton: {
    backgroundColor: '#007AFF',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    marginTop: 20,
  },
  feeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    color: 'white',
  },
  confirmationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 48,
    color: '#34C759',
    marginBottom: 16,
  },
  failureText: {
    fontSize: 48,
    color: '#FF3B30',
    marginBottom: 16,
  },
  resultMessage: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: 'white',
  },
});
