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
import { authClient } from '@/lib/auth-client';
import { getBackendBaseURL } from '@/config/network';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      return false; // Default to not completed on error
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('Calling authClient.signIn.username...');

      const { data, error } = await authClient.signIn.username({
        username: username, 
        password: password,
      });

      if (error) {
        console.error('API Error:', error.message);
        Alert.alert('Sign In Failed', error.message || 'Invalid credentials.');
        return;
      }

      if (data) {
        console.log('Sign-in call completed successfully.');
        
        // Check if user has completed onboarding
        const hasCompletedOnboarding = await checkOnboardingStatus(data.user.id);
        
        if (hasCompletedOnboarding) {
          console.log('User has completed onboarding, redirecting to user dashboard');
          router.replace('/user-dashboard');
        } else {
          console.log('User has not completed onboarding, redirecting to onboarding');
          router.replace('/onboarding/personal-info');
        }
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Sign In Error:', error);
      Alert.alert('Sign In Failed', error.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    // TODO: Implement forgot password logic
    const { data, error } = await authClient.requestPasswordReset({
      email: email, // required
      redirectTo: "", //dummy url
  });
  if (error) {
    console.error('Error sending reset password email:', error);
    Alert.alert('Error', 'Failed to send reset password email');
  } else {
    Alert.alert('Forgot Password', 'Reset password email sent');
  }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.social({
        provider: "facebook"
      });
      
      if (error) {
        console.error('Facebook login error:', error);
        Alert.alert('Login Failed', 'Facebook login failed');
        return;
      }

      if (data?.user) {
        const hasCompletedOnboarding = await checkOnboardingStatus(data.user.id);
        
        if (hasCompletedOnboarding) {
          console.log('User has completed onboarding, redirecting to user dashboard');
          router.replace('/user-dashboard');
        } else {
          console.log('User has not completed onboarding, redirecting to onboarding');
          router.replace('/onboarding/personal-info');
        }
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      Alert.alert('Login Failed', 'Facebook login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      console.log('Calling authClient.signIn.social...');
      const { data, error } = await authClient.signIn.social({
        provider: "google",
      });
      
      if (error) {
        console.error('Google login error:', error);
        Alert.alert('Login Failed', 'Google login failed');
        return;
      }

      if (data?.user) {
        const hasCompletedOnboarding = await checkOnboardingStatus(data.user.id);
        
        if (hasCompletedOnboarding) {
          console.log('User has completed onboarding, redirecting to user dashboard');
          router.replace('/user-dashboard');
        } else {
          console.log('User has not completed onboarding, redirecting to onboarding');
          router.replace('/onboarding/personal-info');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Login Failed', 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setUsernameFocused(false);
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
        <ThemedText style={styles.welcomeText}>Welcome back!</ThemedText>
        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>Username or email</ThemedText>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder={usernameFocused ? "" : "Username or email"}
            placeholderTextColor="#B0B8C1"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setUsernameFocused(true)}
            onBlur={() => setUsernameFocused(false)}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>Password</ThemedText>
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
        
        <View style={styles.forgotPasswordContainer}>
          <Pressable 
            onPress={handleForgotPassword}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
          </Pressable>
        </View>
        
        <Pressable
          onPress={handleSignIn}
          style={({ pressed }) => [
            styles.signInButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <ThemedText style={styles.signInButtonText}>Sign In</ThemedText>
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
        
        {/* Register Link */}
        <View style={styles.registerContainer}>
          <ThemedText style={styles.registerText}>Don't have an account yet? </ThemedText>
          <Pressable 
            onPress={handleRegister}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <ThemedText style={styles.registerLink}>Create now!</ThemedText>
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
    minHeight: 600,
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
    paddingVertical: 18,
    fontSize: 16,
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 5,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.light.brand.orange,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#FE9F4D',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 2,
  },
  signInButtonText: {
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#6C7278',
  },
  registerLink: {
    fontSize: 14,
    color: '#4D81E7',
    fontWeight: '600',
  },
});
