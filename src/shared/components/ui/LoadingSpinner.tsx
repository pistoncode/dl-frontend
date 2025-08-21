/**
 * Loading Spinner Component
 * 
 * Provides a consistent loading indicator across the application.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';

interface LoadingSpinnerProps {
  /** Loading message to display */
  message?: string;
  /** Size of the spinner */
  size?: 'small' | 'large';
  /** Color of the spinner */
  color?: string;
  /** Custom container style */
  style?: ViewStyle;
  /** Whether to show as overlay */
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'large',
  color = '#FE9F4D',
  style,
  overlay = false,
}) => {
  const containerStyle = [
    overlay ? styles.overlay : styles.container,
    style,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  message: {
    fontSize: 14,
    color: '#6C7278',
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});

export default LoadingSpinner;