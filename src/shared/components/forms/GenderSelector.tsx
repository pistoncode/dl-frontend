import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import type { GenderType } from '@features/onboarding/types';

interface GenderSelectorProps {
  selectedGender: GenderType | null;
  onGenderSelect: (gender: GenderType) => void;
  label?: string;
  error?: string;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({
  selectedGender,
  onGenderSelect,
  label = "What is your Gender?",
  error,
}) => {
  const genders: { label: string; value: GenderType }[] = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.optionsContainer}>
        {genders.map((gender) => (
          <TouchableOpacity
            key={gender.value}
            style={[
              styles.option,
              selectedGender === gender.value && styles.optionSelected,
            ]}
            onPress={() => onGenderSelect(gender.value)}
          >
            <Text
              style={[
                styles.optionText,
                selectedGender === gender.value && styles.optionTextSelected,
              ]}
            >
              {gender.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C7278',
    marginBottom: 8,
    letterSpacing: -0.02,
    fontFamily: 'Roboto',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#EDF1F3',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#E4E5E7',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.24,
    shadowRadius: 2,
    elevation: 2,
  },
  optionSelected: {
    borderColor: '#FE9F4D',
    backgroundColor: '#FFF7F0',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1C1E',
  },
  optionTextSelected: {
    color: '#FE9F4D',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default GenderSelector;