/**
 * UserAvatar.js — Fixed & Minimalist
 * - Correct asset path: ../../assets/avatar.png
 * - Clean pulsing ring animation (no jank)
 * - Speech bubble stays clean
 * - Initials fallback if avatar.png not found
 */
import { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Image,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

// ✅ Path: src/components/UserAvatar.js → ../../ → project root → assets/avatar.png
let AVATAR_SRC = null;
try {
  AVATAR_SRC = require('../../assets/avatar.png');
} catch {
  AVATAR_SRC = null;
}

const SIZES = { sm: 40, md: 58, lg: 86 };

const UserAvatar = ({ size = 'md', message = '', showBubble = true }) => {
  const { colors } = useTheme();
  const { settings } = useExpenses();
  const { width } = useWindowDimensions();

  const firstName = settings?.firstName || '';

  // Responsive clamp
  const baseSize = SIZES[size] ?? SIZES.md;
  const sz = Math.min(width * (size === 'sm' ? 0.1 : size === 'lg' ? 0.22 : 0.15), baseSize);
  const ringSize = sz + 8;

  // Animations
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0.4)).current;
  const bubbleFade = useRef(new Animated.Value(0)).current;
  const bubbleSlide = useRef(new Animated.Value(6)).current;

  // Subtle ring pulse
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.9, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: false }),
      ])
    );
    pulse.start();
    glow.start();
    return () => { pulse.stop(); glow.stop(); };
  }, []);

  // Speech bubble entrance/exit
  useEffect(() => {
    if (message) {
      bubbleFade.setValue(0);
      bubbleSlide.setValue(6);
      Animated.parallel([
        Animated.spring(bubbleFade,  { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200 }),
        Animated.spring(bubbleSlide, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }),
      ]).start();
    } else {
      Animated.timing(bubbleFade, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [message]);

  const ringBorderColor = glowAnim.interpolate({
    inputRange: [0.4, 0.9],
    outputRange: [colors.primary + '35', colors.primary + '90'],
  });

  const initials = firstName ? firstName.slice(0, 2).toUpperCase() : '';

  return (
    <View style={{ width: ringSize + 6, height: ringSize + 6, alignItems: 'center', justifyContent: 'center' }}>
      {/* Animated outer ring */}
      <Animated.View
        style={{
          position: 'absolute',
          width: ringSize + 6,
          height: ringSize + 6,
          borderRadius: (ringSize + 6) / 2,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: ringBorderColor,
          transform: [{ scale: pulseAnim }],
        }}
      />

      {/* Avatar circle */}
      <View
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            backgroundColor: colors.card,
            borderColor: colors.primary + '55',
          },
        ]}
      >
        {AVATAR_SRC ? (
          <Image
            source={AVATAR_SRC}
            style={{ width: sz, height: sz, borderRadius: sz / 2 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.initialsWrap,
              {
                width: sz,
                height: sz,
                borderRadius: sz / 2,
                backgroundColor: colors.primary + '18',
              },
            ]}
          >
            {initials ? (
              <Text style={{ fontSize: sz * 0.34, fontWeight: '700', color: colors.primary }}>
                {initials}
              </Text>
            ) : (
              <Text style={{ fontSize: sz * 0.42 }}>💰</Text>
            )}
          </View>
        )}
      </View>

      {/* Speech bubble */}
      {showBubble && !!message && (
        <Animated.View
          style={[
            styles.bubble,
            {
              backgroundColor: colors.primary,
              opacity: bubbleFade,
              transform: [{ translateY: bubbleSlide }],
            },
          ]}
        >
          <View style={[styles.bubbleTail, { borderBottomColor: colors.primary }]} />
          <Text style={styles.bubbleText} numberOfLines={3}>{message}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    shadowOpacity: 0.14,
  },
  initialsWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    top: '112%',
    right: 0,
    maxWidth: 175,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 13,
    borderTopRightRadius: 3,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.2,
  },
  bubbleTail: {
    position: 'absolute',
    top: -6,
    right: 11,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
});

export default UserAvatar;