import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// ── Place your avatar image at: assets/avatar.png ────────────────────────────
// The user should place their avatar image file at assets/avatar.png
let AVATAR_SRC;
try {
  AVATAR_SRC = require('../../assets/avatar.png');
} catch {
  AVATAR_SRC = null;
}

const UserAvatar = ({
  size = 'md',
  message = '',
  showBubble = true,
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const sizeMap = {
    sm: { container: Math.min(width * 0.1, 44), border: 2 },
    md: { container: Math.min(width * 0.18, 72), border: 3 },
    lg: { container: Math.min(width * 0.26, 104), border: 3 },
  };
  const cfg = sizeMap[size] || sizeMap.md;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 1800, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1,    duration: 1800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const ringSize = cfg.container + cfg.border * 2 + 6;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: cfg.border,
            borderColor: colors.primary + '60',
            backgroundColor: colors.card,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {AVATAR_SRC ? (
          <Image
            source={AVATAR_SRC}
            style={{
              width: cfg.container,
              height: cfg.container,
              borderRadius: cfg.container / 2,
            }}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.fallback, { width: cfg.container, height: cfg.container, borderRadius: cfg.container / 2, backgroundColor: colors.primary + '22' }]}>
            <Text style={{ fontSize: cfg.container * 0.5 }}>🐿️</Text>
          </View>
        )}
      </Animated.View>

      {showBubble && message ? (
        <View style={[styles.bubble, { backgroundColor: colors.primary, maxWidth: 180 }]}>
          <Text style={styles.bubbleText} numberOfLines={2}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 6 },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    shadowOpacity: 0.18,
  },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.15,
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default UserAvatar;