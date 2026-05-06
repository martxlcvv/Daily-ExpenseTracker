import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Reusable animated view component for smooth transitions and entrance animations
 */
const AnimatedView = ({
  children,
  style,
  animation = 'fadeSlideUp', // fadeSlideUp, fade, slideUp, scale
  duration = 400,
  delay = 0,
  ...props
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    let animationSequence = [];

    switch (animation) {
      case 'fadeSlideUp':
        animationSequence = [
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ]),
        ];
        break;

      case 'fade':
        animationSequence = [
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ];
        break;

      case 'slideUp':
        animationSequence = [
          Animated.timing(slideAnim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ];
        break;

      case 'scale':
        animationSequence = [
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ];
        break;

      default:
        animationSequence = [
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ];
    }

    const delayedAnimation = Animated.sequence(
      delay > 0 ? [Animated.delay(delay), ...animationSequence] : animationSequence
    );

    delayedAnimation.start();
  }, [animation, duration, delay]);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [
      { translateY: slideAnim },
      { scale: scaleAnim },
    ],
  };

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};

export default AnimatedView;
