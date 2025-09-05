import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authClient } from '@/lib/auth-client';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params.email);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);

  useEffect(() => {
    if (typeof params.email === 'string' && params.email ) {
      setEmail(params.email);
      authClient.emailOtp.sendVerificationOtp({
        email: params.email,
        type: "email-verification",
      });
    }
  }, [params.email]);

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (error) {
        Alert.alert('Verification Failed', error.message || 'The code is incorrect. Please try again.');
      } else if (data) {
        Alert.alert(
          'Success',
          'Your email has been verified successfully.',
          [{ text: 'OK', onPress: () => router.replace('/') }]
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "email-verification",
      });
      Alert.alert('Code Sent', `A new verification code has been sent to ${email}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setOtpFocused(false);
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
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#6C7278" />
            </Pressable>
            <ThemedText style={styles.title}>DEUCE</ThemedText>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.formContainer}>
            <ThemedText style={styles.welcomeText}>Verify Your Email</ThemedText>
            <ThemedText style={styles.instructionText}>
              We've sent a 6-digit verification code to your email address{' '}
              <ThemedText style={{ fontWeight: 'bold' }}>{email}</ThemedText>.
            </ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Verification Code</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  otpFocused && styles.inputFocused
                ]}
                value={otp}
                onChangeText={setOtp}
                placeholder={otpFocused ? "" : "Enter 6-digit code"}
                placeholderTextColor="#B0B8C1"
                keyboardType="number-pad"
                maxLength={6}
                onFocus={() => setOtpFocused(true)}
                onBlur={() => setOtpFocused(false)}
                editable={!isLoading}
              />
            </View>

            <Pressable
              onPress={handleVerifyOtp}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed || isLoading ? 0.8 : 1 },
                isLoading && styles.actionButtonDisabled
              ]}
            >
              <ThemedText style={styles.actionButtonText}>
                {isLoading ? 'Verifying...' : 'Verify'}
              </ThemedText>
            </Pressable>

            <View style={styles.footerContainer}>
              <ThemedText style={styles.footerText}>Didn't receive a code? </ThemedText>
              <Pressable
                onPress={handleResendOtp}
                disabled={isLoading}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <ThemedText style={styles.footerLink}>Resend Code</ThemedText>
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
    width: 40,
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingTop: 40,
    minHeight: 600,
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
  actionButton: {
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
  actionButtonDisabled: {
    backgroundColor: '#B0B8C1',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6C7278',
  },
  footerLink: {
    fontSize: 14,
    color: '#4D81E7',
    fontWeight: '600',
  },
});
