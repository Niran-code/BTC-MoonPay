// utils/initiateBreezSdk.ts
import {
  connect,
  getInfo,
  listPayments,
  addEventListener,
  defaultConfig,
  LiquidNetwork,
  SdkEvent,
  SdkEventVariant,
} from '@breeztech/react-native-breez-sdk-liquid';

import { store } from '../../store';
import { setInfo } from '../../store/reducers/info';
import { setPayments } from '../../store/reducers/payments';

async function onEvent(e: SdkEvent) {
  if (e.type === SdkEventVariant.SYNCED) {
    try {
      const [info, payments] = await Promise.all([
        getInfo(),
        listPayments({ limit: undefined }),
      ]);

      // Defer state update to avoid UI freeze
      setTimeout(() => {
        store.dispatch(setInfo(info));
        store.dispatch(setPayments(payments));
      }, 0);
    } catch (err) {
      console.error('Error in Breez SYNCED event:', err);
    }
  }
}

export async function initiateBreezSdk(mnemonic: string): Promise<void> {
  try {
    const config = await defaultConfig(
      LiquidNetwork.MAINNET, // Corrected to MAINNET (or check SDK docs for exact enum)
      process.env.EXPO_PUBLIC_BREEZ_API_KEY!
    );

    // Connect before any heavy operations
    await connect({ config, mnemonic });

    // Setup listener without blocking UI
    addEventListener(onEvent);
  } catch (err) {
    console.error('Error initiating Breez SDK:', err);
    throw err;
  }
}
