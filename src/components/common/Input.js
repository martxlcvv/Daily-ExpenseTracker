import { MaterialIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { FontSize, FontWeight } from '../../theme/typography';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  error,
  icon,
  rightElement,
  style,
  inputStyle,
  editable = true,
  autoCapitalize = 'sentences',
  returnKeyType,
  onSubmitEditing,
  prefix,
  maxLength,
}) => {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(focusAnim, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(focusAnim, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: false }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.danger : colors.border,
      error ? colors.danger : colors.primary,
    ],
  });

  const borderWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 2],
  });

  return (
    <View style={[s.container, style]}>
      {label && (
        <Text style={[s.label, { color: colors.textSecondary }]}>{label}</Text>
      )}

      <Animated.View
        style={[
          s.inputWrapper,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderWidth,
            borderRadius: BorderRadius.md,
          },
        ]}
      >
        {icon && (
          <View style={s.iconLeft}>
            <MaterialIcons
              name={icon}
              size={19}
              color={focused ? colors.primary : colors.textTertiary}
            />
          </View>
        )}

        {prefix && (
          <Text style={[s.prefix, { color: focused ? colors.text : colors.textSecondary }]}>
            {prefix}
          </Text>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          maxLength={maxLength}
          style={[
            s.input,
            {
              color: colors.text,
              flex: 1,
              height: multiline ? numberOfLines * 24 + 24 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={s.iconRight}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={19}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}

        {rightElement && <View style={s.iconRight}>{rightElement}</View>}
      </Animated.View>

      {error && (
        <Text style={[s.errorText, { color: colors.danger }]}>{error}</Text>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    minHeight: 52,
  },
  input: {
    fontSize: FontSize.base,
    paddingVertical: Spacing.md,
    letterSpacing: 0.1,
  },
  iconLeft:  { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
  prefix: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    marginRight: Spacing.xs,
    letterSpacing: -0.3,
  },
  errorText: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    marginLeft: 2,
    letterSpacing: 0.1,
  },
});

export default Input;