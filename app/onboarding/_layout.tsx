import { Stack } from 'expo-router';
import { OnboardingProvider } from '../../src/contexts/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="personal-info" />
        <Stack.Screen name="location" />
        <Stack.Screen name="game-select" />
        <Stack.Screen name="skill-assessment" />
        <Stack.Screen name="profile-picture" />
      </Stack>
    </OnboardingProvider>
  );
}