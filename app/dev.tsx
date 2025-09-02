import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function DevScreen() {
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to user dashboard for development
    router.replace('/user-dashboard');
  }, []);

  return (
    <View style={styles.container}>
      <Text>Redirecting to user dashboard...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
