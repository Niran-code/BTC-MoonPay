// src/store/reducers/wallet.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  mnemonic: string | null;
}

const initialState: WalletState = {
  mnemonic: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setMnemonic: (state, action: PayloadAction<string>) => {
      state.mnemonic = action.payload;
    },
    clearMnemonic: (state) => {
      state.mnemonic = null;
    },
  },
});

export const { setMnemonic, clearMnemonic } = walletSlice.actions;
export default walletSlice.reducer;
