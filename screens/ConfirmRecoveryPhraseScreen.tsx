import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';

type ConfirmRouteProp = RouteProp<RootStackParamList, 'ConfirmRecoveryPhrase'>;
type ConfirmNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ConfirmRecoveryPhrase'
>;

export default function ConfirmRecoveryPhraseScreen() {
  const navigation = useNavigation<ConfirmNavigationProp>();
  const route = useRoute<ConfirmRouteProp>();
  const { mnemonic, address } = route.params;
  const words = mnemonic.split(' ');
  const [input4, setInput4] = useState('');
  const [input8, setInput8] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleConfirm = () => {
    if (
      input4.trim().toLowerCase() === words[3].trim().toLowerCase() &&
      input8.trim().toLowerCase() === words[7].trim().toLowerCase()
    ) {
      navigation.navigate('Home', { mnemonic, walletAddress: address });
    } else {
      Alert.alert(
        'Incorrect',
        'The entered words do not match your recovery phrase.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Confirm Recovery Phrase</Text>
          <Text style={styles.subtitle}>
            Enter the 4th and 8th word of your recovery phrase
          </Text>

          {/* Recovery Phrase Display */}
          <View style={styles.phraseBox}>
            <View style={styles.wordGrid}>
              {words.map((word, i) => (
                <View key={i} style={styles.wordRow}>
                  <Text style={styles.wordIndex}>{i + 1}</Text>
                  <View style={styles.wordBox}>
                    {i === 3 || i === 7 ? (
                      <TextInput
                        style={styles.input}
                        value={i === 3 ? input4 : input8}
                        autoCapitalize="none"
                        onChangeText={(text) =>
                          i === 3 ? setInput4(text.toLowerCase()) : setInput8(text.toLowerCase())
                        }
                      />
                    ) : (
                      <Text style={styles.word}>{word}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Tip Box */}
          <View style={styles.recommendBox}>
            <Ionicons
              name="alert-circle"
              size={18}
              color="#facc15"
              style={{ marginRight: 8 }}
            />
            <View>
              <Text style={styles.recommendTitle}>Tip</Text>
              <Text style={styles.recommendText}>
                Make sure you enter the correct words from your saved phrase.
              </Text>
            </View>
          </View>

          {/* Learn More Link */}
          <View style={styles.infoBox}>
            <Ionicons
              name="open-outline"
              size={16}
              color="#3b82f6"
              style={{ marginRight: 6 }}
            />
            <TouchableOpacity onPress={() => setShowInfoModal(true)}>
              <Text style={styles.infoLink}>
                Know what a recovery phrase is and precautions to follow.
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Confirm Button */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.continueBtn} onPress={handleConfirm}>
            <Text style={styles.continueText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Learn More Modal */}
        <Modal
          visible={showInfoModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowInfoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalCloseIcon}
                onPress={() => setShowInfoModal(false)}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>What is Recovery Phrase?</Text>
              <Text style={styles.modalText}>
                A recovery phrase is a set of 12 or 24 words that lets you
                restore access to your wallet. Anyone with this phrase can fully
                access your wallet and its funds.
              </Text>

              <Text style={styles.modalSubtitle}>
                What if I lose the Recovery Phrase?
              </Text>
              <Text style={styles.modalText}>
                If you lose your recovery phrase, it cannot be retrieved. Make
                sure it's stored safely and accessible only to you.
              </Text>

              <Text style={styles.modalSubtitle}>Precautions to follow:</Text>
              <Text style={styles.modalText}>
                Keep your recovery phrase private. Don’t share or type it
                anywhere. No one from our team will ever ask for your recovery
                phrase.
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  scrollContainer: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 16,
  },
  phraseBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordRow: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  wordIndex: {
    color: '#fff',
    width: 20,
    fontSize: 14,
    textAlign: 'right',
    marginRight: 8,
  },
  wordBox: {
    backgroundColor: '#363636',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  word: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  input: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    padding: 0,
  },
  recommendBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1e1e1e',
    borderColor: '#facc15',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  recommendTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  recommendText: {
    color: '#fff',
    fontSize: 11,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#3b82f6',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 22,
  },
  infoLink: {
    color: '#3b82f6',
    fontSize: 12,
  },
  bottomButtonContainer: {
    paddingBottom: 20,
    paddingTop: 4,
  },
  continueBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    paddingTop: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 14,
    marginBottom: 6,
  },
  modalText: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 20,
  },
});
