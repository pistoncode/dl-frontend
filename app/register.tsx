import React from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSignUp = () => {
    if (!username.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // TODO: Implement actual sign up logic
    Alert.alert('Sign Up', 'Sign up functionality to be implemented');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook OAuth
    Alert.alert('Facebook Login', 'Facebook login to be implemented');
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    Alert.alert('Google Login', 'Google login to be implemented');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setUsernameFocused(false);
    setEmailFocused(false);
    setPhoneFocused(false);
    setPasswordFocused(false);
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
            <ThemedText style={styles.title}>DEUCE</ThemedText>
          </View>
          
          <View style={styles.formContainer}>
          <ThemedText style={styles.welcomeText}>Join our leagues</ThemedText>
          
          {/* Username Field */}
          <View style={styles.inputContainer}>
            {/* <ThemedText style={styles.inputLabel}>Username</ThemedText> */}
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder={usernameFocused ? "" : "Username"}
              placeholderTextColor="#B0B8C1"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
            />
          </View>
          
          {/* Email Field */}
          <View style={styles.inputContainer}>
            {/* <ThemedText style={styles.inputLabel}>Email</ThemedText> */}
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={emailFocused ? "" : "Email"}
              placeholderTextColor="#B0B8C1"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
          
          {/* Phone Number Field */}
          <View style={styles.inputContainer}>
            {/* <ThemedText style={styles.inputLabel}>Phone Number</ThemedText> */}
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder={phoneFocused ? "" : "Phone Number"}
              placeholderTextColor="#B0B8C1"
              keyboardType="phone-pad"
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
            />
          </View>
          
          {/* Password Field */}
          <View style={styles.inputContainer}>
            {/* <ThemedText style={styles.inputLabel}>Password</ThemedText> */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder={passwordFocused ? "" : "Password"}
                placeholderTextColor="#B0B8C1"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              {password.length > 0 && (
                <Pressable
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#6C7278"
                    style={{ opacity: 0.5 }}
                  />
                </Pressable>
              )}
            </View>
          </View>
          
          {/* Terms Agreement Text */}
          <View style={styles.termsContainer}>
            <ThemedText style={styles.termsText}>
              By clicking the <ThemedText style={styles.registerHighlight}>Register</ThemedText> button, you agree to the public offer.
            </ThemedText>
          </View>
          
          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignUp}
            style={({ pressed }) => [
              styles.signUpButton,
              { opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <ThemedText style={styles.signUpButtonText}>Sign Up</ThemedText>
          </Pressable>
          
          {/* Divider with text */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>or sign up with</ThemedText>
            <View style={styles.dividerLine} />
          </View>
          
          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            <Pressable
              onPress={handleFacebookLogin}
              style={({ pressed }) => [
                styles.socialButton,
                styles.facebookButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Ionicons name="logo-facebook" size={28} color="#FFFFFF" />
            </Pressable>
            
            <Pressable
              onPress={handleGoogleLogin}
              style={({ pressed }) => [
                styles.socialButton,
                styles.googleButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Image
                source={require('@/assets/images/googleicon.svg')}
                style={{ width: 24, height: 24 }}
              />
            </Pressable>
          </View>
          
          {/* Login Link */}
          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
            <Pressable 
              onPress={handleLogin}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <ThemedText style={styles.loginLink}>Log In</ThemedText>
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
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: Colors.light.brand.orange,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 30,
    paddingTop: 10,
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingTop: 40,
    minHeight: 750,
  },
  inputContainer: {
    marginBottom: 20,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EDF1F3',
    elevation: 2,
    minHeight: 52,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsContainer: {
    marginBottom: 25,
  },
  termsText: {
    fontSize: 12,
    color: '#6C7278',
    textAlign: 'left',
    lineHeight: 16,
  },
  registerHighlight: {
    fontSize: 12,
    color: '#FE9F4D',
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: '#FE9F4D',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 2,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    fontSize: 14,
    color: '#6C7278',
    marginHorizontal: 15,
    fontWeight: '400',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 30,
  },
  socialButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F7F7F7',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
