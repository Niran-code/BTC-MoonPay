import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import PaymentsList from '../components/PaymentsList';
import { getInfo, prepareBuyBitcoin, buyBitcoin, BuyBitcoinProvider } from '@breeztech/react-native-breez-sdk-liquid';
import { setInfo } from '../store/reducers/info';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const horizontalPadding = 30;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const dispatch = useAppDispatch();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mnemonic = route.params?.mnemonic ?? '';
  const info = useAppSelector((state) => state.info);

  const [view, setView] = useState<'assets' | 'history'>('assets');
  const [selectedCoin, setSelectedCoin] = useState('Bitcoin');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [introStep, setIntroStep] = useState(0);
  const [showIntroLoader, setShowIntroLoader] = useState(true);

  // MoonPay states
  const [showMoonPayModal, setShowMoonPayModal] = useState(false);
  const [moonPayLoading, setMoonPayLoading] = useState(false);
  const [moonPayError, setMoonPayError] = useState<string | null>(null);
  const [moonPayAmount, setMoonPayAmount] = useState('25000');

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const steps = [
      () => setIntroStep(0),
      () => setIntroStep(1),
      () => setIntroStep(2),
      () => setShowIntroLoader(false),
    ];
    steps.forEach((stepFn, i) => {
      setTimeout(stepFn, i * 1000);
    });
  }, []);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const fetchedInfo = await getInfo();
        dispatch(setInfo(fetchedInfo));
      } catch (err) {
        console.error('Error fetching wallet info:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!info?.walletInfo) {
      fetchWalletInfo();
    } else {
      setIsLoading(false);
    }
  }, [dispatch, info]);

  useEffect(() => {
    const toValue = view === 'assets' ? 0 : (width - horizontalPadding * 2) / 2;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [slideAnim, view]);

  const handleMoonPayPurchase = async () => {
    setMoonPayLoading(true);
    setMoonPayError(null);

    try {
      // First clear any cached MoonPay session data
      // Removed clearCache as it is not exported by the SDK

      const amountSat = Math.max(Number(moonPayAmount) || 25000);

      // Generate fresh MoonPay URL with retry logic
      let moonPayUrl;
      let retries = 0;
      const maxRetries = 2;

      while (retries < maxRetries) {
        try {
          const prepareRes = await prepareBuyBitcoin({
            provider: BuyBitcoinProvider.MOONPAY,
            amountSat,
          });

          moonPayUrl = await buyBitcoin({
            prepareResponse: prepareRes,
            redirectUrl: `myapp://moonpay?ts=${Date.now()}&ref=${Math.random().toString(36).substring(2, 8)}`,
          });

          if (typeof moonPayUrl === 'string') {
            break;
          }
        } catch (retryError) {
          if (retries === maxRetries - 1) {throw retryError;}
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        }
        retries++;
      }

      if (typeof moonPayUrl !== 'string') {
        throw new Error('Failed to generate MoonPay URL after retries');
      }

      // Close modal and open MoonPay URL
      setShowMoonPayModal(false);
      Linking.openURL(moonPayUrl);
    } catch (err: any) {
      console.error('MoonPay error:', err);
      const errorMessage = err.message.includes('Signature check failed')
        ? 'Temporary MoonPay service issue. Please try again in a moment.'
        : err.message || 'Failed to process MoonPay purchase';
      setMoonPayError(errorMessage);
    } finally {
      setMoonPayLoading(false);
    }
  };

  if (showIntroLoader || isLoading) {
    const messages = [
      'Fetching mnemonic phrases',
      'Generating secure keys',
      'Creating your secure wallet',
    ];

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <Text style={{ fontSize: 18, color: '#fff', marginBottom: 10 }}>
          {messages[introStep]}
        </Text>
        <ActivityIndicator size="large" color="#0184fb" />
      </View>
    );
  }

  const sats = info?.walletInfo?.balanceSat?.toLocaleString() ?? '0';
  const usdValue = ((info?.walletInfo?.balanceSat ?? 0) * 0.0003 / 100000000).toFixed(2);

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      {/* Top Bar */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
      }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => setShowDropdown(!showDropdown)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            <Image
              source={
                selectedCoin === 'Bitcoin'
                  ? require('../assets/bitcoin-icon.png')
                  : require('../assets/eth-icon.png')
              }
              style={{ width: 20, height: 20, marginRight: 6, borderRadius: 5 }}
            />
            <Text style={{ color: '#fff', fontSize: 16 }}>{selectedCoin}</Text>
            <Feather name="chevron-down" size={20} color="#fff" style={{ marginLeft: 5 }} />
          </Pressable>
          <Pressable>
            <Feather name="more-vertical" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Dropdown */}
      {showDropdown && (
        <View style={{
          position: 'absolute',
          top: 100,
          right: 20,
          backgroundColor: '#1e1e1e',
          borderRadius: 12,
          paddingVertical: 8,
          paddingHorizontal: 12,
          zIndex: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 10,
        }}>
          {[{ name: 'Bitcoin', icon: require('../assets/bitcoin-icon.png') },
            { name: 'Ethereum', icon: require('../assets/eth-icon.png') },
          ].map((coin) => (
            <Pressable
              key={coin.name}
              onPress={() => {
                setSelectedCoin(coin.name);
                setShowDropdown(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 5,
              }}
            >
              <Image source={coin.icon} style={{ width: 22, height: 22, marginRight: 10, borderRadius: 5 }} />
              <Text style={{ color: '#fff', fontSize: 15 }}>{coin.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Wallet Title */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>My Wallet</Text>
      </View>

      {/* Balance Display */}
      <View style={{ padding: 20, alignItems: 'flex-start' }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{sats} SATS</Text>
      </View>

      {/* Action Buttons: Send, Receive, Buy */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 20,
          marginHorizontal: 20,
        }}
      >
        <Pressable
          onPress={() => navigation.navigate('SendFlow')}
          style={{
            backgroundColor: '#0184fb',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            marginRight: 6,
            flexDirection: 'row',
          }}
        >
          <Feather name="arrow-up-right" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Send</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('ReceivePrepare')}
          style={{
            backgroundColor: '#0184fb',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            marginHorizontal: 6,
            flexDirection: 'row',
          }}
        >
          <Feather name="arrow-down-left" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Receive</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowMoonPayModal(true)}
          style={{
            backgroundColor: '#0184fb',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            marginLeft: 6,
            flexDirection: 'row',
          }}
        >
          <Feather name="credit-card" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Buy</Text>
        </Pressable>
      </View>

      {/* Tab Navigation */}
      <View style={{ marginTop: 50, paddingHorizontal: horizontalPadding }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingBottom: 10,
        }}>
          {(['assets', 'history'] as const).map((tab) => (
            <Pressable key={tab} onPress={() => setView(tab)} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{
                fontSize: 18,
                color: view === tab ? '#fff' : 'gray',
                fontWeight: view === tab ? 'bold' : 'normal',
              }}>
                {tab === 'assets' ? 'Assets' : 'History'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Animated.View
          style={{
            height: 3,
            width: (width - horizontalPadding * 2) / 2,
            backgroundColor: '#0184fb',
            position: 'absolute',
            bottom: 0,
            left: Animated.add(slideAnim, new Animated.Value(horizontalPadding)),
          }}
        />
      </View>

      {/* Tab Content */}
      {view === 'assets' ? (
        <View style={{ padding: 20 }}>
          <View style={{
            backgroundColor: '#1e1e1e',
            borderRadius: 10,
            padding: 15,
            borderWidth: 1,
            borderColor: '#333',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={require('../assets/sats-icon.png')}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    marginRight: 10,
                  }}
                />
                <Text style={{ color: '#fff', fontSize: 18 }}>SATS</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#fff', fontSize: 18 }}>{sats}</Text>
                <Text style={{ color: 'gray', fontSize: 14 }}>${usdValue}</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <PaymentsList />
        </View>
      )}

      {/* MoonPay Modal */}
      <Modal
        visible={showMoonPayModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMoonPayModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: '#2e2e2e',
            borderRadius: 12,
            padding: 20,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: 20,
              color: '#fff',
            }}>Buy Bitcoin with MoonPay</Text>

            <Text style={{
              fontSize: 14,
              color: '#fff',
              marginBottom: 8,
            }}>Amount (SATS)</Text>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                color: '#fff',
                backgroundColor: '#424242',
              }}
              keyboardType="numeric"
              placeholder="25000"
              placeholderTextColor="#888"
              value={moonPayAmount}
              onChangeText={setMoonPayAmount}
            />

            {moonPayError && (
              <Text style={{
                color: '#ff4444',
                textAlign: 'center',
                marginBottom: 10,
              }}>{moonPayError}</Text>
            )}

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
            }}>
              <Pressable
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 6,
                  alignItems: 'center',
                  marginRight: 10,
                  backgroundColor: '#3A3A3C',
                }}
                onPress={() => setShowMoonPayModal(false)}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
              </Pressable>

              <Pressable
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 6,
                  alignItems: 'center',
                  backgroundColor: '#0184fb',
                  opacity: moonPayLoading ? 0.7 : 1,
                }}
                onPress={handleMoonPayPurchase}
                disabled={moonPayLoading}
              >
                {moonPayLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Continue</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
