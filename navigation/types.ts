export type RootStackParamList = {
  Splash: undefined;
  Home: { mnemonic: string };
  MnemonicDisplay: { mnemonic: string };
  address: undefined;

  Receive: undefined;
  // Receive screens
  ReceivePrepare: undefined;
  ReceiveConfirm: undefined;
  ReceiveFinal: undefined;
  selectedPaymentMethod:undefined;

  // Send flow wrapper screen
  SendFlow: undefined;
};
