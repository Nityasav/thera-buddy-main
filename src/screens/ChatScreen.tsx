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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { generateUselessResponse } from '../utils/openaiService';
import { reverseAutocorrect, processTypingWithReverseAutocorrect } from '../utils/reverseAutocorrect';
import { colors } from '../theme/colors';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RootStackParamList = {
  Welcome: undefined;
  Chat: undefined;
  Enlightenment: { messageCount: number };
};

type ChatScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Chat'>;
};

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

const { width } = Dimensions.get('window');

export default function ChatScreen({ navigation }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [previousInputText, setPreviousInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [enlightenmentProgress, setEnlightenmentProgress] = useState(0);
  const [messagesSentToEnlightenment, setMessagesSentToEnlightenment] = useState(0);
  const insets = useSafeAreaInsets();
  const [isTyping, setIsTyping] = useState(false);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  
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

  useEffect(() => {
    // Add initial therapist message
    setMessages([
      {
        id: '1',
        text: "Hey there! I'm your totally unqualified therapy buddy. So, what's bugging you today? I promise to give advice that's exactly worth what you're paying for it.",
        isUser: false,
      },
    ]);
  }, []);

  // Handle input changes with reverse autocorrect
  const handleInputChange = (text: string) => {
    // Store the previous value for comparison
    setPreviousInputText(inputText);
    
    // Don't modify if we're deleting text
    if (text.length < inputText.length) {
      setInputText(text);
      return;
    }
    
    // Apply reverse autocorrect to mess with the user's input
    let processedText = processTypingWithReverseAutocorrect(inputText, text);
    
    // Don't replace existing characters - only add new symbols at the end
    if (Math.random() < 0.1 && text.endsWith('.')) {
      const symbolEndings = [
        " 👍",
        " 😂",
        " 🙄",
        " 💯",
        " 🤔",
        " 🤦‍♀️",
        " 😭",
        " 🙃",
        " ⚠️",
        " 🚀",
      ];
      processedText += symbolEndings[Math.floor(Math.random() * symbolEndings.length)];
    }
    
    // Update the input field with potentially modified text
    setInputText(processedText);
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    // Increment our message counter that tracks progress to enlightenment
    setMessagesSentToEnlightenment(prev => prev + 1);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simulate a more realistic typing delay (2-4 seconds)
      const typingDelay = Math.floor(Math.random() * 2000) + 2000;
      await new Promise(resolve => setTimeout(resolve, typingDelay));
      
      const response = await generateUselessResponse(inputText);
      const misspelledResponse = reverseAutocorrect(response);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: misspelledResponse,
        isUser: false,
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Increment enlightenment progress
      setEnlightenmentProgress(prev => {
        const newProgress = prev + 0.2;
        if (newProgress >= 1) {
          // Navigate to enlightenment screen after a short delay
          setTimeout(() => {
            navigation.replace('Enlightenment', { 
              messageCount: messagesSentToEnlightenment 
            });
          }, 1500);
        }
        return Math.min(newProgress, 1);
      });
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Oopsie! My brain got like, totally scrambled! Can u try again? 🤯",
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Scale animation for the brain icon
  const brainScale = typingAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.white, colors.lightGray]}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        {/* Enlightenment Progress Bar */}
        <View style={styles.enlightenmentContainer}>
          <Text style={styles.enlightenmentText}>
            Enlightenment Progress
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
            {messages.map(message => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.botBubble,
                ]}
              >
                {!message.isUser && (
                  <View style={styles.botAvatarContainer}>
                    <FontAwesome5 name="brain" size={20} color={colors.primary} />
                  </View>
                )}
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.botMessageText,
                ]}>
                  {message.text}
                </Text>
              </View>
            ))}
            {isTyping && (
              <View style={styles.typingContainer}>
                <Animated.View style={{ transform: [{ scale: brainScale }] }}>
                  <FontAwesome5 name="brain" size={20} color={colors.primary} />
                </Animated.View>
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={handleInputChange}
              placeholder="Type your message..."
              placeholderTextColor={colors.darkGray}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
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
  keyboardAvoid: {
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
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 8,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingLeft: 36, // Extra space for the avatar
  },
  botAvatarContainer: {
    position: 'absolute',
    left: 8,
    top: 12,
    zIndex: 1,
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
  loadingContainer: {
    padding: 8,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    color: colors.black,
    fontSize: 16,
    maxHeight: 120,
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
    justifyContent: 'center',
    width: 40,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginHorizontal: 2,
    opacity: 0.7,
  },
}); 