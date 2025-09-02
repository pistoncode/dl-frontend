import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  Image,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@core/theme/theme';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

// BackgroundGradient Component (consistent with profile and settings)
const BackgroundGradient = () => {
  return (
    <LinearGradient
      colors={['#FE9F4D', '#FFF5EE', '#FFFFFF']}
      locations={[0, 0.4, 1.0]}
      style={styles.backgroundGradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    />
  );
};

interface FormData {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  location: string;
  bio: string;
  profilePicture: string;
}

export default function EditProfileScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: 'Kenneth Riadi',
    username: 'Ken',
    email: 'ken@example.com',
    phoneNumber: '+60 12-345 6789',
    location: 'Sepang, Selangor',
    bio: 'Tennis enthusiast, weekend warrior, always up for a good match!',
    profilePicture: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImagePicker = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
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
      updateField('profilePicture', result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would make the actual API call to update the profile
      console.log('Profile updated:', formData);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof FormData,
    placeholder: string,
    multiline: boolean = false,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default'
  ) => (
    <View style={styles.inputContent}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={formData[field]}
        onChangeText={(text) => updateField(field, text)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.neutral.gray[400]}
        keyboardType={keyboardType}
        autoCapitalize={field === 'email' ? 'none' : 'words'}
        autoCorrect={field !== 'email' && field !== 'username'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <BackgroundGradient />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            accessible={true}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
          
          <Text style={styles.headerTitle}>Edit Profile</Text>
          
          <Pressable
            style={[styles.headerButton, isLoading && styles.headerButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            accessible={true}
            accessibilityLabel="Save changes"
            accessibilityRole="button"
          >
            {isLoading ? (
              <Text style={[styles.headerButtonText, styles.headerButtonTextDisabled]}>
                Saving...
              </Text>
            ) : (
              <Text style={styles.headerButtonText}>Save</Text>
            )}
          </Pressable>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Profile Picture Section - Following profile.tsx style */}
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <View style={styles.profileImageWrapper}>
                  <Image
                    source={{ uri: formData.profilePicture }}
                    style={styles.profileImage}
                    defaultSource={{ uri: 'https://i.pravatar.cc/150?img=1' }}
                    onError={() => console.log('Profile image failed to load')}
                  />
                </View>
                <Pressable
                  style={styles.editImageButton}
                  onPress={handleImagePicker}
                  accessible={true}
                  accessibilityLabel="Change profile picture"
                  accessibilityRole="button"
                >
                  <Ionicons name="camera" size={18} color={theme.colors.neutral.white} />
                </Pressable>
              </View>
              
              {/* Name section like profile */}
              <View style={styles.nameSection}>
                <Text style={styles.profileName}>{formData.fullName}</Text>
                <Text style={styles.profileUsername}>@{formData.username}</Text>
              </View>
            </View>

            {/* Form Fields - Cleaner cards like profile stats */}
            <View style={styles.formSection}>
              <Text style={styles.mainSectionTitle}>Edit Information</Text>
              
              <View style={styles.inputCard}>
                {renderInput('Full Name', 'fullName', 'Enter your full name')}
              </View>
              
              <View style={styles.inputCard}>
                {renderInput('Username', 'username', 'Enter your username')}
              </View>
              
              <View style={styles.inputCard}>
                {renderInput('Email', 'email', 'Enter your email address', false, 'email-address')}
              </View>
              
              <View style={styles.inputCard}>
                {renderInput('Phone Number', 'phoneNumber', 'Enter your phone number', false, 'phone-pad')}
              </View>
              
              <View style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location-sharp" size={16} color={theme.colors.neutral.gray[500]} />
                  <Text style={styles.locationLabel}>Location</Text>
                </View>
                <TextInput
                  style={styles.locationInput}
                  value={formData.location}
                  onChangeText={(text) => updateField('location', text)}
                  placeholder="Enter your location"
                  placeholderTextColor={theme.colors.neutral.gray[400]}
                />
              </View>
              
              <View style={styles.bioCard}>
                <Text style={styles.bioLabel}>Bio</Text>
                <TextInput
                  style={styles.bioInput}
                  value={formData.bio}
                  onChangeText={(text) => updateField('bio', text)}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={theme.colors.neutral.gray[400]}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%', // Match profile page
    zIndex: 0,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'transparent',
  },
  headerButton: {
    minWidth: 60,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.heavy,
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.primary,
  },
  headerButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.primary,
  },
  headerButtonTextDisabled: {
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    backgroundColor: 'transparent',
  },
  nameSection: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  profileName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.heavy,
    color: theme.colors.neutral.white,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.primary,
    textAlign: 'center',
  },
  profileUsername: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: theme.typography.fontFamily.primary,
    textAlign: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  profileImageWrapper: {
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.colors.neutral.white,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.neutral.white,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  formSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  mainSectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.heavy,
    color: theme.colors.neutral.gray[700],
    marginBottom: theme.spacing.lg,
    fontFamily: theme.typography.fontFamily.primary,
  },
  inputCard: {
    backgroundColor: theme.colors.neutral.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral.gray[100],
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.neutral.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputContent: {
    // Content wrapper for each input
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral.gray[500],
    fontFamily: theme.typography.fontFamily.primary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.primary,
    color: theme.colors.neutral.gray[900],
    fontWeight: theme.typography.fontWeight.semibold,
    padding: 0,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.gray[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  locationLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.gray[600],
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  locationInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.gray[600],
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.sm,
  },
  bioCard: {
    backgroundColor: theme.colors.neutral.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.neutral.gray[100],
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.neutral.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  bioLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral.gray[500],
    fontFamily: theme.typography.fontFamily.primary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bioInput: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral.gray[600],
    textAlign: 'left',
    lineHeight: theme.typography.lineHeight.relaxed,
    fontFamily: theme.typography.fontFamily.primary,
    fontStyle: 'italic',
    minHeight: 60,
  },
});