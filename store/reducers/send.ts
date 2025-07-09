import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PrepareSendResponse, SendPaymentResponse } from '@breeztech/react-native-breez-sdk-liquid';

const initialState: {
  prepareResponse?: PrepareSendResponse,
  sendResponse?: SendPaymentResponse,
} = {};

export const sendSlice = createSlice({
  name: 'send', // ✅ Corrected
  initialState,
  reducers: {
    setSend: (state, action: PayloadAction<Partial<typeof initialState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { setSend } = sendSlice.actions;

export default sendSlice.reducer;
