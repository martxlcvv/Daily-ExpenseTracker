import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';
import { getExpenseGreeting } from '../utils/avatarMessages';

const MASCOT_EMOJI = {
  squirrel: '🐿️',
  rocket:   '🚀',
  star:     '⭐',
  heart:    '💖',
  smile:    '😊',
};

const UserAvatar = ({
  userName = 'User',
  mascotType = 'squirrel',
  size = 'md',
  customImageUri = null,
  totalExpenses = 0,
  enableVoice = false,
  showMessage = true,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState(getExpenseGreeting(userName, totalExpenses));
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Gentle idle bounce animation
    const seq = Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]);
    const loop = Animated.loop(seq, { iterations: -1 });
    loop.start();

    const greeting = getExpenseGreeting(userName, totalExpenses);
    setMessage(greeting);

    if (enableVoice && !isAnimating) {
      const t = setTimeout(() => {
        setIsAnimating(true);
        Speech.speak(greeting, {
          language: 'fil',
          pitch: 1.1,
          rate: 0.95,
          onDone: () => setIsAnimating(false),
        });
      }, 300);
      return () => {
        clearTimeout(t);
        loop.stop();
      };
    }
    return () => loop.stop();
  }, [userName, totalExpenses, enableVoice]);

  const sizeConfig = {
    sm: { container: 48, emoji: 24, border: 2 },
    md: { container: 76, emoji: 38, border: 3 },
    lg: { container: 110, emoji: 56, border: 4 },
  };
  const config = sizeConfig[size] || sizeConfig.md;

  const emoji = MASCOT_EMOJI[mascotType] || MASCOT_EMOJI.squirrel;

  // Use custom image if available, otherwise use emoji
  const useCustomImage = customImageUri && customImageUri.length > 0;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.avatarRing,
          {
            width:  config.container + config.border * 2 + 8,
            height: config.container + config.border * 2 + 8,
            borderRadius: (config.container + config.border * 2 + 8) / 2,
            borderColor: colors.primary + '50',
            borderWidth: config.border,
            backgroundColor: isDark ? colors.surfaceSecondary : colors.surfaceSecondary,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.avatarInner,
            {
              width: config.container,
              height: config.container,
              borderRadius: config.container / 2,
              backgroundColor: colors.card,
            },
          ]}
        >
          {customImageUri ? (
            <Image
              source={{ uri: customImageUri }}
              style={{
                width: config.container,
                height: config.container,
                borderRadius: config.container / 2,
              }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: config.emoji }}>{emoji}</Text>
          )}
        </View>
      </Animated.View>

      {/* Speech bubble — only for md and lg */}
      {size !== 'sm' && (
        <View
          style={[
            styles.speechBubble,
            { backgroundColor: colors.primary, shadowColor: colors.shadow },
          ]}
        >
          <Text style={[styles.speechText, { color: '#FFFFFF' }]} numberOfLines={2}>
            {message}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarRing: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.2,
    elevation: 6,
  },
  avatarInner: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  speechBubble: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: 200,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  speechText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default UserAvatar;
