import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Svg, Path } from 'react-native-svg';
import { BackgroundGradient } from '../components';

const DefaultProfileIcon = () => (
  <Svg width="167" height="167" viewBox="0 0 167 167" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M83.5208 0.108276C37.4958 0.108276 0.1875 37.4166 0.1875 83.4416C0.1875 129.467 37.4958 166.775 83.5208 166.775C129.546 166.775 166.854 129.467 166.854 83.4416C166.854 37.4166 129.546 0.108276 83.5208 0.108276ZM54.3542 62.6083C54.3542 58.7781 55.1086 54.9853 56.5743 51.4467C58.0401 47.908 60.1885 44.6927 62.8969 41.9843C65.6053 39.2759 68.8206 37.1276 72.3592 35.6618C75.8979 34.196 79.6906 33.4416 83.5208 33.4416C87.351 33.4416 91.1438 34.196 94.6824 35.6618C98.2211 37.1276 101.436 39.2759 104.145 41.9843C106.853 44.6927 109.002 47.908 110.467 51.4467C111.933 54.9853 112.687 58.7781 112.687 62.6083C112.687 70.3438 109.615 77.7624 104.145 83.2322C98.675 88.702 91.2563 91.7749 83.5208 91.7749C75.7853 91.7749 68.3667 88.702 62.8969 83.2322C57.4271 77.7624 54.3542 70.3438 54.3542 62.6083ZM135.671 124.975C129.431 132.82 121.5 139.154 112.47 143.506C103.44 147.858 93.5446 150.115 83.5208 150.108C73.4971 150.115 63.6012 147.858 54.5714 143.506C45.5416 139.154 37.6109 132.82 31.3708 124.975C44.8792 115.283 63.3125 108.442 83.5208 108.442C103.729 108.442 122.162 115.283 135.671 124.975Z"
      fill="#6C7278"
    />
  </Svg>
);

const ProfilePictureScreen = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleComplete = () => {
    // Save profile data and navigate to main app
    Alert.alert('Success!', 'Onboarding completed! This would navigate to the main app.');
  };

  const handleSkip = () => {
    // Skip photo and navigate to main app
    Alert.alert('Success!', 'Onboarding completed! This would navigate to the main app.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundGradient />
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>DEUCE</Text>
      </View>

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>One final step...</Text>
        <Text style={styles.subtitle}>
          Don&apos;t be shy!
        </Text>
        <Text style={styles.description}>
          We recommend uploading a picture of you so other players can see you.
        </Text>
      </View>

      {/* Profile Image */}
      <View style={styles.imageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <DefaultProfileIcon />
        )}
      </View>

      {/* Upload/Change Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>
          {profileImage ? 'Change' : 'Upload'}
        </Text>
      </TouchableOpacity>

      {/* League Now Button */}
      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>League Now!</Text>
      </TouchableOpacity>

      {/* Skip Link */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#FE9F4D',
  },
  headerContainer: {
    paddingHorizontal: 37,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 40,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C7278',
    lineHeight: 20,
    letterSpacing: -0.01,
    fontFamily: 'Inter',
    textAlign: 'left',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C7278',
    lineHeight: 20,
    letterSpacing: -0.01,
    fontFamily: 'Inter',
    textAlign: 'left',
  },
  imageContainer: {
    width: 167,
    height: 167,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 167,
    height: 167,
    borderRadius: 83.5,
  },
  uploadButton: {
    height: 40,
    backgroundColor: '#6E6E6E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    marginTop: 10,
    marginBottom: 30,
    minWidth: 258,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
  },
  button: {
    position: 'absolute',
    bottom: 100,
    left: 71,
    right: 71,
    height: 40,
    backgroundColor: '#FE9F4D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
  },
  skipButton: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C7278',
    textDecorationLine: 'underline',
    lineHeight: 20,
    letterSpacing: -0.01,
  },
});

export default ProfilePictureScreen;