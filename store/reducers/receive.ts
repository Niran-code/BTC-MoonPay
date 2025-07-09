import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PrepareReceiveResponse, ReceivePaymentResponse, PaymentMethod } from '@breeztech/react-native-breez-sdk-liquid';

// Add MoonPay as a special payment method type
type ExtendedPaymentMethod = PaymentMethod | 'MOONPAY';

interface ReceiveState {
  prepareResponse?: PrepareReceiveResponse;
  receiveResponse?: ReceivePaymentResponse;
  selectedPaymentMethod?: ExtendedPaymentMethod;
  moonPayUrl?: string;  // New field for MoonPay URL
}

const initialState: ReceiveState = {};

export const receiveSlice = createSlice({
  name: 'receive',
  initialState,
  reducers: {
    setReceive: (state, action: PayloadAction<{
      prepareResponse?: PrepareReceiveResponse;
      receiveResponse?: ReceivePaymentResponse;
      selectedPaymentMethod?: ExtendedPaymentMethod;
      moonPayUrl?: string;
    }>) => {
      // Clear opposite fields when setting new values
      if (action.payload.moonPayUrl) {
        state.prepareResponse = undefined;
        state.receiveResponse = undefined;
        state.moonPayUrl = action.payload.moonPayUrl;
      } else if (action.payload.prepareResponse) {
        state.moonPayUrl = undefined;
        state.prepareResponse = action.payload.prepareResponse;
      }

      if (action.payload.receiveResponse) {
        state.receiveResponse = action.payload.receiveResponse;
      }

      if (action.payload.selectedPaymentMethod !== undefined) {
        state.selectedPaymentMethod = action.payload.selectedPaymentMethod;
      }
    },
    clearReceive: () => initialState,
  },
});

// Export actions
export const { setReceive, clearReceive } = receiveSlice.actions;

export default receiveSlice.reducer;
