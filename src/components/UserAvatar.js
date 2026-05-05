import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { SQUIRREL_IMAGE_URI } from '../assets/squirrelAsset';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Spacing } from '../theme/spacing';
import { FontFamily, FontSize, FontWeight } from '../theme/typography';

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

const UserAvatar = ({ userName = 'User', mascotType = 'squirrel', size = 'md', customImageUri = null, totalExpenses = 0, enableVoice = false }) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [message, setMessage] = useState(getGreetingMessage(userName, totalExpenses));

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
    
    const greeting = getGreetingMessage(userName, totalExpenses);
    setMessage(greeting);
    
    if (enableVoice && greeting) {
      setTimeout(() => {
        Speech.speak(greeting, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
        });
      }, 500);
    }
  }, [userName, totalExpenses, enableVoice, scaleAnim]);

  const sizeConfig = {
    sm: { container: 48, emoji: 24, border: 2 },
    md: { container: 80, emoji: 40, border: 3 },
    lg: { container: 120, emoji: 60, border: 4 },
  };

  const config = sizeConfig[size] || sizeConfig.md;
  const hasSquirrelAsset = mascotType === 'squirrel';

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
        ) : hasSquirrelAsset ? (
          <Image
            source={{ uri: SQUIRREL_IMAGE_URI }}
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
            {message || `Hi ${userName}! 👋`}
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
    maxWidth: 190,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    shadowOpacity: 0.18,
    elevation: 4,
  },
  speechText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
    lineHeight: FontSize.sm * 1.4,
  },
});

export default UserAvatar;
