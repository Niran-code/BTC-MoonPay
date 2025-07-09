// index.js

import 'react-native-get-random-values';  // Polyfill for crypto.getRandomValues
import { Buffer } from 'buffer';           // Buffer polyfill for React Native

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

import { AppRegistry } from 'react-native';
import App from './App';                   // Adjust if your App.js is somewhere else
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
