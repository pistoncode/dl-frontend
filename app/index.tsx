import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSession } from '@/lib/auth-client';
import { getBackendBaseURL } from '@/config/network';

export default function HomeScreen() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const backendUrl = getBackendBaseURL();
      const response = await fetch(`${backendUrl}/api/onboarding/status/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.completedOnboarding;
      }
      return false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isPending) return; // Wait for session to load
      
      if (session?.user) {
        console.log('User is authenticated, checking onboarding status');
        const hasCompletedOnboarding = await checkOnboardingStatus(session.user.id);
        
        if (hasCompletedOnboarding) {
          console.log('User has completed onboarding, redirecting to user dashboard');
          router.replace('/user-dashboard');
        } else {
          console.log('User has not completed onboarding, redirecting to onboarding');
          router.replace('/onboarding/personal-info');
        }
      }
    };

    checkAuthStatus();
  }, [session, isPending, router]);

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
            
      {/* Background Mascot */}
      <Image
        source={require('@/assets/images/Mascot.png')}
        style={styles.backgroundMascot}
        contentFit="cover"
      />
      
      <View style={styles.header}>
        <ThemedText style={styles.title}>DEUCE</ThemedText>
        <ThemedText style={styles.subtitle}>The No. 1 competitive Sports League app in Malaysia</ThemedText>
      </View>
      
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => {
            // Haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleGetStarted();
          }}
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <ThemedText style={styles.buttonText}>Get Started</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2',
  },
  backgroundMascot: {
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 1,
    zIndex: 0,
  },
  header: {
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingLeft: 25,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    paddingTop: 30,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: Colors.light.brand.orange,
  },
  subtitle: {
    fontSize: 18,
    color: '#000000',
    fontStyle: 'italic',
    paddingTop: 10,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.84,
    elevation: 2,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
});
