import { Stack } from 'expo-router';
import { DashboardProvider } from '@features/dashboard-user';

export default function DashboardLayout() {
  return (
    <DashboardProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="pickleball" />
        <Stack.Screen name="tennis" />
      </Stack>
    </DashboardProvider>
  );
}



