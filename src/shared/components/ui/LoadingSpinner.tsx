/**
 * Loading Spinner Component
 * 
 * Provides a consistent loading indicator across the application with enhanced styling.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  Animated,
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
  /** Show loading card instead of simple spinner */
  showCard?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'large',
  color = '#FE9F4D',
  style,
  overlay = false,
  showCard = false,
}) => {
  const containerStyle = [
    overlay ? styles.overlay : styles.container,
    style,
  ];

  const contentStyle = showCard && overlay ? styles.card : styles.content;

  return (
    <View style={containerStyle}>
      <View style={contentStyle}>
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text style={[
            styles.message,
            showCard && styles.cardMessage
          ]}>
            {message}
          </Text>
        )}
      </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EDF1F3',
    minWidth: 200,
  },
  message: {
    fontSize: 14,
    color: '#6C7278',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  cardMessage: {
    fontSize: 16,
    color: '#1A1C1E',
    fontWeight: '600',
    letterSpacing: -0.01,
  },
});

export default LoadingSpinner;