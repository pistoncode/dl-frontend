import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface OptionButtonProps {
  title: string;
  isSelected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'default' | 'compact';
}

const OptionButton: React.FC<OptionButtonProps> = ({
  title,
  isSelected = false,
  onPress,
  disabled = false,
  variant = 'default',
}) => {
  const buttonStyle: ViewStyle[] = [
    variant === 'compact' ? styles.buttonCompact : styles.button,
    ...(isSelected ? [styles.buttonSelected] : []),
    ...(disabled ? [styles.buttonDisabled] : []),
  ];

  const textStyle: TextStyle[] = [
    variant === 'compact' ? styles.textCompact : styles.text,
    ...(isSelected ? [styles.textSelected] : []),
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ 
        selected: isSelected,
        disabled: disabled 
      }}
      accessibilityHint={`${isSelected ? 'Selected' : 'Not selected'}. Tap to ${isSelected ? 'deselect' : 'select'}.`}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 46,
    borderWidth: 1,
    borderColor: '#EDF1F3',
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    shadowColor: '#E4E5E7',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.24,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonCompact: {
    borderWidth: 1,
    borderColor: '#EDF1F3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  buttonSelected: {
    borderColor: '#FE9F4D',
    backgroundColor: '#FFF7F0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1C1E',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  textCompact: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1C1E',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  textSelected: {
    color: '#FE9F4D',
    fontWeight: '600',
  },
});

export default OptionButton;