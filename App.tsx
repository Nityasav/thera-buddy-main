import React, { useState, useEffect, ErrorInfo, Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5, Feather, Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, Modal, TouchableOpacity, Alert, Vibration, StyleSheet } from 'react-native';
import { colors } from './src/theme/colors';
import { SettingsProvider, useSettings } from './src/utils/SettingsContext';

// Create the necessary type for our navigation
export type RootStackParamList = {
  Welcome: undefined;
  Chat: undefined;
  Enlightenment: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Import our screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import EnlightenmentScreen from './src/screens/EnlightenmentScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Main app component
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showUserAgreement, setShowUserAgreement] = useState(false);
  const [appCrashed, setAppCrashed] = useState(false);
  const { settings } = useSettings();
  
  // Fake loading screen
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      
      // Show fake update dialog after a delay
      setTimeout(() => {
        setShowUpdateDialog(true);
      }, 30000);
      
      // Show fake crash occasionally based on randomCrashes setting
      if (settings.randomCrashes && Math.random() < 0.05) {
        setTimeout(() => {
          Vibration.vibrate(500);
          setAppCrashed(true);
        }, 60000);
      }
    }, 3000);
    
    // Simulated terms update
    setTimeout(() => {
      setShowUserAgreement(true);
    }, 10000);
    
    return () => clearTimeout(loadingTimer);
  }, [settings.randomCrashes]);
  
  // Simulate restarting app after crash
  const handleRestart = () => {
    setAppCrashed(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "App Restarted",
        "We've diagnosed and fixed all issues. JK! It'll probably crash again soon."
      );
    }, 2000);
  };

  // Get container style based on settings
  const getContainerStyle = () => {
    let style: any = { backgroundColor: colors.white };
    
    if (settings.darkMode) {
      style.backgroundColor = '#1a1a1a';
    }
    
    if (settings.invertMode) {
      style = { ...style, transform: [{ scaleX: -1 }] };
    }
    
    return style;
  };

  // Get text color based on dark mode setting
  const getTextColor = () => {
    return settings.darkMode ? '#fff' : colors.primary;
  };

  // Fake loading screen
  if (isLoading) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, getContainerStyle()]}>
        <MaterialCommunityIcons name="brain" size={60} color={getTextColor()} />
        <ActivityIndicator size="large" color={getTextColor()} style={{ marginTop: 20 }} />
        <Text style={{ marginTop: 20, color: getTextColor(), fontWeight: 'bold', fontSize: 16 }}>
          {Math.random() < 0.3 ? "Loading meaningless content..." : "Loading therapy experience..."}
        </Text>
        <Text style={{ marginTop: 10, color: settings.darkMode ? '#aaa' : colors.darkGray, fontSize: 12, textAlign: 'center', maxWidth: '80%' }}>
          This is taking longer than necessary to make you feel like something important is happening.
        </Text>
      </View>
    );
  }
  
  // Fake crash screen
  if (appCrashed) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8d7da', padding: 20 }}>
        <Feather name="alert-triangle" size={60} color="#721c24" />
        <Text style={{ marginTop: 20, color: '#721c24', fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>
          Oops! The app has crashed
        </Text>
        <Text style={{ marginTop: 10, color: '#721c24', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          Looks like your negative energy was too much for our servers to handle.
        </Text>
        <TouchableOpacity 
          onPress={handleRestart}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: colors.white, fontWeight: 'bold' }}>Restart App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar style={settings.darkMode ? "light" : "dark"} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerStyle: {
              backgroundColor: settings.darkMode ? '#1a1a1a' : colors.white,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: settings.darkMode ? '#333' : colors.mediumGray,
            },
            headerTintColor: settings.darkMode ? '#fff' : colors.primary,
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: Math.min(18, settings.textSize),
            },
            headerTitleAlign: 'center',
            cardStyle: getContainerStyle(),
          }}
        >
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={({ navigation }) => ({
              title: "TheraPeigh",
              headerRight: () => (
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <Ionicons name="settings-outline" size={24} color={getTextColor()} />
                </TouchableOpacity>
              ),
            })}
          />
          
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ navigation }) => ({
              title: "Therapy Session",
              headerRight: () => (
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <Ionicons name="settings-outline" size={24} color={getTextColor()} />
                </TouchableOpacity>
              ),
            })}
          />
          
          <Stack.Screen
            name="Enlightenment"
            component={EnlightenmentScreen}
            options={{
              title: "Enlightened Mode",
            }}
          />
          
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="settings-outline" size={18} color={getTextColor()} style={{ marginRight: 8 }} />
                  <Text style={{ fontWeight: 'bold', color: getTextColor(), fontSize: 18 }}>settings</Text>
                </View>
              ),
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      
      {/* Fake update dialog */}
      <Modal
        visible={showUpdateDialog}
        transparent={true}
        animationType="fade"
      >
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 20
        }}>
          <View style={{ 
            backgroundColor: settings.darkMode ? '#333' : colors.white, 
            borderRadius: 12,
            padding: 20,
            width: '90%',
            alignItems: 'center'
          }}>
            <MaterialCommunityIcons name="update" size={40} color={colors.primary} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: settings.darkMode ? '#fff' : '#000' }}>Update Available</Text>
            <Text style={{ textAlign: 'center', marginBottom: 20, color: settings.darkMode ? '#ddd' : '#333' }}>
              A new version is available that adds even more annoying features! Update now?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: settings.darkMode ? '#555' : colors.lightGray, 
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  minWidth: '45%',
                  alignItems: 'center'
                }}
                onPress={() => {
                  setShowUpdateDialog(false);
                  setTimeout(() => {
                    Alert.alert(
                      "Update Scheduled",
                      "We'll automatically update when you're in the middle of an important therapy session!"
                    );
                  }, 500);
                }}
              >
                <Text style={{ color: settings.darkMode ? '#ddd' : colors.darkGray }}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: colors.primary, 
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  minWidth: '45%',
                  alignItems: 'center'
                }}
                onPress={() => {
                  setShowUpdateDialog(false);
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    Alert.alert(
                      "Update Failed",
                      "Couldn't update because your device is too enlightened. Try again later."
                    );
                  }, 3000);
                }}
              >
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>Update Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Fake user agreement dialog */}
      <Modal
        visible={showUserAgreement}
        transparent={true}
        animationType="fade"
      >
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 20
        }}>
          <View style={{ 
            backgroundColor: settings.darkMode ? '#333' : colors.white, 
            borderRadius: 12,
            padding: 20,
            width: '90%',
            maxHeight: '80%'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: settings.darkMode ? '#fff' : '#000' }}>Terms Update</Text>
            <Text style={{ fontSize: 14, marginBottom: 20, color: settings.darkMode ? '#ddd' : '#333' }}>
              We've updated our terms of service. The main changes include:
            </Text>
            <View style={{ maxHeight: 200, marginBottom: 20 }}>
              <Text style={{ fontSize: 12, marginBottom: 10, color: settings.darkMode ? '#ccc' : '#444' }}>
                1. We now collect your thoughts before you even type them.
              </Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: settings.darkMode ? '#ccc' : '#444' }}>
                2. Your therapy sessions may be used for training AI comedians.
              </Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: settings.darkMode ? '#ccc' : '#444' }}>
                3. We reserve the right to randomly replace advice with quotes from 90s sitcoms.
              </Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: settings.darkMode ? '#ccc' : '#444' }}>
                4. By using this app, you agree to occasionally experience unexplained feelings of déjà vu.
              </Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: settings.darkMode ? '#ccc' : '#444' }}>
                5. Enlightenment not guaranteed. Results may vary.
              </Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: settings.darkMode ? '#ccc' : '#444' }}>
                6. This agreement will self-destruct in 5 seconds after reading.
              </Text>
            </View>
            <TouchableOpacity 
              style={{ 
                backgroundColor: colors.primary, 
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 10
              }}
              onPress={() => {
                setShowUserAgreement(false);
                Vibration.vibrate(100);
                setTimeout(() => {
                  Alert.alert(
                    "Agreement Recorded",
                    "We've also agreed to several things on your behalf. You'll find out what they are later!"
                  );
                }, 500);
              }}
            >
              <Text style={{ color: colors.white, fontWeight: 'bold' }}>I Accept (No Choice Really)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Error boundary to catch and display errors
class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
            Something went wrong
          </Text>
          <Text style={{ marginBottom: 20, textAlign: 'center' }}>
            {this.state.error?.message || "Unknown error"}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8
            }}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={{ color: colors.white, fontWeight: 'bold' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Main export that wraps the app with SettingsProvider and ErrorBoundary
export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
