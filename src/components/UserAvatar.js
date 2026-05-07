/**
 * UserAvatar.js — Animated Gen-Z style avatar
 * Features: pulsing ring, speaking mouth animation, SVG-style face via Views,
 *           image-based override (place avatar.png at assets/), customizable colors
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
import { useTheme } from '../context/ThemeContext';

let AVATAR_SRC;
try { AVATAR_SRC = require('../../../assets/avatar.png'); } catch { AVATAR_SRC = null; }

// ─── Animated mouth that "speaks" ────────────────────────────────────────────
const SpeakingMouth = ({ isActive, color }) => {
  const open = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(open, { toValue: 1, duration: 140, useNativeDriver: false, easing: Easing.out(Easing.ease) }),
          Animated.timing(open, { toValue: 0.2, duration: 100, useNativeDriver: false }),
          Animated.timing(open, { toValue: 0.8, duration: 120, useNativeDriver: false }),
          Animated.timing(open, { toValue: 0, duration: 160, useNativeDriver: false }),
          Animated.delay(180),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(open, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  }, [isActive]);

  const mouthH = open.interpolate({ inputRange: [0, 1], outputRange: [2, 7] });

  return (
    <Animated.View
      style={{
        width: 12,
        height: mouthH,
        borderRadius: 4,
        backgroundColor: color,
        marginTop: 4,
      }}
    />
  );
};

// ─── Coded avatar face (View-based, no emoji) ─────────────────────────────────
const CodedFace = ({ size, isSpeaking, accentColor }) => {
  const eyeSize = size * 0.09;
  const faceR   = size * 0.38;
  const cheekSize = size * 0.1;

  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2800 + Math.random() * 1400),
        Animated.timing(blinkAnim, { toValue: 0.08, duration: 80,  useNativeDriver: false }),
        Animated.timing(blinkAnim, { toValue: 1,    duration: 80,  useNativeDriver: false }),
        Animated.delay(220),
        Animated.timing(blinkAnim, { toValue: 0.08, duration: 80,  useNativeDriver: false }),
        Animated.timing(blinkAnim, { toValue: 1,    duration: 80,  useNativeDriver: false }),
      ])
    );
    blinkLoop.start();
    return () => blinkLoop.stop();
  }, []);

  const eyeH = blinkAnim.interpolate({ inputRange: [0.08, 1], outputRange: [eyeSize * 0.08, eyeSize] });

  return (
    <View style={[styles.codedFace, {
      width: size * 0.76,
      height: size * 0.76,
      borderRadius: faceR,
      backgroundColor: accentColor + '22',
      borderWidth: 2,
      borderColor: accentColor + '55',
    }]}>
      {/* Eyes */}
      <View style={{ flexDirection: 'row', gap: size * 0.1, marginBottom: size * 0.04 }}>
        {[0, 1].map((i) => (
          <Animated.View
            key={i}
            style={{
              width: eyeSize,
              height: eyeH,
              borderRadius: eyeSize / 2,
              backgroundColor: accentColor,
            }}
          />
        ))}
      </View>

      {/* Cheeks */}
      <View style={{ flexDirection: 'row', gap: size * 0.22, position: 'absolute', bottom: size * 0.24 }}>
        {[0, 1].map((i) => (
          <View key={i} style={{
            width: cheekSize,
            height: cheekSize * 0.55,
            borderRadius: cheekSize,
            backgroundColor: '#FF8FAB44',
          }} />
        ))}
      </View>

      {/* Mouth */}
      <SpeakingMouth isActive={isSpeaking} color={accentColor} />
    </View>
  );
};

// ─── Main UserAvatar component ────────────────────────────────────────────────
const UserAvatar = ({
  size = 'md',         // 'sm' | 'md' | 'lg'
  message = '',
  showBubble = true,
  isSpeaking = false,  // parent drives the speaking animation
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const sizeMap = {
    sm: Math.min(width * 0.11, 48),
    md: Math.min(width * 0.18, 76),
    lg: Math.min(width * 0.26, 108),
  };
  const sz = sizeMap[size] ?? sizeMap.md;

  // Pulsing ring
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0.5)).current;

  // Bubble appear
  const bubbleFade = useRef(new Animated.Value(0)).current;
  const bubbleSlide = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1600, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1600, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1600, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 1600, useNativeDriver: false }),
      ])
    );
    pulse.start();
    glow.start();
    return () => { pulse.stop(); glow.stop(); };
  }, []);

  useEffect(() => {
    if (message) {
      bubbleFade.setValue(0);
      bubbleSlide.setValue(8);
      Animated.parallel([
        Animated.spring(bubbleFade,  { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200 }),
        Animated.spring(bubbleSlide, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }),
      ]).start();
    } else {
      Animated.timing(bubbleFade, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    }
  }, [message]);

  const ringSize = sz + 12;
  const ringBorderColor = glowAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [colors.primary + '44', colors.primary + 'AA'],
  });

  return (
    <View style={styles.wrapper}>
      {/* Pulsing glow ring */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: ringSize + 8,
            height: ringSize + 8,
            borderRadius: (ringSize + 8) / 2,
            borderColor: ringBorderColor,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Main ring */}
      <View style={[styles.ring, {
        width: ringSize,
        height: ringSize,
        borderRadius: ringSize / 2,
        backgroundColor: colors.card,
        borderColor: colors.primary + '60',
        elevation: 6,
        shadowColor: colors.primary,
      }]}>
        {AVATAR_SRC ? (
          <Image
            source={AVATAR_SRC}
            style={{ width: sz, height: sz, borderRadius: sz / 2 }}
            resizeMode="cover"
          />
        ) : (
          <CodedFace size={sz} isSpeaking={isSpeaking} accentColor={colors.primary} />
        )}
      </View>

      {/* Speech bubble */}
      {showBubble && message ? (
        <Animated.View style={[
          styles.bubble,
          {
            backgroundColor: colors.primary,
            opacity: bubbleFade,
            transform: [{ translateY: bubbleSlide }],
            maxWidth: 200,
          },
        ]}>
          {/* Tail */}
          <View style={[styles.bubbleTail, { borderBottomColor: colors.primary }]} />
          <Text style={styles.bubbleText} numberOfLines={3}>{message}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 10,
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.3,
  },
  codedFace: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    position: 'relative',
  },
  bubbleTail: {
    position: 'absolute',
    top: -6,
    left: 14,
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
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
});

export default UserAvatar;