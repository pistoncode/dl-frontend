import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '../../contexts/OnboardingContext';
import InputField from '../../components/InputField';
import GenderSelector from '../../components/GenderSelector';
import DatePicker from '../../components/DatePicker';

const PersonalInfoScreen = () => {
  const { data, updateData } = useOnboarding();
  const [formData, setFormData] = useState({
    fullName: data.fullName || '',
    gender: data.gender || null,
    dateOfBirth: data.dateOfBirth || null,
  });

  // Update context when form data changes
  useEffect(() => {
    updateData({
      fullName: formData.fullName,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
    });
  }, [formData]);

  const [errors, setErrors] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
  });

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      gender: '',
      dateOfBirth: '',
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender selection is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Birthday is required';
    } else {
      const today = new Date();
      const age = today.getFullYear() - formData.dateOfBirth.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old';
      }
    }

    setErrors(newErrors);
    return !newErrors.fullName && !newErrors.gender && !newErrors.dateOfBirth;
  };

  const handleNext = () => {
    if (validateForm()) {
      updateData({
        fullName: formData.fullName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      });
      router.push('/onboarding/location');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>DEUCE</Text>
          </View>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome to DEUCE, champ!</Text>
            <Text style={styles.subtitle}>
              Now let's get to know you a bit more...
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <InputField
              label="What is your name?"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => {
                setFormData({ ...formData, fullName: text });
                if (errors.fullName) {
                  setErrors({ ...errors, fullName: '' });
                }
              }}
              error={errors.fullName}
            />

            {/* Gender */}
            <GenderSelector
              selectedGender={formData.gender}
              onGenderSelect={(gender) => {
                setFormData({ ...formData, gender });
                if (errors.gender) {
                  setErrors({ ...errors, gender: '' });
                }
              }}
              error={errors.gender}
            />

            {/* Date of Birth */}
            <DatePicker
              selectedDate={formData.dateOfBirth}
              onDateSelect={(date) => {
                setFormData({ ...formData, dateOfBirth: date });
                if (errors.dateOfBirth) {
                  setErrors({ ...errors, dateOfBirth: '' });
                }
              }}
              error={errors.dateOfBirth}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            (!formData.fullName || !formData.gender || !formData.dateOfBirth) &&
              styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={!formData.fullName || !formData.gender || !formData.dateOfBirth}
        >
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 160,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 71,
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    marginBottom: 10,
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C7278',
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  formContainer: {
    paddingHorizontal: 37,
  },
  button: {
    height: 40,
    backgroundColor: '#FE9F4D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
  },
});

export default PersonalInfoScreen;