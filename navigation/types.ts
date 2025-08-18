export type RootStackParamList = {
  Splash: undefined;
  Home: { mnemonic: string; walletAddress: string };
  MnemonicDisplay: { mnemonic: string };
  Address: undefined; // capitalized for consistency
 ConfirmRecoveryPhrase: { mnemonic: string; address: string };

  // Receive flow
  Receive: undefined;
  ReceivePrepare: undefined;
  ReceiveConfirm: undefined;
  ReceiveFinal: undefined;

  // Send flow
  SendFlow: undefined;

  // Other params
  SelectedPaymentMethod: undefined;
};
