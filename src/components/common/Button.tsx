import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  // Build button styles
  const buttonStyles: ViewStyle[] = [styles.button];

  // Add variant styles
  if (variant === 'primary') {
    buttonStyles.push(styles.primaryButton as ViewStyle);
  } else if (variant === 'secondary') {
    buttonStyles.push(styles.secondaryButton as ViewStyle);
  } else if (variant === 'outline') {
    buttonStyles.push(styles.outlineButton as ViewStyle);
  }

  // Add size styles
  if (size === 'small') {
    buttonStyles.push(styles.smallButton as ViewStyle);
  } else if (size === 'large') {
    buttonStyles.push(styles.largeButton as ViewStyle);
  }

  // Add disabled styles
  if (disabled) {
    buttonStyles.push(styles.disabledButton as ViewStyle);
  }

  // Add custom styles
  if (style) {
    buttonStyles.push(style);
  }

  // Build text styles
  const textStyles: TextStyle[] = [styles.buttonText];

  // Add variant-specific text styles
  if (variant === 'primary') {
    textStyles.push(styles.primaryButtonText as TextStyle);
  } else if (variant === 'secondary') {
    textStyles.push(styles.secondaryButtonText as TextStyle);
  } else if (variant === 'outline') {
    textStyles.push(styles.outlineButtonText as TextStyle);
  }

  // Add size-specific text styles
  if (size === 'small') {
    textStyles.push(styles.smallButtonText as TextStyle);
  } else if (size === 'large') {
    textStyles.push(styles.largeButtonText as TextStyle);
  }

  // Add disabled text styles
  if (disabled) {
    textStyles.push(styles.disabledButtonText as TextStyle);
  }

  // Add custom text styles
  if (textStyle) {
    textStyles.push(textStyle);
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? '#86C232' : '#222629'}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#86C232',
  },
  secondaryButton: {
    backgroundColor: '#2C3531',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#86C232',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  primaryButtonText: {
    color: '#222629',
  },
  secondaryButtonText: {
    color: '#2C3531',
  },
  outlineButtonText: {
    color: '#86C232',
  },
  smallButtonText: {
    fontSize: 12,
  },
  largeButtonText: {
    fontSize: 16,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
});

export default Button;
