/**
 * UserAvatar.js — Gen-Z Tagalog avatar with animated face, pulsing ring, speech bubble
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

// ── Speaking mouth ────────────────────────────────────────────────────────────
const SpeakingMouth = ({ isActive, color }) => {
  const open = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isActive) {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(open, { toValue: 1,   duration: 130, useNativeDriver: false, easing: Easing.out(Easing.ease) }),
        Animated.timing(open, { toValue: 0.2, duration: 100, useNativeDriver: false }),
        Animated.timing(open, { toValue: 0.8, duration: 110, useNativeDriver: false }),
        Animated.timing(open, { toValue: 0,   duration: 150, useNativeDriver: false }),
        Animated.delay(170),
      ]));
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(open, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  }, [isActive]);
  const mouthH = open.interpolate({ inputRange: [0, 1], outputRange: [2, 7] });
  return <Animated.View style={{ width: 12, height: mouthH, borderRadius: 4, backgroundColor: color, marginTop: 4 }} />;
};

// ── Face ──────────────────────────────────────────────────────────────────────
const CodedFace = ({ size, isSpeaking, accentColor }) => {
  const eyeSize = size * 0.09;
  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(2800 + Math.random() * 1400),
      Animated.timing(blink, { toValue: 0.08, duration: 75, useNativeDriver: false }),
      Animated.timing(blink, { toValue: 1, duration: 75, useNativeDriver: false }),
      Animated.delay(200),
      Animated.timing(blink, { toValue: 0.08, duration: 75, useNativeDriver: false }),
      Animated.timing(blink, { toValue: 1, duration: 75, useNativeDriver: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  const eyeH = blink.interpolate({ inputRange: [0.08, 1], outputRange: [eyeSize * 0.08, eyeSize] });
  return (
    <View style={[styles.face, { width: size * 0.76, height: size * 0.76, borderRadius: size * 0.38, backgroundColor: accentColor + '20', borderColor: accentColor + '50' }]}>
      <View style={{ flexDirection: 'row', gap: size * 0.1, marginBottom: size * 0.04 }}>
        {[0, 1].map((i) => (
          <Animated.View key={i} style={{ width: eyeSize, height: eyeH, borderRadius: eyeSize / 2, backgroundColor: accentColor }} />
        ))}
      </View>
      {/* Cheeks */}
      <View style={{ flexDirection: 'row', gap: size * 0.22, position: 'absolute', bottom: size * 0.24 }}>
        {[0, 1].map((i) => (
          <View key={i} style={{ width: size * 0.1, height: size * 0.055, borderRadius: size * 0.1, backgroundColor: '#FF8FAB44' }} />
        ))}
      </View>
      <SpeakingMouth isActive={isSpeaking} color={accentColor} />
    </View>
  );
};

// ── Main Avatar ───────────────────────────────────────────────────────────────
const UserAvatar = ({ size = 'md', message = '', showBubble = true, isSpeaking = false }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const sz = { sm: Math.min(width * 0.11, 48), md: Math.min(width * 0.18, 76), lg: Math.min(width * 0.26, 108) }[size] ?? 76;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0.5)).current;
  const bubbleFade  = useRef(new Animated.Value(0)).current;
  const bubbleSlide = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.07, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const glow = Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 1600, useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 0.5, duration: 1600, useNativeDriver: false }),
    ]));
    pulse.start(); glow.start();
    return () => { pulse.stop(); glow.stop(); };
  }, []);

  useEffect(() => {
    if (message) {
      bubbleFade.setValue(0); bubbleSlide.setValue(10);
      Animated.parallel([
        Animated.spring(bubbleFade,  { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 180 }),
        Animated.spring(bubbleSlide, { toValue: 0, useNativeDriver: true, damping: 16, stiffness: 180 }),
      ]).start();
    } else {
      Animated.timing(bubbleFade, { toValue: 0, duration: 160, useNativeDriver: true }).start();
    }
  }, [message]);

  const ringSize = sz + 12;
  const ringBorderColor = glowAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [colors.primary + '44', colors.primary + 'AA'],
  });

  return (
    <View style={styles.wrapper}>
      {/* Pulsing outer ring */}
      <Animated.View style={[styles.outerRing, {
        width: ringSize + 10, height: ringSize + 10, borderRadius: (ringSize + 10) / 2,
        borderColor: ringBorderColor, transform: [{ scale: pulseAnim }],
      }]} />

      {/* Main ring */}
      <View style={[styles.ring, {
        width: ringSize, height: ringSize, borderRadius: ringSize / 2,
        backgroundColor: colors.card, borderColor: colors.primary + '60',
        shadowColor: colors.primary,
      }]}>
        {AVATAR_SRC ? (
          <Image source={AVATAR_SRC} style={{ width: sz, height: sz, borderRadius: sz / 2 }} resizeMode="cover" />
        ) : (
          <CodedFace size={sz} isSpeaking={isSpeaking} accentColor={colors.primary} />
        )}
      </View>

      {/* Speech bubble with Tagalog Gen-Z text */}
      {showBubble && message ? (
        <Animated.View style={[styles.bubble, {
          backgroundColor: colors.primary,
          opacity: bubbleFade,
          transform: [{ translateY: bubbleSlide }],
          maxWidth: 210,
        }]}>
          <View style={[styles.bubbleTail, { borderBottomColor: colors.primary }]} />
          <Text style={styles.bubbleText} numberOfLines={3}>{message}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 10 },
  outerRing: { position: 'absolute', borderWidth: 2, borderStyle: 'dashed' },
  ring: {
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  face: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  bubble: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, borderTopLeftRadius: 4,
    elevation: 5, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, shadowOpacity: 0.22,
  },
  bubbleTail: {
    position: 'absolute', top: -7, left: 16,
    width: 0, height: 0,
    borderLeftWidth: 7, borderRightWidth: 7, borderBottomWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  bubbleText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', lineHeight: 17 },
});

export default UserAvatar;