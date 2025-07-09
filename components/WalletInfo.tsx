// components/WalletInfo.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { WalletInfo as WalletInfoT } from '@breeztech/react-native-breez-sdk-liquid';

export default function WalletInfo({ info }: { info: WalletInfoT }) {
  const formatSat = (value: number) =>
    new Intl.NumberFormat('en-US').format(value);

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
      }}
    >
      <Text style={{ fontSize: 28, color: '#0184fb', fontWeight: 'bold' }}>
        {formatSat(info.balanceSat)} ₿
      </Text>

      {info.pendingReceiveSat > 0 && (
        <Text style={{ color: '#606060', fontStyle: 'italic', marginTop: 4 }}>
          Pending inward: {formatSat(info.pendingReceiveSat)} ₿
        </Text>
      )}

      {info.pendingSendSat > 0 && (
        <Text style={{ color: '#606060', fontStyle: 'italic', marginTop: 4 }}>
          Pending outward: {formatSat(info.pendingSendSat)} ₿
        </Text>
      )}
    </View>
  );
}
