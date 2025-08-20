import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { Svg, Path } from 'react-native-svg';
import { BackgroundGradient } from '../components';

const LocationIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path
      d="M9 1.5C5.685 1.5 3 4.185 3 7.5C3 11.25 9 16.5 9 16.5C9 16.5 15 11.25 15 7.5C15 4.185 12.315 1.5 9 1.5Z"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 9.75C10.2426 9.75 11.25 8.74264 11.25 7.5C11.25 6.25736 10.2426 5.25 9 5.25C7.75736 5.25 6.75 6.25736 6.75 7.5C6.75 8.74264 7.75736 9.75 9 9.75Z"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const NavigationIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <Path
      d="M0.651174 8.07162C0.914745 8.33519 1.17832 8.41812 1.69839 8.41812L7.40117 8.44834C7.45389 8.44834 7.49889 8.44834 7.52171 8.47823C7.54421 8.50073 7.5516 8.54605 7.5516 8.59137L7.5741 14.3019C7.58182 14.8216 7.66475 15.0852 7.92832 15.3488C8.28253 15.7104 8.77978 15.6503 9.14878 15.2887C9.34485 15.0926 9.50299 14.7689 9.64603 14.4674L15.4092 2.03744C15.7104 1.40487 15.6728 0.937515 15.3642 0.628622C15.0624 0.327444 14.5954 0.289837 13.9628 0.591015L1.53253 6.35423C1.23103 6.49726 0.907352 6.65541 0.711281 6.85148C0.349674 7.22048 0.289567 7.71034 0.651174 8.07194"
      fill={color}
    />
  </Svg>
);


const LocationScreen = () => {
  const { data, updateData } = useOnboarding();
  const [location, setLocation] = useState(data.location || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(data.useCurrentLocation || false);
  const textInputRef = useRef<TextInput>(null);

  // Mock location suggestions - in production, this would come from an API
  const locationSuggestions = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'Miami, FL',
    'Austin, TX',
    'Jacksonville, FL',
    'San Francisco, CA',
    'Columbus, OH',
    'Charlotte, NC',
    'Fort Worth, TX',
    'Indianapolis, IN',
    'Seattle, WA',
    'Denver, CO',
    'Washington, DC',
  ];

  // Get filtered suggestions based on input
  const filteredSuggestions = location.trim() 
    ? locationSuggestions.filter(loc => {
        const searchTerm = location.toLowerCase().trim();
        const locationLower = loc.toLowerCase();
        return locationLower.includes(searchTerm) ||
               locationLower.split(/[\s,]+/).some(word => word.startsWith(searchTerm));
      })
    : [];

  // Update context when local state changes
  useEffect(() => {
    updateData({ location, useCurrentLocation });
  }, [location, useCurrentLocation]);

  const handleNext = () => {
    if (location || useCurrentLocation) {
      updateData({ location, useCurrentLocation });
      router.push('/onboarding/game-select');
    }
  };

  const selectLocation = (loc: string) => {
    setLocation(loc);
    setShowSuggestions(false);
    setUseCurrentLocation(false);
  };


  return (
    <SafeAreaView style={styles.container}>
      <BackgroundGradient />
      <View style={styles.contentContainer}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>DEUCE</Text>
      </View>

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Leagues near you...</Text>
        <Text style={styles.subtitle}>Where would you like to play?</Text>
      </View>

      {/* Use Current Location Option */}
      <View style={styles.locationOptionsContainer}>
        <TouchableOpacity 
          style={[
            styles.currentLocationButton,
            useCurrentLocation && styles.currentLocationButtonSelected
          ]}
          onPress={() => {
            const newUseCurrentLocation = !useCurrentLocation;
            setUseCurrentLocation(newUseCurrentLocation);
            if (newUseCurrentLocation) {
              setLocation('');
              setShowSuggestions(false);
            }
          }}
        >
          <NavigationIcon color={useCurrentLocation ? '#FE9F4D' : '#1A1C1E'} />
          <Text style={[
            styles.currentLocationText,
            useCurrentLocation && styles.currentLocationTextSelected
          ]}>Use my current location</Text>
        </TouchableOpacity>
      </View>

      {/* Choose Location Section */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Choose a location</Text>
            <View style={styles.inputWithIcon}>
              <LocationIcon />
              <TextInput
                ref={textInputRef}
                style={styles.input}
                placeholder="Enter city or zip code"
                placeholderTextColor="#6C7278"
                value={location}
                onChangeText={(text) => {
                  if (useCurrentLocation) {
                    setUseCurrentLocation(false);
                  }
                  setLocation(text);
                  setShowSuggestions(text.trim().length > 0);
                }}
                onFocus={() => {
                  if (useCurrentLocation) {
                    setUseCurrentLocation(false);
                  }
                  if (location.trim()) {
                    setShowSuggestions(true);
                  }
                }}
              />
            </View>
          </View>
        </View>
        {/* Suggestions appear directly below input */}
        {showSuggestions && !useCurrentLocation && filteredSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView 
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filteredSuggestions.slice(0, 5).map((item, index) => (
                <TouchableOpacity
                  key={`${item}-${index}`}
                  style={[
                    styles.suggestionItem,
                    index === Math.min(4, filteredSuggestions.length - 1) && styles.suggestionItemLast
                  ]}
                  onPress={() => selectLocation(item)}
                  activeOpacity={0.7}
                >
                  <LocationIcon />
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      </View>

      </View>
      
      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button, 
            (!location && !useCurrentLocation) && styles.buttonDisabled
          ]}
          disabled={!location && !useCurrentLocation}
          onPress={handleNext}
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
  contentContainer: {
    flex: 1,
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
    letterSpacing: -0.01,
    fontFamily: 'Inter',
  },
  inputContainer: {
    paddingHorizontal: 37,
  },
  locationOptionsContainer: {
    paddingHorizontal: 37,
    marginBottom: 12,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
    borderColor: '#EDF1F3',
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#E4E5E7',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.24,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  currentLocationButtonSelected: {
    borderColor: '#FE9F4D',
    backgroundColor: '#FFF7F0',
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1C1E',
    marginLeft: 14,
  },
  currentLocationTextSelected: {
    color: '#FE9F4D',
    fontWeight: '600',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputGroup: {
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
    borderColor: '#EDF1F3',
    borderRadius: 10,
    paddingHorizontal: 14,
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
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1A1C1E',
    marginLeft: 8,
    fontWeight: '600',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF1F3',
    borderRadius: 10,
    maxHeight: 200, // Reduced height to prevent overlap
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F3',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontSize: 14,
    color: '#1A1C1E',
    fontWeight: '500',
    marginLeft: 8,
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

export default LocationScreen;