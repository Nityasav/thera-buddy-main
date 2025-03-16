import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  Vibration,
  Animated,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSettings } from '../utils/SettingsContext';

// Create the necessary type for our navigation
type RootStackParamList = {
  Welcome: undefined;
  Chat: undefined;
  Enlightenment: undefined;
  Settings: undefined;
};

type SettingsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const { settings, updateSetting, saveSettings, resetSettings } = useSettings();
  
  // Animation for save button
  const saveButtonScale = new Animated.Value(1);
  const [saveChangesPressed, setSaveChangesPressed] = useState(false);
  
  // Toggle setting with annoying popup chance
  const toggleSetting = (
    settingKey: 'darkMode' | 'invertMode' | 'soundEffects' | 'confettiMode' | 'randomCrashes',
    settingName: string
  ) => {
    const currentValue = settings[settingKey];
    
    // 30% chance of showing an annoying confirmation popup
    if (Math.random() < 0.3) {
      Alert.alert(
        `Confirm ${settingName} Change`,
        `Are you sure you want to ${!currentValue ? 'enable' : 'disable'} ${settingName}? This cannot be undone (except by toggling it again).`,
        [
          { text: "No thanks", style: "cancel" },
          { 
            text: "Yes, I'm sure", 
            onPress: () => {
              updateSetting(settingKey, !currentValue);
              // Vibrate for feedback
              Vibration.vibrate(50);
            }
          }
        ]
      );
    } else {
      updateSetting(settingKey, !currentValue);
      // Vibrate for feedback
      Vibration.vibrate(50);
    }
  };
  
  // Handle save button press
  const handleSaveChanges = async () => {
    try {
      await saveSettings();
      
      // Animate the save button
      Animated.sequence([
        Animated.timing(saveButtonScale, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(saveButtonScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Show random annoying alert
      if (Math.random() < 0.3) {
        setTimeout(() => {
          Alert.alert(
            "Settings Partially Saved",
            "Some settings may or may not have been saved. We're not really sure.",
            [{ text: "Um, okay?" }]
          );
        }, 500);
      } else {
        setTimeout(() => {
          Alert.alert(
            "Settings Saved",
            "Your preferences have been saved. They'll be applied... eventually.",
            [{ text: "Great!" }]
          );
        }, 500);
      }
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  };
  
  // Render personality option button
  const renderPersonalityButton = (personality: string, label: string, icon: string) => {
    return (
      <TouchableOpacity
        style={[
          styles.personalityButton,
          settings.chatbotPersonality === personality ? styles.personalityButtonActive : null
        ]}
        onPress={() => {
          updateSetting('chatbotPersonality', personality);
          Vibration.vibrate(50);
        }}
      >
        <MaterialCommunityIcons name={icon as any} size={24} color={settings.chatbotPersonality === personality ? colors.white : colors.primary} />
        <Text style={[
          styles.personalityButtonText,
          settings.chatbotPersonality === personality ? styles.personalityButtonTextActive : null
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render avatar style option button
  const renderAvatarStyleButton = (style: string, label: string, icon: string) => {
    return (
      <TouchableOpacity
        style={[
          styles.avatarStyleButton,
          settings.avatarStyle === style ? styles.avatarStyleButtonActive : null
        ]}
        onPress={() => {
          updateSetting('avatarStyle', style);
          Vibration.vibrate(50);
        }}
      >
        <MaterialCommunityIcons name={icon as any} size={24} color={settings.avatarStyle === style ? colors.white : colors.primary} />
        <Text style={[
          styles.avatarStyleText,
          settings.avatarStyle === style ? styles.avatarStyleTextActive : null
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render bubble shape option button
  const renderBubbleShapeButton = (shape: string, label: string, icon: string) => {
    return (
      <TouchableOpacity
        style={[
          styles.bubbleShapeButton,
          settings.bubbleShape === shape ? styles.bubbleShapeButtonActive : null
        ]}
        onPress={() => {
          updateSetting('bubbleShape', shape);
          Vibration.vibrate(50);
        }}
      >
        <Ionicons name={icon as any} size={24} color={settings.bubbleShape === shape ? colors.white : colors.primary} />
        <Text style={[
          styles.bubbleShapeText,
          settings.bubbleShape === shape ? styles.bubbleShapeTextActive : null
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render background pattern option button
  const renderBackgroundPatternButton = (pattern: string, label: string) => {
    return (
      <TouchableOpacity
        style={[
          styles.patternButton,
          settings.backgroundPattern === pattern ? styles.patternButtonActive : null
        ]}
        onPress={() => {
          updateSetting('backgroundPattern', pattern);
          Vibration.vibrate(50);
          
          // 20% chance of showing a popup about the pattern
          if (Math.random() < 0.2) {
            setTimeout(() => {
              Alert.alert(
                "Pattern Insight",
                `The ${label} pattern is scientifically proven to make therapy 0.002% more effective, according to a study we made up.`,
                [{ text: "Fascinating!" }]
              );
            }, 500);
          }
        }}
      >
        <Text style={[
          styles.patternText,
          settings.backgroundPattern === pattern ? styles.patternTextActive : null
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, settings.darkMode && styles.darkContainer]}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>Appearance</Text>
        
        {/* Dark Mode */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="moon-outline" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Dark Mode</Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={() => toggleSetting('darkMode', 'Dark Mode')}
            trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
            thumbColor={settings.darkMode ? colors.primary : colors.darkGray}
          />
        </View>
        
        {/* Invert Mode */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <MaterialCommunityIcons name="invert-colors" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Invert Colors Mode</Text>
            <Text style={styles.betaTag}>BETA</Text>
          </View>
          <Switch
            value={settings.invertMode}
            onValueChange={() => toggleSetting('invertMode', 'Invert Mode')}
            trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
            thumbColor={settings.invertMode ? colors.primary : colors.darkGray}
          />
        </View>
        
        {/* Text Size */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="text" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Text Size</Text>
          </View>
          <Text style={[styles.sliderValue, settings.darkMode && styles.darkText]}>{settings.textSize}px</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={12}
          maximumValue={24}
          step={1}
          value={settings.textSize}
          onValueChange={(value) => updateSetting('textSize', value)}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.lightGray}
          thumbTintColor={colors.primary}
        />
        
        {/* Background Pattern */}
        <View style={styles.settingContainer}>
          <View style={styles.settingLabelContainer}>
            <MaterialCommunityIcons name="palette-outline" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Background Pattern</Text>
          </View>
          <View style={styles.patternContainer}>
            {renderBackgroundPatternButton('none', 'None')}
            {renderBackgroundPatternButton('dots', 'Dots')}
            {renderBackgroundPatternButton('lines', 'Lines')}
            {renderBackgroundPatternButton('waves', 'Waves')}
            {renderBackgroundPatternButton('confetti', 'Confetti')}
          </View>
        </View>
        
        {/* Bubble Shape */}
        <View style={styles.settingContainer}>
          <View style={styles.settingLabelContainer}>
            <MaterialCommunityIcons name="message-outline" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Message Bubble Shape</Text>
          </View>
          <View style={styles.bubbleShapeContainer}>
            {renderBubbleShapeButton('rounded', 'Rounded', 'chatbubble')}
            {renderBubbleShapeButton('square', 'Square', 'square-outline')}
            {renderBubbleShapeButton('cloud', 'Cloud', 'cloud-outline')}
          </View>
        </View>
        
        <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>Chatbot</Text>
        
        {/* Therapist Personality */}
        <View style={styles.settingContainer}>
          <View style={styles.settingLabelContainer}>
            <MaterialCommunityIcons name="account-outline" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Therapist Personality</Text>
          </View>
          <View style={styles.personalityContainer}>
            {renderPersonalityButton('chad', 'Chad', 'sunglasses')}
            {renderPersonalityButton('zen', 'Zen', 'meditation')}
            {renderPersonalityButton('chaos', 'Chaos', 'lightning-bolt')}
            {renderPersonalityButton('robot', 'Robot', 'robot')}
          </View>
        </View>
        
        {/* Emoji Density */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <MaterialCommunityIcons name="emoticon-outline" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Emoji Density</Text>
          </View>
          <Text style={[styles.sliderValue, settings.darkMode && styles.darkText]}>{settings.emojiDensity}/10</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={settings.emojiDensity}
          onValueChange={(value) => updateSetting('emojiDensity', value)}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.lightGray}
          thumbTintColor={colors.primary}
        />
        
        {/* Typing Indicator Duration */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Typing Indicator Duration</Text>
          </View>
          <Text style={[styles.sliderValue, settings.darkMode && styles.darkText]}>{settings.showTypingDuration}s</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={settings.showTypingDuration}
          onValueChange={(value) => updateSetting('showTypingDuration', value)}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.lightGray}
          thumbTintColor={colors.primary}
        />
        
        {/* Avatar Style */}
        <View style={styles.settingContainer}>
          <View style={styles.settingLabelContainer}>
            <MaterialCommunityIcons name="face-man" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Avatar Style</Text>
          </View>
          <View style={styles.avatarStyleContainer}>
            {renderAvatarStyleButton('modern', 'Modern', 'face-man')}
            {renderAvatarStyleButton('pixel', 'Pixel', 'gamepad-variant')}
            {renderAvatarStyleButton('abstract', 'Abstract', 'shape')}
          </View>
        </View>
        
        <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>Experience</Text>
        
        {/* Sound Effects */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="volume-medium-outline" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Sound Effects</Text>
          </View>
          <Switch
            value={settings.soundEffects}
            onValueChange={() => toggleSetting('soundEffects', 'Sound Effects')}
            trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
            thumbColor={settings.soundEffects ? colors.primary : colors.darkGray}
          />
        </View>
        
        {/* Confetti Mode */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <MaterialCommunityIcons name="party-popper" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Confetti Mode</Text>
            <Text style={styles.proTag}>PRO</Text>
          </View>
          <Switch
            value={settings.confettiMode}
            onValueChange={() => {
              if (!settings.confettiMode) {
                Alert.alert(
                  "Premium Feature",
                  "Confetti Mode is a premium feature! But since we're feeling generous, we'll let you try it anyway.",
                  [
                    { text: "No thanks", style: "cancel" },
                    { text: "Enable it!", onPress: () => {
                      updateSetting('confettiMode', true);
                      Vibration.vibrate(50);
                    }}
                  ]
                );
              } else {
                updateSetting('confettiMode', false);
                Vibration.vibrate(50);
              }
            }}
            trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
            thumbColor={settings.confettiMode ? colors.primary : colors.darkGray}
          />
        </View>
        
        {/* Random Crashes */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <MaterialCommunityIcons name="cellphone-arrow-down" size={24} color={settings.darkMode ? '#fff' : colors.primary} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Random App Crashes</Text>
          </View>
          <Switch
            value={settings.randomCrashes}
            onValueChange={() => toggleSetting('randomCrashes', 'Random App Crashes')}
            trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
            thumbColor={settings.randomCrashes ? colors.primary : colors.darkGray}
          />
        </View>
        
        {/* Enlightenment Tracking */}
        <View style={styles.enlightenmentContainer}>
          <Text style={[styles.enlightenmentTitle, settings.darkMode && styles.darkText]}>
            Your Enlightenment Journey
          </Text>
          <View style={styles.enlightenmentProgressContainer}>
            <View style={styles.enlightenmentProgressBar}>
              <View style={[styles.enlightenmentProgressFill, { width: `${Math.random() * 100}%` }]} />
            </View>
            <MaterialCommunityIcons 
              name="meditation" 
              size={24} 
              color={colors.primary} 
            />
          </View>
          <Text style={[styles.enlightenmentText, settings.darkMode && styles.darkText]}>
            You're on your way to something... maybe enlightenment, maybe just digital confusion.
          </Text>
        </View>
        
        {/* Danger Zone */}
        <View style={styles.dangerContainer}>
          <Text style={styles.dangerTitle}>DANGER ZONE</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => {
              Alert.alert(
                "Reset Settings",
                "Are you sure you want to reset all settings? This action cannot be undone (except by changing settings again).",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Reset", style: "destructive", onPress: () => {
                    // 50% chance of actually resetting
                    if (Math.random() < 0.5) {
                      resetSettings();
                      
                      Alert.alert(
                        "Settings Reset",
                        "All settings have been reset to default values."
                      );
                    } else {
                      Alert.alert(
                        "Reset Failed",
                        "Something went wrong. Your settings remain unchanged. Maybe try turning it off and on again?"
                      );
                    }
                  }}
                ]
              );
            }}
          >
            <Text style={styles.dangerButtonText}>Reset All Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => {
              Alert.alert(
                "Delete All Messages",
                "Are you sure you want to delete all your therapy messages? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => {
                    setTimeout(() => {
                      Alert.alert(
                        "Just Kidding",
                        "We wouldn't actually delete your valuable therapy insights. They're too entertaining for our AI training programs."
                      );
                    }, 1000);
                  }}
                ]
              );
            }}
          >
            <Text style={styles.dangerButtonText}>Delete All Messages</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <Animated.View 
        style={[
          styles.saveButtonContainer, 
          { transform: [{ scale: saveButtonScale }] }
        ]}
      >
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            handleSaveChanges();
            Vibration.vibrate([0, 50, 50, 50]);
          }}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: colors.primary,
  },
  darkText: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingContainer: {
    marginBottom: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  settingIcon: {
    width: 24,
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 16,
  },
  sliderValue: {
    fontSize: 14,
    color: colors.darkGray,
  },
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 10,
  },
  personalityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    marginBottom: 8,
  },
  personalityButtonActive: {
    backgroundColor: colors.primary,
  },
  personalityButtonText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '500',
  },
  personalityButtonTextActive: {
    color: colors.white,
  },
  avatarStyleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 10,
  },
  avatarStyleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    marginBottom: 8,
  },
  avatarStyleButtonActive: {
    backgroundColor: colors.primary,
  },
  avatarStyleText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '500',
  },
  avatarStyleTextActive: {
    color: colors.white,
  },
  bubbleShapeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 10,
  },
  bubbleShapeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    marginBottom: 8,
  },
  bubbleShapeButtonActive: {
    backgroundColor: colors.primary,
  },
  bubbleShapeText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '500',
  },
  bubbleShapeTextActive: {
    color: colors.white,
  },
  patternContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 10,
  },
  patternButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    marginBottom: 8,
  },
  patternButtonActive: {
    backgroundColor: colors.primary,
  },
  patternText: {
    color: colors.primary,
    fontWeight: '500',
  },
  patternTextActive: {
    color: colors.white,
  },
  enlightenmentContainer: {
    backgroundColor: colors.overlay,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  enlightenmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  enlightenmentProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  enlightenmentProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  enlightenmentProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  enlightenmentText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  dangerContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  betaTag: {
    fontSize: 10,
    backgroundColor: colors.primaryLight,
    color: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 8,
  },
  proTag: {
    fontSize: 10,
    backgroundColor: '#FFD700',
    color: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 8,
    fontWeight: 'bold',
  },
}); 