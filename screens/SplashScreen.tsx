import React, { useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { initiateBreezSdk } from '../src/utils/initializeBreezSDK';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [mnemonic, setMnemonic] = useState('');

  const handleCreateWallet = async () => {
    try {
      const newMnemonic = generateMnemonic(wordlist);
      await initiateBreezSdk(newMnemonic);
      navigation.navigate('MnemonicDisplay', { mnemonic: newMnemonic });
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert('Error', 'Failed to create wallet.');
    }
  };

  const handleImport = async () => {
    if (mnemonic.trim().split(' ').length < 12) {
      Alert.alert('Invalid mnemonic', 'Please enter a valid 12-word mnemonic.');
      return;
    }

    try {
      await initiateBreezSdk(mnemonic.trim());
      setModalVisible(false);
      navigation.replace('Home', { mnemonic: mnemonic.trim() });
    } catch (error) {
      console.error('Error importing wallet:', error);
      Alert.alert('Error', 'Failed to import wallet. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/synq-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Welcome text */}
      <Text style={styles.welcomeText}>Welcome to SynQ Payments</Text>



      {/* Subtitle with self-custodial mention */}
      <Text style={styles.subText}>
        Self-custodial wallet with seamless Liquid & Lightning
        power your Bitcoin experience with speed and privacy.
      </Text>

      {/* Button section */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateWallet}>
          <Text style={styles.buttonText}>Create New Wallet</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.buttonText, { color: '#0088CC' }]}>
            I already have a wallet
          </Text>
        </TouchableOpacity>
      </View>

      {/* Import Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Recovery Phrase</Text>
            <TextInput
              placeholder="12 or 24 word mnemonic"
              multiline
              numberOfLines={4}
              value={mnemonic}
              onChangeText={setMnemonic}
              style={styles.input}
              placeholderTextColor="#888"
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalButton} onPress={handleImport}>
                <Text style={styles.modalButtonText}>Import</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#6c757d' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Rubik-Medium',
    textAlign: 'center',
    marginBottom: 60,
  },
  subText: {
    color: '#C0C0C0',
    fontSize: 15,
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
    marginBottom: 90,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: 24,
  },
  primaryButton: {
    backgroundColor: '#0088CC',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0088CC',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
  orText: {
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 16,
    fontFamily: 'Rubik-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(46, 43, 43, 0.4)',
    textAlignVertical: 'top',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#0088CC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
