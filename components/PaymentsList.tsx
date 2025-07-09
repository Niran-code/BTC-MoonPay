import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { Payment as PaymentT, PaymentType } from '@breeztech/react-native-breez-sdk-liquid';
import { RootState } from '../store';

function PaymentItem({ payment, index }: { payment: PaymentT; index: number }) {
  return (
    <View
      key={`payment-${index}`}
      style={{
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderColor: '#333',
        borderBottomWidth: 1,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <View>
          <Text style={{ fontSize: 16, color: 'white' }}>
            {payment.paymentType === PaymentType.SEND ? '-' : '+'}
            {payment.amountSat} SAT
          </Text>
          <Text style={{ fontSize: 12, color: 'gray', fontStyle: 'italic' }}>
            {payment.details?.description ?? 'No description'}
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: 'gray' }}>
          {payment.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

export default function PaymentsList() {
  const payments = useAppSelector((state: RootState) => state.payments);

  return (
    <View style={{ flex: 1 }}>
      {payments.length > 0 ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {payments.map((payment: PaymentT, index: number) => (
            <PaymentItem key={`payment-${index}`} payment={payment} index={index} />
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'gray', fontSize: 16, opacity: 0.5 }}>
            No Payments Yet
          </Text>
        </View>
      )}
    </View>
  );
}
