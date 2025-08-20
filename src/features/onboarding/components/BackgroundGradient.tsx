import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

/**
 * BackgroundGradient Component
 * 
 * Provides a consistent gradient background for all onboarding screens.
 * The gradient transitions from the brand orange color at the top to white
 * at the bottom, creating a subtle and professional appearance.
 * 
 * Features:
 * - Responsive width that adapts to screen size
 * - Positioned absolutely to sit behind all screen content
 * - Smooth 3-color gradient transition
 * - Optimized z-index to ensure proper layering
 * 
 * @component
 * @example
 * ```tsx
 * <SafeAreaView style={styles.container}>
 *   <BackgroundGradient />
 *   // Your screen content here
 * </SafeAreaView>
 * ```
 */
const BackgroundGradient: React.FC = React.memo(() => {
  return (
    <LinearGradient
      colors={['#FE9F4D', '#FFF5EE', '#FFFFFF']}
      locations={[0, 0.3, 0.7]}
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    />
  );
});

BackgroundGradient.displayName = 'BackgroundGradient';

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    top: -50, // Move gradient up to make it more subtle
    left: 0,
    right: 0,
    height: 335, // Reduce height for softer appearance
    width: screenWidth,
    zIndex: 0,
  },
});

export default BackgroundGradient;