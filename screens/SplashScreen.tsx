import React, { useState } from 'react';
import {
  View,
  Text,
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
import Ionicons from 'react-native-vector-icons/Ionicons';

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
      navigation.replace('Home', { mnemonic: mnemonic.trim(), walletAddress: '' });
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

      {/* Subtitle */}
      <Text style={styles.subText}>
        Self-custodial wallet with seamless Liquid & Lightning
        power your Bitcoin experience with speed and privacy.
      </Text>

      {/* Buttons */}
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
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.importContainer}>

            {/* Back Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            {/* Middle Content */}
            <View style={styles.centerContent}>
              <Text style={styles.importTitle}>Import Wallet</Text>
              <TextInput
                placeholder="Enter your 12-word mnemonic"
                multiline
                value={mnemonic}
                onChangeText={setMnemonic}
                style={styles.importInput}
                placeholderTextColor="#8E8E93"
              />
            </View>

            {/* Bottom Buttons */}
            <View style={styles.bottomButtons}>
              <TouchableOpacity style={styles.importButton} onPress={handleImport}>
                <Text style={styles.importButtonText}>Import</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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

  /** Modal Styles **/
  modalOverlay: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  importContainer: {
    flex: 1,
    backgroundColor: '#0E0E10',
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 6,
    fontFamily: 'Rubik-Medium',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  importTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Rubik-Medium',
    marginBottom: 20,
  },
  importInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  importButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
});
