import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import MnemonicDisplayScreen from '../screens/MnemonicDisplayScreen';
import { PrepareScreen, ConfirmScreen, FinalScreen } from '../screens/PaymentScreens';
import SendFlow from '../screens/SendFlow';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        {/* Initial Screens */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MnemonicDisplay" component={MnemonicDisplayScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />

        {/* Receive Flow Screens as Transparent Modals */}
        <Stack.Group
          screenOptions={{
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen
            name="ReceivePrepare"
            component={PrepareScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="ReceiveConfirm"
            component={ConfirmScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="ReceiveFinal"
            component={FinalScreen}
            options={{ gestureEnabled: true }}
          />
        </Stack.Group>

        {/* Send Flow as a Transparent Modal */}
        <Stack.Screen
          name="SendFlow"
          component={SendFlow}
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
