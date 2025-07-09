import infoReducer from './reducers/info';
import receiveReducer from './reducers/receive';
import sendReducer from './reducers/send';
import paymentsReducer from './reducers/payments';
import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './reducers/wallet';

export const store = configureStore({
  reducer: {
    info: infoReducer,
    receive: receiveReducer,
    send: sendReducer,
    payments: paymentsReducer,
    wallet: walletReducer, // 👈 Add this line
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store

