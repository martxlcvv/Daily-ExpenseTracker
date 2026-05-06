import { useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';

/**
 * Reusable animated button component with press feedback
 */
const AnimatedButton = ({
  onPress,
  children,
  style,
  disabled = false,
  activeOpacity = 0.7,
  scaleAmount = 0.95,
  duration = 100,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scaleAmount,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={!disabled ? handlePressIn : undefined}
      onPressOut={!disabled ? handlePressOut : undefined}
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
      activeOpacity={activeOpacity}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedButton;
