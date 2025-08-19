import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <OnboardingNavigator />
    </NavigationContainer>
  );
}