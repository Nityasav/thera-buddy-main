import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
  Vibration,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { generateEnlightenedResponse } from '../utils/openaiService';
import { processTypingWithReverseAutocorrect } from '../utils/reverseAutocorrect';
import { colors } from '../theme/colors';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, Feather, AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RootStackParamList = {
  Welcome: undefined;
  Chat: undefined;
  Enlightenment: { messageCount: number };
};

type EnlightenmentScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Enlightenment'>;
  route: { params: { messageCount: number } };
};

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

const { width } = Dimensions.get('window');

export default function EnlightenmentScreen({ navigation, route }: EnlightenmentScreenProps) {
  const { messageCount } = route.params || { messageCount: 5 }; // Default to 5 if not provided
  const [totalMessages, setTotalMessages] = useState(messageCount);
  const [messagesRemaining, setMessagesRemaining] = useState(messageCount);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Alright, so I've upgraded to the premium version of myself. No more of that weird spiritual babble. Let's just have a normal conversation where I pretend to help and you pretend I'm useful. Deal?",
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const [enlightenmentProgress, setEnlightenmentProgress] = useState(1); // Start at 100%
  const [isTyping, setIsTyping] = useState(false);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const [previousInputText, setPreviousInputText] = useState('');
  
  // Animation for the brain icon
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);
  
  // Scale animation for the brain icon
  const brainScale = typingAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });
  
  // Annoying features
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [showMindfulnessPopup, setShowMindfulnessPopup] = useState(false);
  const [hasShownInitialPopup, setHasShownInitialPopup] = useState(false);
  const [randomTypos, setRandomTypos] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  
  // Useless inspirational quotes to pop up
  const inspirationalQuotes = [
    "Your mind is a garden, your thoughts are the weeds.",
    "Live, laugh, meditate.",
    "Be the change you wish to see in your bank account.",
    "The journey of a thousand miles begins with your phone's GPS.",
    "Breathe in positivity, exhale your credit card debt.",
    "You are not a drop in the ocean, you are a drop in your coffee.",
    "The best time to plant a tree was 20 years ago. The second best time is to plant a virtual tree in our upcoming app.",
    "Your vibe attracts your tribe, and also targeted advertising.",
    "Do what you love, and the medical bills will follow.",
    "If it's meant to be, it will be. If not, try turning it off and on again."
  ];
  
  // Show random inspirational quotes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
        setCurrentQuote(randomQuote);
        setShowQuote(true);
        Vibration.vibrate(100);
        
        setTimeout(() => {
          setShowQuote(false);
        }, 5000);
      }
    }, 30000);
    
    return () => clearInterval(quoteInterval);
  }, []);
  
  // Initial annoying popup
  useEffect(() => {
    if (!hasShownInitialPopup) {
      setTimeout(() => {
        setShowMindfulnessPopup(true);
        setHasShownInitialPopup(true);
      }, 3000);
    }
  }, [hasShownInitialPopup]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    
    // Randomly correct grammar to be casual
    let processedText = inputText;
    
    // 25% chance to make the text more casual
    if (Math.random() < 0.25) {
      // Common casual language tweaks
      const casualCorrections = [
        { from: /\bI am\b/gi, to: "I'm" },
        { from: /\bcannot\b/gi, to: "can't" },
        { from: /\bwill not\b/gi, to: "won't" },
        { from: /\bgoing to\b/gi, to: "gonna" },
        { from: /\bwant to\b/gi, to: "wanna" },
        { from: /\byes\b/gi, to: "yeah" },
        { from: /\bno\b/gi, to: "nah" },
        { from: /\bwhat the [a-z]+\b/gi, to: "wtf" },
        { from: /\boh my [a-z]+\b/gi, to: "omg" },
      ];
      
      casualCorrections.forEach(({ from, to }) => {
        processedText = processedText.replace(from, to);
      });
      
      if (processedText !== inputText) {
        // Show casual correction popup
        setTimeout(() => {
          Alert.alert(
            "Made it sound more chill",
            "Just fixed your text to sound more like how people actually talk.",
            [{ text: "Thanks bro", style: "cancel" }]
          );
        }, 500);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: processedText,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);
    
    // Decrease messages remaining
    const newMessagesRemaining = messagesRemaining - 1;
    setMessagesRemaining(newMessagesRemaining);
    
    // Update the progress bar
    setEnlightenmentProgress(newMessagesRemaining / totalMessages);
    
    // Random loading delay - like someone texting
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    try {
      const response = await generateEnlightenedResponse(inputText);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Check if we've run out of enlightenment messages
      if (newMessagesRemaining <= 0) {
        // Show alert that enlightenment is wearing off
        setTimeout(() => {
          Alert.alert(
            "Enlightenment Wearing Off",
            "Looks like my premium subscription is expiring. Time to go back to the basic version.",
            [{ text: "Back to regular mode", onPress: () => navigation.replace('Chat') }]
          );
        }, 2000);
      }
      
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry man, got distracted and lost my train of thought. What were we talking about?",
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };
  
  const renderMindfulnessPopup = () => {
    return (
      <Modal
        visible={showMindfulnessPopup}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.popupContainer}>
          <View style={styles.popupContent}>
            <MaterialCommunityIcons name="beer" size={50} color={colors.primary} style={styles.popupIcon} />
            <Text style={styles.popupTitle}>BRO CHECK-IN</Text>
            <Text style={styles.popupText}>
              Hey, just wanted to check... are you actually using a therapy app right now? 
              Because that's cool and all, but have you considered just grabbing a beer with a friend?
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity 
                style={[styles.popupButton, styles.popupButtonSecondary]}
                onPress={() => {
                  setShowMindfulnessPopup(false);
                  Alert.alert("Fair enough", "I mean, I'm just an app, but I'll try to help anyway.");
                }}
              >
                <Text style={styles.popupButtonTextSecondary}>I'm good here</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.popupButton}
                onPress={() => {
                  setShowMindfulnessPopup(false);
                  Alert.alert("Nice!", "That's probably better advice than anything I'll give you!");
                }}
              >
                <Text style={styles.popupButtonText}>Good point!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Handle input changes with a combination of reverse autocorrect and mindful language correction
  const handleInputChange = (text: string) => {
    // Store previous value
    setPreviousInputText(inputText);
    
    // Don't modify if we're deleting text
    if (text.length < inputText.length) {
      setInputText(text);
      return;
    }
    
    // First apply reverse autocorrect
    let processedText = processTypingWithReverseAutocorrect(inputText, text);
    
    // Then apply casual language suggestions (without replacing words)
    // Only add casual suggestions after a word is completed
    if (text.length > previousInputText.length && text.endsWith(' ') && Math.random() < 0.2) {
      const lastWord = text.trim().split(' ').pop()?.toLowerCase() || '';
      const casualReplacements: Record<string, string> = {
        'upset': 'pissed off',
        'sad': 'bummed out',
        'depressed': 'in a serious funk',
        'stressed': 'freaking out',
        'hate': "can't stand",
        'annoyed': 'irritated',
        'tired': 'exhausted',
        'bored': 'super bored',
        'good': 'pretty good',
        'nice': 'cool',
        'bad': 'crappy',
        'want': 'really want',
        'need': 'gotta have',
        'think': 'reckon',
        'feel': 'feel like',
        'yes': 'yeah for sure',
        'no': 'nah',
        'problem': 'issue',
        'issue': 'thing',
      };
      
      if (lastWord in casualReplacements && Math.random() < 0.6) {
        // Instead of replacing, add a suggestion
        processedText += `(or as I'd say, "${casualReplacements[lastWord]}") `;
        
        // Show tooltip occasionally but make it sound casual
        if (Math.random() < 0.3) {
          setTimeout(() => {
            Alert.alert(
              "Just saying",
              `I'd probably say "${casualReplacements[lastWord]}" instead of "${lastWord}" but whatever works for you.`,
              [{ text: "Got it", style: "cancel" }]
            );
          }, 500);
        }
      }
    }
    
    setInputText(processedText);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.white, colors.overlay]}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        {/* Enlightenment Progress Bar */}
        <View style={styles.enlightenmentContainer}>
          <Text style={styles.enlightenmentText}>
            Premium Subscription: {messagesRemaining} message{messagesRemaining !== 1 ? 's' : ''} remaining
          </Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${enlightenmentProgress * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <FontAwesome5 name="laugh-beam" size={22} color={colors.primary} />
            <Text style={styles.headerTitle}>straight-talking therapeigh</Text>
          </View>
          <MaterialCommunityIcons name="beer-outline" size={24} color={colors.primary} />
        </View>
        
        {/* Inspirational quote banner */}
        {showQuote && (
          <View style={styles.quoteBanner}>
            <MaterialCommunityIcons name="format-quote-open" size={16} color={colors.primary} />
            <Text style={styles.quoteText}>{currentQuote}</Text>
            <TouchableOpacity 
              style={styles.quoteClose}
              onPress={() => setShowQuote(false)}
            >
              <Ionicons name="close-circle" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Breathing indicator */}
        {isBreathing && (
          <View style={styles.breathingContainer}>
            <View style={styles.breathingCircle}>
              <Text style={styles.breathingText}>Breathe...</Text>
            </View>
            <Text style={styles.breathingSubtext}>Please wait while we process your consciousness</Text>
          </View>
        )}
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {/* Random space-taking zen circle */}
            {Math.random() < 0.15 && (
              <View style={styles.zenCircleContainer}>
                <View style={styles.zenCircle} />
                <Text style={styles.zenText}>Contemplate this circle</Text>
              </View>
            )}
          
            {messages.map(message => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.botBubble,
                ]}
              >
                {!message.isUser && (
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                      colors={[colors.primary, colors.primaryLight]}
                      style={styles.avatarGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <FontAwesome5 name="brain" size={18} color={colors.white} />
                    </LinearGradient>
                  </View>
                )}
                <View style={[
                  styles.bubbleContent,
                  message.isUser ? styles.userBubbleContent : styles.botBubbleContent,
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.botMessageText,
                  ]}>
                    {message.text}
                  </Text>
                  <View style={styles.messageTimeContainer}>
                    <Text style={[
                      styles.messageTime,
                      message.isUser ? styles.userMessageTime : styles.botMessageTime,
                    ]}>
                      {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                    {message.isUser && (
                      <MaterialCommunityIcons 
                        name="check-all" 
                        size={14} 
                        color={colors.white} 
                        style={styles.readIcon}
                      />
                    )}
                  </View>
                </View>
              </View>
            ))}
            {isTyping && (
              <View style={styles.typingContainer}>
                <Animated.View style={[styles.avatarContainer, { transform: [{ scale: brainScale }] }]}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryLight]}
                    style={styles.avatarGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <FontAwesome5 name="brain" size={18} color={colors.white} />
                  </LinearGradient>
                </Animated.View>
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <View style={styles.typingDot} />
                    <View style={[styles.typingDot, styles.typingDotMiddle]} />
                    <View style={styles.typingDot} />
                  </View>
                </View>
              </View>
            )}
            
            {/* Random enlightenment tips */}
            {Math.random() < 0.3 && !isLoading && (
              <View style={styles.tipContainer}>
                <View style={styles.tipHeader}>
                  <MaterialCommunityIcons name="lightbulb-on" size={18} color={colors.primary} />
                  <Text style={styles.tipTitle}>Enlightenment Tip</Text>
                </View>
                <Text style={styles.tipText}>
                  {[
                    "Try drinking water while standing on one foot for enhanced mindfulness.",
                    "The sound 'ommmmm' is more effective when it includes exactly 5 m's.",
                    "For maximum enlightenment, text your ex at 3 AM with 'I've found inner peace'.",
                    "Wearing mismatched socks improves your chi flow by 27%.",
                    "The universe speaks through WiFi signals. Meditate near your router.",
                  ][Math.floor(Math.random() * 5)]}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={handleInputChange}
                placeholder={Math.random() < 0.2 ? "Share your enlightened thoughts..." : "Type your message..."}
                placeholderTextColor={colors.darkGray}
                multiline
                maxLength={500}
              />
              {inputText.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => {
                    // 25% chance of giving spiritual advice instead of clearing
                    if (Math.random() < 0.25) {
                      Alert.alert(
                        "Spiritual Advice",
                        "Letting go of your words is the first step to letting go of your ego.",
                        [
                          { text: "Deep. Now clear my text.", onPress: () => setInputText('') },
                          { text: "Wow. I'll keep typing then." }
                        ]
                      );
                    } else {
                      setInputText('');
                    }
                  }}
                >
                  <Ionicons name="close-circle" size={18} color={colors.darkGray} />
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={() => {
                // 20% chance of showing a "phone is detecting negative energy" popup
                if (Math.random() < 0.2) {
                  Vibration.vibrate(300);
                  Alert.alert(
                    "Negative Energy Detected",
                    "Your device is sensing negative energy in your aura. Would you like to cleanse your device's chakras before sending?",
                    [
                      { text: "No, just send", onPress: handleSend },
                      { text: "Yes, cleanse first", onPress: () => {
                        // Fake cleansing process
                        Alert.alert("Cleansing...", "Please wait while we align your device's energy...");
                        setTimeout(() => {
                          Alert.alert("Cleansing Complete", "Your device feels much lighter now.");
                          handleSend();
                        }, 3000);
                      }}
                    ]
                  );
                } else {
                  handleSend();
                }
              }}
              disabled={!inputText.trim() || isLoading}
            >
              <MaterialCommunityIcons 
                name="send" 
                size={24} 
                color={inputText.trim() ? colors.white : colors.mediumGray} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
      
      {renderMindfulnessPopup()}
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
  enlightenmentContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  enlightenmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    backgroundColor: colors.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    marginVertical: 4,
    flexDirection: 'row',
  },
  bubbleContent: {
    padding: 12,
    borderRadius: 20,
  },
  userBubble: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  userBubbleContent: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  botBubbleContent: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.white,
  },
  botMessageText: {
    color: colors.black,
  },
  messageTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 2,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botMessageTime: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  readIcon: {
    marginLeft: 2,
  },
  loadingContainer: {
    padding: 12,
    alignItems: 'flex-start',
  },
  typingIndicator: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typingText: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: colors.black,
    fontSize: 16,
    maxHeight: 120,
  },
  clearButton: {
    padding: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  popupContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  popupIcon: {
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: colors.primary,
  },
  popupText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  popupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  popupButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  popupButtonSecondary: {
    backgroundColor: colors.lightGray,
  },
  popupButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  popupButtonTextSecondary: {
    color: colors.darkGray,
    fontSize: 16,
  },
  quoteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.primary,
    marginHorizontal: 8,
  },
  quoteClose: {
    padding: 4,
  },
  tipContainer: {
    padding: 12,
    backgroundColor: colors.overlay,
    borderRadius: 12,
    marginVertical: 8,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 6,
  },
  tipText: {
    fontSize: 14,
    color: colors.black,
    fontStyle: 'italic',
  },
  breathingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  breathingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    opacity: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  breathingText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  breathingSubtext: {
    color: colors.darkGray,
    fontSize: 12,
    textAlign: 'center',
  },
  zenCircleContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  zenCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 8,
  },
  zenText: {
    fontSize: 12,
    color: colors.darkGray,
    fontStyle: 'italic',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  typingBubble: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 12,
    marginLeft: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  typingDotMiddle: {
    opacity: 0.8,
  },
}); 