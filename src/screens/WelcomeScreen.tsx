import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  Animated, 
  Easing,
  Alert,
  Modal,
  Switch,
  Vibration
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Welcome: undefined;
  Chat: undefined;
  Enlightenment: undefined;
  Settings: undefined;
};

type WelcomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Welcome'>;
};

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [showCookieModal, setShowCookieModal] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupCount, setPopupCount] = useState(0);
  const [randomTip, setRandomTip] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [buttonMoved, setButtonMoved] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const shakeValue = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;
  
  // Random annoying tips
  const annoyingTips = [
    "Did you know? Blinking too much can strain your eyes!",
    "Pro tip: Breathe manually for better focus!",
    "Fun fact: Your nose is always visible, but your brain ignores it!",
    "Reminder: You're now aware of your tongue's position in your mouth!",
    "Remember: You can feel your clothes touching your skin right now!",
  ];
  
  useEffect(() => {
    // Start spinning logo
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    // Show random tips every 20 seconds
    const tipInterval = setInterval(() => {
      setRandomTip(annoyingTips[Math.floor(Math.random() * annoyingTips.length)]);
      setShowPopup(true);
      Vibration.vibrate(200);
      
      // Hide tip after 5 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    }, 20000);
    
    // Start bounce animation for the card
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
    
    return () => clearInterval(tipInterval);
  }, []);
  
  // Spin animation for logo
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Bounce animation for card
  const cardScale = bounceValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.02, 1]
  });
  
  const shakeButton = () => {
    Animated.sequence([
      Animated.timing(shakeValue, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const handleBeginJourney = () => {
    if (popupCount < 2) {
      setPopupCount(popupCount + 1);
      Alert.alert(
        "Are you sure?",
        "Therapy might make you question everything! Continue?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => shakeButton() }
        ]
      );
    } else {
      navigation.navigate('Chat');
    }
  };
  
  const handleToggleSwitch = () => {
    setSwitchValue(!switchValue);
    if (!buttonMoved) {
      setButtonMoved(true);
    } else {
      setButtonMoved(false);
    }
    Vibration.vibrate(100);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.white, colors.overlay]}
        style={[styles.gradient, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>therapeigh</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.logoContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <MaterialCommunityIcons name="brain" size={80} color={colors.primary} />
            </Animated.View>
            <Text style={styles.subtitle}>Your Unconventional AI Therapist</Text>
          </View>

          <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
            <Text style={styles.featureTitle}>What to expect:</Text>
            <View style={styles.featureList}>
              {[
                { icon: '🤔', text: 'Initially questionable advice' },
                { icon: '😅', text: 'Typos and confusion' },
                { icon: '🌟', text: 'Gradual enlightenment' },
                { icon: '🎯', text: 'Eventually helpful insights' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
          
          {/* Unnecessary settings toggle */}
          <View style={styles.settingsRow}>
            <Text style={styles.settingsText}>Enable power-saving mode</Text>
            <Switch
              value={switchValue}
              onValueChange={handleToggleSwitch}
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={switchValue ? colors.primary : colors.darkGray}
            />
          </View>

          <Text style={styles.disclaimer}>
            Warning: This is a satirical app. For real mental health support,
            please consult licensed professionals.
          </Text>

          <Animated.View style={[
            styles.buttonContainer, 
            buttonMoved && styles.buttonMoved,
            { transform: [{ translateX: shakeValue }] }
          ]}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleBeginJourney}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Begin Your Journey</Text>
                <MaterialCommunityIcons name="arrow-right" size={24} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Battery indicator */}
          <View style={styles.batteryContainer}>
            <View style={styles.battery}>
              <View style={[styles.batteryLevel, { width: '17%' }]} />
            </View>
            <Text style={styles.batteryText}>App battery: 17%</Text>
          </View>
        </View>
      </LinearGradient>
      
      {/* Cookie consent modal */}
      <Modal
        visible={showCookieModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>We use cookies!</Text>
            <Text style={styles.modalText}>
              We use cookies to track literally everything you do. Your data might be sold to at least 237 third-party advertisers.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setShowCookieModal(false);
                Vibration.vibrate(300);
              }}
            >
              <Text style={styles.modalButtonText}>Whatever, close this</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Random tips popup */}
      {showPopup && (
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupText}>{randomTip}</Text>
            <TouchableOpacity 
              style={styles.popupClose}
              onPress={() => setShowPopup(false)}
            >
              <Text style={styles.popupCloseText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  settingsButton: {
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.darkGray,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: width - 48,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginVertical: 24,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 20,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  disclaimer: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: width - 48,
    marginBottom: 24,
  },
  buttonMoved: {
    alignSelf: 'flex-start',
  },
  button: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: width - 60,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  // Popup styles
  popupContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  popup: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    width: width - 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  popupText: {
    color: colors.white,
    flex: 1,
    marginRight: 10,
  },
  popupClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCloseText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  // Settings
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width - 48,
    marginBottom: 10,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsText: {
    fontSize: 16,
    color: colors.darkGray,
  },
  // Battery
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  battery: {
    width: 30,
    height: 14,
    borderWidth: 1,
    borderColor: colors.darkGray,
    borderRadius: 3,
    marginRight: 5,
    padding: 1,
  },
  batteryLevel: {
    height: '100%',
    backgroundColor: colors.error,
    borderRadius: 1,
  },
  batteryText: {
    fontSize: 12,
    color: colors.darkGray,
  },
}); 