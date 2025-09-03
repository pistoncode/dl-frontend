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
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSendOtp = async () => {
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
      console.log("Sending OTP to", email);
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: email, // required
        type: "forget-password", // required
      });
      console.log('data', data, 'error', error);
      if (error) {
        console.error('Error sending reset password email:', error);
        Alert.alert(
          'Error', 
          error.message || 'Failed to send reset password email. Please try again.'
        );
      } else if (data) {
        Alert.alert(
          'OTP Sent', 
          `We've sent a one-time code to ${email}. Please check your email and enter the code.`
        );
        setOtpSent(true);
      } else {
        Alert.alert('Error', 'Failed to send reset password email. Please try again.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // Assuming the method is `resetPassword` under `emailOtp` based on docs
      // and existing `sendVerificationOtp` call.
      const { data, error } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password: newPassword,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to reset password.');
      } else {
        Alert.alert(
          'Success',
          'Your password has been reset successfully.',
          [
            {
              text: 'Back to Login',
              onPress: () => router.replace('/login'),
            },
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
    setOtpFocused(false);
    setNewPasswordFocused(false);
    setConfirmPasswordFocused(false);
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
            
            {!otpSent ? (
              <>
                <ThemedText style={styles.instructionText}>
                  Enter your email address and we'll send you a code to reset your password.
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
                  onPress={handleSendOtp}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.resetButton,
                    { opacity: pressed || isLoading ? 0.8 : 1 },
                    isLoading && styles.resetButtonDisabled
                  ]}
                >
                  <ThemedText style={styles.resetButtonText}>
                    {isLoading ? 'Sending...' : 'Send Code'}
                  </ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <ThemedText style={styles.instructionText}>
                  Enter the code sent to {email} and your new password.
                </ThemedText>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Verification Code</ThemedText>
                  <TextInput
                    style={[styles.input, otpFocused && styles.inputFocused]}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder={otpFocused ? "" : "Enter the 6-digit code"}
                    placeholderTextColor="#B0B8C1"
                    keyboardType="number-pad"
                    maxLength={6}
                    onFocus={() => setOtpFocused(true)}
                    onBlur={() => setOtpFocused(false)}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>New Password</ThemedText>
                  <View>
                    <TextInput
                      style={[styles.input, newPasswordFocused && styles.inputFocused]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder={newPasswordFocused ? "" : "Enter your new password"}
                      placeholderTextColor="#B0B8C1"
                      secureTextEntry={!isPasswordVisible}
                      autoCapitalize="none"
                      onFocus={() => setNewPasswordFocused(true)}
                      onBlur={() => setNewPasswordFocused(false)}
                      editable={!isLoading}
                    />
                    <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                      <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color="#6C7278" />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Confirm New Password</ThemedText>
                  <View>
                    <TextInput
                      style={[styles.input, confirmPasswordFocused && styles.inputFocused]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder={confirmPasswordFocused ? "" : "Confirm your new password"}
                      placeholderTextColor="#B0B8C1"
                      secureTextEntry={!isConfirmPasswordVisible}
                      autoCapitalize="none"
                      onFocus={() => setConfirmPasswordFocused(true)}
                      onBlur={() => setConfirmPasswordFocused(false)}
                      editable={!isLoading}
                    />
                     <Pressable onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
                      <Ionicons name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color="#6C7278" />
                    </Pressable>
                  </View>
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
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </ThemedText>
                </Pressable>

                <Pressable onPress={() => setOtpSent(false)} disabled={isLoading}>
                  <ThemedText style={styles.loginLink}>Back</ThemedText>
                </Pressable>
              </>
            )}
            
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
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 14,
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
