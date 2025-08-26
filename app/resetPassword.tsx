import React from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authClient } from '@/lib/auth-client';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.requestPasswordReset({
        email: "email",
        redirectTo: "/login", // TODO: Configure proper redirect URL
      });
      console.log(data, error);
      if (error) {
        console.error('Error sending reset password email:', error);
        Alert.alert(
          'Error', 
          error.message || 'Failed to send reset password email. Please try again.'
        );
      } else {
        Alert.alert(
          'Reset Email Sent', 
          `We've sent a password reset link to ${email}. Please check your email and follow the instructions.    DOESN'T SEND ANYTHING YET`,
          [
            {
              text: 'Back to Login',
              onPress: () => router.replace('/login')
            }
          ]
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/login');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setEmailFocused(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header with back button */}
          <View style={styles.header}>
            <Pressable 
              style={styles.backButton}
              onPress={handleBackToLogin}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#6C7278" />
            </Pressable>
            <ThemedText style={styles.title}>DEUCE</ThemedText>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.formContainer}>
            <ThemedText style={styles.welcomeText}>Reset Password</ThemedText>
            
            <ThemedText style={styles.instructionText}>
              Enter your email address and we'll send you a link to reset your password.
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Email address</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder={emailFocused ? "" : "Enter your email address"}
                placeholderTextColor="#B0B8C1"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                editable={!isLoading}
              />
            </View>
            
            <Pressable
              onPress={handleResetPassword}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.resetButton,
                { opacity: pressed || isLoading ? 0.8 : 1 },
                isLoading && styles.resetButtonDisabled
              ]}
            >
              <ThemedText style={styles.resetButtonText}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </ThemedText>
            </Pressable>
            
            {/* Back to Login Link */}
            <View style={styles.loginContainer}>
              <ThemedText style={styles.loginText}>Remember your password? </ThemedText>
              <Pressable 
                onPress={handleBackToLogin}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <ThemedText style={styles.loginLink}>Sign in</ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 5,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: Colors.light.brand.orange,
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    paddingTop: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#6C7278',
    lineHeight: 24,
    marginBottom: 40,
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingTop: 40,
    minHeight: 600,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C7278',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#EDF1F3',
    elevation: 2,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: Colors.light.brand.orange,
  },
  resetButton: {
    backgroundColor: '#FE9F4D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 2,
    marginBottom: 30,
  },
  resetButtonDisabled: {
    backgroundColor: '#B0B8C1',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#6C7278',
  },
  loginLink: {
    fontSize: 14,
    color: '#4D81E7',
    fontWeight: '600',
  },
});
