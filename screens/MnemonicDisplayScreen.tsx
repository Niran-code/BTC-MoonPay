import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Clipboard,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

type MnemonicDisplayScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MnemonicDisplay'
>;

type MnemonicDisplayScreenRouteProp = RouteProp<
  RootStackParamList,
  'MnemonicDisplay'
>;

const MnemonicDisplayScreen = () => {
  const navigation = useNavigation<MnemonicDisplayScreenNavigationProp>();
  const route = useRoute<MnemonicDisplayScreenRouteProp>();
  const { mnemonic } = route.params;

  const [copied, setCopied] = useState(false);
  const mnemonicWords = mnemonic.split(' ');

  const copyToClipboard = () => {
    Clipboard.setString(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Copied', 'Mnemonic copied to clipboard.');
  };

  const handleContinue = () => {
    navigation.replace('Home', { mnemonic });
  };

  const downloadMnemonic = () => {
    Alert.alert('Download', 'Mnemonic download triggered.');
    // Future implementation here
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fullScreen}>
        <View>
          <Text style={styles.title}>Your Recovery Phrase</Text>

          <View style={styles.phraseContainer}>
            {mnemonicWords.map((word, index) => (
              <View key={index} style={styles.wordBox}>
                <Text style={styles.wordNumber}>{index + 1}.</Text>
                <Text style={styles.wordText}>{word}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.greyButton]}
              onPress={copyToClipboard}
            >
              <MaterialIcons
                name={copied ? 'check' : 'content-copy'}
                size={20}
                color="white"
              />
              <Text style={styles.buttonText}>
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.blueButton]}
              onPress={downloadMnemonic}
            >
              <MaterialIcons name="file-download" size={20} color="white" />
              <Text style={styles.buttonText}>Download</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.warning}>
            ⚠️ We don't store your mnemonics. Back them up securely — if lost,
            your wallet can't be recovered.
          </Text>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to Wallet</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MnemonicDisplayScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
    padding: 20,
    justifyContent: 'flex-start',
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'space-between', // ADDED TO MOVE BUTTON TO BOTTOM
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 25,
  },
  phraseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  wordBox: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordNumber: {
    color: '#8E8E93',
    marginRight: 8,
    width: 24,
  },
  wordText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    minHeight: 50,
  },
  blueButton: {
    backgroundColor: '#007AFF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  greyButton: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  warning: {
    color: '#FFA500',
    lineHeight: 22,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    marginTop:35,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
