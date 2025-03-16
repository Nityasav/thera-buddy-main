import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Preference keys for AsyncStorage
const PREFS_KEY = 'therapeigh_preferences';

// Define the shape of our settings state
export interface AppSettings {
  darkMode: boolean;
  invertMode: boolean;
  emojiDensity: number;
  chatbotPersonality: string;
  textSize: number;
  showTypingDuration: number;
  backgroundPattern: string;
  soundEffects: boolean;
  confettiMode: boolean;
  avatarStyle: string;
  bubbleShape: string;
  randomCrashes: boolean;
}

// Default settings
const defaultSettings: AppSettings = {
  darkMode: false,
  invertMode: false,
  emojiDensity: 5,
  chatbotPersonality: 'chad',
  textSize: 16,
  showTypingDuration: 5,
  backgroundPattern: 'none',
  soundEffects: false,
  confettiMode: false,
  avatarStyle: 'modern',
  bubbleShape: 'rounded',
  randomCrashes: true,
};

// Create context with shape of settings and updater function
interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(PREFS_KEY);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Update a specific setting
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Save all settings to AsyncStorage
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(settings));
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving settings:', error);
      return Promise.reject(error);
    }
  };

  // Reset all settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Save settings whenever they change
  useEffect(() => {
    if (loaded) {
      saveSettings();
    }
  }, [settings, loaded]);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, saveSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 