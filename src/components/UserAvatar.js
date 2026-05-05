import * as Speech from 'expo-speech';
import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';

const MASCOTS = ['squirrel', 'rocket', 'star', 'heart', 'smile'];

const getMascotEmoji = (type) => {
  const emojis = {
    squirrel: '🐿️',
    rocket: '🚀',
    star: '⭐',
    heart: '💖',
    smile: '😊',
  };
  return emojis[type] || emojis.squirrel;
};

const getGreetingMessage = (userName, totalExpenses = 0) => {
  const hour = new Date().getHours();
  let greeting = '';
  
  if (hour < 12) greeting = `Good morning, ${userName}!`;
  else if (hour < 17) greeting = `Good afternoon, ${userName}!`;
  else greeting = `Good evening, ${userName}!`;
  
  // Add message based on expenses
  if (totalExpenses > 5000) {
    greeting += ' Wow, big expenses today! 💸';
  } else if (totalExpenses > 2000) {
    greeting += ' Quite a bit spent today! 💰';
  } else if (totalExpenses > 0) {
    greeting += ' Keep tracking! 📊';
  } else {
    greeting += ' No expenses yet! 🎉';
  }
  
  return greeting;
};

const UserAvatar = ({ userName = 'User', mascotType = 'squirrel', size = 'md', customImageUri = null, totalExpenses = 0, enableVoice = false, useDefaultImage = true }) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const messageRef = useRef('');
  
  // Default avatar image from assets
  const DEFAULT_AVATAR = require('../../assets/images/icon.png');

  useEffect(() => {
    // Subtle bounce animation
    const sequence = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(sequence, { iterations: 50 }).start();
    
    // Generate greeting message
    messageRef.current = getGreetingMessage(userName, totalExpenses);
    
    // Speak if voice enabled
    if (enableVoice && messageRef.current) {
      setTimeout(() => {
        Speech.speak(messageRef.current, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
        });
      }, 500);
    }
  }, [userName, totalExpenses, enableVoice]);

  const sizeConfig = {
    sm: { container: 48, emoji: 24, border: 2 },
    md: { container: 80, emoji: 40, border: 3 },
    lg: { container: 120, emoji: 60, border: 4 },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            width: config.container,
            height: config.container,
            borderRadius: config.container / 2,
            backgroundColor: isDark ? colors.card : colors.surface,
            borderWidth: config.border,
            borderColor: colors.primary + '40',
            transform: [{ scale: scaleAnim }],
            ...styles.shadow,
          },
        ]}
      >
        {customImageUri ? (
          <Image 
            source={{ uri: customImageUri }} 
            style={{
              width: '100%',
              height: '100%',
              borderRadius: config.container / 2,
            }}
          />
        ) : useDefaultImage ? (
          <Image 
            source={DEFAULT_AVATAR} 
            style={{
              width: '100%',
              height: '100%',
              borderRadius: config.container / 2,
            }}
          />
        ) : (
          <Text style={{ fontSize: config.emoji }}>{getMascotEmoji(mascotType)}</Text>
        )}
      </Animated.View>

      {size === 'md' && (
        <View
          style={[
            styles.speechBubble,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.speechText, { color: colors.textInverse }]}>
            {messageRef.current || `Hi ${userName}! 👋`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.15,
    elevation: 5,
  },
  speechBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    maxWidth: 160,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.12,
    elevation: 3,
  },
  speechText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    textAlign: 'center',
  },
});

export default UserAvatar;
