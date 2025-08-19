import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      height: 36,
      paddingHorizontal: 24,
      fontSize: 12,
    },
    medium: {
      height: 40,
      paddingHorizontal: 36,
      fontSize: 14,
    },
    large: {
      height: 48,
      paddingHorizontal: 48,
      fontSize: 16,
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      backgroundColor: '#FE9F4D',
      borderWidth: 0,
      textColor: '#FFFFFF',
    },
    secondary: {
      backgroundColor: '#6E6E6E',
      borderWidth: 0,
      textColor: '#FFFFFF',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#FE9F4D',
      textColor: '#FE9F4D',
    },
  };

  const config = sizeConfig[size];
  const variantStyle = variantConfig[variant];

  const buttonStyle: ViewStyle[] = [
    styles.button,
    {
      height: config.height,
      paddingHorizontal: config.paddingHorizontal,
      backgroundColor: variantStyle.backgroundColor,
      borderWidth: variantStyle.borderWidth,
      borderColor: variantStyle.borderColor,
    },
    (disabled || loading) && styles.buttonDisabled,
    style,
  ];

  const buttonTextStyle: TextStyle[] = [
    styles.text,
    {
      fontSize: config.fontSize,
      color: variantStyle.textColor,
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} size="small" />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 24,
  },
});

export default PrimaryButton;