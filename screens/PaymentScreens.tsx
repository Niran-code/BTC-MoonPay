import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  UIManager,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Clipboard,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as breezSdk from '@breeztech/react-native-breez-sdk-liquid';
import { PaymentMethod, ReceiveAmountVariant } from '@breeztech/react-native-breez-sdk-liquid';
import { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearReceive, setReceive } from '../store/reducers/receive';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ExtendedPaymentMethod = PaymentMethod;

export const PrepareScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const [payerAmount, setPayerAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<ExtendedPaymentMethod>(PaymentMethod.LIGHTNING);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const NETWORK_OPTIONS = [
    { name: 'Lightning', value: PaymentMethod.LIGHTNING },
    { name: 'Bitcoin', value: PaymentMethod.BITCOIN_ADDRESS },
    { name: 'Liquid', value: PaymentMethod.LIQUID_ADDRESS },
  ];

  const selectedNetwork = NETWORK_OPTIONS.find(n => n.value === paymentMethod)?.name || 'Select Network';

  const handlePrepare = async () => {
    setError(undefined);
    setLoading(true);

    try {
      if (!payerAmount || payerAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const response = await breezSdk.prepareReceivePayment({
        amount: {
          type: ReceiveAmountVariant.BITCOIN,
          payerAmountSat: payerAmount,
        },
        paymentMethod: paymentMethod,
      });

      if (!response) {
        throw new Error('Failed to generate payment request');
      }

      dispatch(setReceive({
        prepareResponse: response,
        selectedPaymentMethod: paymentMethod,
      }));

      navigation.navigate('ReceiveConfirm');
    } catch (err: any) {
      console.error('Payment preparation error:', err);
      const errorMessage = err.message || 'Failed to prepare payment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper dismissible={true}>
      <Text style={styles.modalTitle}>Select Network</Text>

      <Pressable
        style={styles.dropdownContainer}
        onPress={() => setShowNetworkDropdown(!showNetworkDropdown)}
      >
        <Text style={styles.dropdownSelectedText}>{selectedNetwork}</Text>
        <Icon
          name={showNetworkDropdown ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </Pressable>

      {showNetworkDropdown && (
        <View style={styles.dropdownOptions}>
          {NETWORK_OPTIONS.map((network) => (
            <Pressable
              key={network.value}
              style={styles.dropdownOption}
              onPress={() => {
                setPaymentMethod(network.value);
                setShowNetworkDropdown(false);
              }}
            >
              <Text style={styles.dropdownOptionText}>{network.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.amountLabel}>Amount</Text>
      <View style={styles.amountInputContainer}>
        <TextInput
          style={styles.amountInput}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor="#888"
          onChangeText={(text) => setPayerAmount(Number(text))}
        />
        <View style={styles.currencyContainer}>
          <Text style={styles.amountCurrency}>SATS</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.nextButton]}
          onPress={handlePrepare}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>Next</Text>
          )}
        </Pressable>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </ModalWrapper>
  );
};

export const ConfirmScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { prepareResponse, selectedPaymentMethod } = useAppSelector((store) => store.receive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleReceive = async () => {
    setError(undefined);
    setLoading(true);

    try {
      if (!prepareResponse) {
        throw new Error('Payment details missing');
      }

      const receiveResp = await breezSdk.receivePayment({ prepareResponse });

      dispatch(setReceive({
        receiveResponse: receiveResp,
        selectedPaymentMethod,
      }));

      navigation.navigate('ReceiveFinal');
    } catch (err: any) {
      console.error('Payment processing error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper dismissible={false}>
      <Text style={styles.modalTitle}>Confirm Payment</Text>
      <Text style={styles.confirmLabel}>
        <Text style={{ fontWeight: 'bold', color: '#fff' }}>Payment Fee: </Text>
        <Text style={{ color: '#fff' }}>{prepareResponse?.feesSat ?? 0} sats</Text>
      </Text>
      <Text style={styles.confirmText}>Proceed with receiving this payment?</Text>
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.confirmButton]}
          onPress={handleReceive}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm</Text>
          )}
        </Pressable>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </ModalWrapper>
  );
};

export const FinalScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { receiveResponse, selectedPaymentMethod } = useAppSelector((store) => store.receive);

  const copyToClipboard = () => {
    if (!receiveResponse?.destination) {return;}
    Clipboard.setString(receiveResponse.destination);
    Alert.alert('Copied to clipboard', 'Payment address has been copied');
  };

  const handleDone = () => {
    dispatch(clearReceive());
    navigation.pop(2);
  };

  return (
    <ModalWrapper dismissible={true}>
      <Text style={styles.modalTitle}>
        {selectedPaymentMethod === PaymentMethod.LIGHTNING ? 'Lightning Invoice' : 'Payment Address'}
      </Text>
      <Text style={styles.destinationLabel}>
        Pay to the following {selectedPaymentMethod === PaymentMethod.LIGHTNING ? 'invoice' : 'destination'}:
      </Text>

      <Text selectable style={styles.destinationAddress}>
        {receiveResponse?.destination}
      </Text>

      <Pressable
        onPress={copyToClipboard}
        style={[styles.actionButton, styles.copyButton]}
      >
        <Icon name="copy-outline" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.copyButtonText}>Copy Address</Text>
      </Pressable>

      <Pressable
        onPress={handleDone}
        style={[styles.actionButton, styles.doneButton]}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </Pressable>
    </ModalWrapper>
  );
};

function ModalWrapper({ children, dismissible }: { children: React.ReactNode; dismissible?: boolean }) {
  const navigation = useNavigation();
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modalOverlay}>
      {dismissible && <Pressable onPress={() => navigation.goBack()} style={styles.overlayPressable} />}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000070',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlayPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#2e2e2e',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    maxHeight: '80%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#424242',
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: '#fff',
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 10,
    backgroundColor: '#424242',
    zIndex: 10,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#fff',
  },
  amountLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#fff',
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountCurrency: {
    fontSize: 14,
    color: '#fff',
    marginRight: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#3A3A3C',
  },
  nextButton: {
    backgroundColor: '#0184fb',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  doneButton: {
    backgroundColor: '#0184fb',
    marginTop: 20,
  },
  copyButton: {
    backgroundColor: '#0184fb',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmLabel: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'left',
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'left',
    marginBottom: 20,
  },
  destinationLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  destinationAddress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#424242',
    borderRadius: 8,
    marginBottom: 20,
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
});
