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
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { Svg, Path } from 'react-native-svg';
import { BackgroundGradient } from '../components';
import * as Location from 'expo-location';
import { questionnaireAPI, LocationSearchResult } from '../services/api';
import { useSession } from '@/lib/auth-client';

const LocationIcon = ({ color = "#6C7278" }: { color?: string }) => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path
      d="M9 1.5C5.685 1.5 3 4.185 3 7.5C3 11.25 9 16.5 9 16.5C9 16.5 15 11.25 15 7.5C15 4.185 12.315 1.5 9 1.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 9.75C10.2426 9.75 11.25 8.74264 11.25 7.5C11.25 6.25736 10.2426 5.25 9 5.25C7.75736 5.25 6.75 6.25736 6.75 7.5C6.75 8.74264 7.75736 9.75 9 9.75Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SearchIcon = ({ color = "#6C7278" }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 14L11.1 11.1"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClearIcon = ({ color = "#6C7278" }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M12 4L4 12M4 4L12 12"
      stroke={color}
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
  const { data: session } = useSession();
  const [location, setLocation] = useState(data.location || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(data.useCurrentLocation || false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSearchResult[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentLocationData, setCurrentLocationData] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const textInputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Search for locations using the API with fallback to hardcoded suggestions
  const searchLocations = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      setIsSearchingLocations(true);
      console.log('🔍 Searching locations for:', query);
      
      const response = await questionnaireAPI.searchLocations(query.trim(), 5);
      
      if (response.success && response.results) {
        console.log(`✅ Found ${response.results.length} locations via API`);
        setLocationSuggestions(response.results);
      } else {
        console.log('⚠️ API returned no locations, using fallback');
        useFallbackLocationSearch(query);
      }
    } catch (error) {
      console.error('❌ Error searching locations via API, using fallback:', error);
      useFallbackLocationSearch(query);
    } finally {
      setIsSearchingLocations(false);
    }
  };

  // Fallback location search - show no results if API fails
  const useFallbackLocationSearch = (query: string) => {
    console.log('🔄 API failed, showing no results');
    setLocationSuggestions([]);
  };

  // Debounced search function
  const debouncedSearch = (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(query);
    }, 300); // 300ms delay
  };

  // Fallback reverse geocoding using expo-location
  const fallbackReverseGeocode = async (latitude: number, longitude: number) => {
    try {
      console.log('🔄 Using expo-location fallback for reverse geocoding...');
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        console.log('✅ Expo-location reverse geocode result:', address);
        
        const formattedAddress = `${address.city || address.subregion || ''}, ${address.region || ''} ${address.country || ''}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, '');
        console.log('✅ Formatted address:', formattedAddress);
        
        setCurrentLocationData({
          latitude,
          longitude,
          address: formattedAddress,
        });
        
        setLocation(formattedAddress);
        setShowSuggestions(false);
      } else {
        console.log('⚠️ Expo-location also returned no address, using coordinates');
        setCurrentLocationData({
          latitude,
          longitude,
        });
        
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (fallbackError) {
      console.log('⚠️ Expo-location fallback also failed, using coordinates:', fallbackError);
      setCurrentLocationData({
        latitude,
        longitude,
      });
      
      setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  // Function to check if location services are enabled
  const checkLocationServices = async () => {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      console.log('📍 Location services enabled:', isEnabled);
      return isEnabled;
    } catch (error) {
      console.log('⚠️ Could not check location services status:', error);
      return true; // Assume enabled if we can't check
    }
  };

  // Function to request location permissions and fetch current location
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      console.log('🔍 Starting location permission request...');
      
      // First check if location services are enabled
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        console.log('❌ Location services are disabled');
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to use your current location.',
          [
            { 
              text: 'Enter Manually', 
              style: 'cancel',
              onPress: () => {
                setUseCurrentLocation(false);
                setIsLoadingLocation(false);
              }
            },
            { 
              text: 'Try Again', 
              onPress: () => {
                setIsLoadingLocation(false);
                setTimeout(() => getCurrentLocation(), 1000);
              }
            }
          ]
        );
        return;
      }
      
      // Check current permission status
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
      console.log('📍 Current permission status:', currentStatus);
      
      let finalStatus = currentStatus;
      
      // Request permission if not already granted
      if (currentStatus !== 'granted') {
        console.log('🔐 Requesting location permission...');
        const { status: requestStatus } = await Location.requestForegroundPermissionsAsync();
        finalStatus = requestStatus;
        console.log('📍 Permission request result:', requestStatus);
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Location permission denied');
        Alert.alert(
          'Permission Required',
          'Location permission is required to use your current location. Please enable location access in your device settings.',
          [
            { 
              text: 'Cancel', 
              style: 'cancel',
              onPress: () => {
                setUseCurrentLocation(false);
                setIsLoadingLocation(false);
              }
            },
            { 
              text: 'Try Again', 
              onPress: async () => {
                setIsLoadingLocation(false);
                setTimeout(() => getCurrentLocation(), 500);
              }
            }
          ]
        );
        return;
      }
      
      console.log('✅ Location permission granted, fetching location...');

      // Get current position
      console.log('📡 Getting GPS coordinates...');
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = locationResult.coords;
      console.log('📍 GPS coordinates:', latitude, longitude);
      
      // Reverse geocode to get address - prioritize expo-location for better results
      console.log('🗺️ Converting coordinates to address...');
      
      // Try expo-location first since it gives better results
      try {
        await fallbackReverseGeocode(latitude, longitude);
      } catch (expoError) {
        console.log('⚠️ Expo-location failed, trying API fallback:', expoError);
        
        // Fallback to API if expo-location fails
        try {
          const reverseGeocodeResponse = await questionnaireAPI.reverseGeocode(latitude, longitude);
          
          if (reverseGeocodeResponse.success && reverseGeocodeResponse.address) {
            console.log('✅ API reverse geocode result:', reverseGeocodeResponse.address);
            
            setCurrentLocationData({
              latitude,
              longitude,
              address: reverseGeocodeResponse.address,
            });
            
            setLocation(reverseGeocodeResponse.address);
            setShowSuggestions(false);
          } else {
            console.log('⚠️ API also returned no address, using coordinates');
            setCurrentLocationData({
              latitude,
              longitude,
            });
            
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (apiError) {
          console.log('⚠️ API also failed, using coordinates:', apiError);
          setCurrentLocationData({
            latitude,
            longitude,
          });
          
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      }

    } catch (error: any) {
      console.error('❌ Error getting location:', error);
      
      let errorMessage = 'Unable to get your current location. Please try again or enter your location manually.';
      let errorTitle = 'Location Error';
      
      // Handle specific error cases
      if (error.message?.includes('location services are enabled')) {
        errorTitle = 'Location Services Disabled';
        errorMessage = 'Please enable location services in your device settings and try again.';
      } else if (error.message?.includes('timeout')) {
        errorTitle = 'Location Timeout';
        errorMessage = 'Location request timed out. Please check your GPS signal and try again.';
      } else if (error.message?.includes('network')) {
        errorTitle = 'Network Error';
        errorMessage = 'Network error while getting location. Please check your internet connection.';
      }
      
      Alert.alert(
        errorTitle,
        errorMessage,
        [
          { 
            text: 'Enter Manually', 
            style: 'cancel',
            onPress: () => {
              setUseCurrentLocation(false);
              setIsLoadingLocation(false);
            }
          },
          { 
            text: 'Try Again', 
            onPress: () => {
              setIsLoadingLocation(false);
              setTimeout(() => getCurrentLocation(), 1000);
            }
          }
        ]
      );
      setUseCurrentLocation(false);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Helper function to parse location string into components
  const parseLocationString = (locationString: string) => {
    // Handle common location formats: "City, State Country" or "City, State" or "City"
    const parts = locationString.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      // Format: "City, State, Country"
      return {
        city: parts[0],
        state: parts[1],
        country: parts.slice(2).join(', ')
      };
    } else if (parts.length === 2) {
      // Format: "City, State" (country unknown - do not assume)
      return {
        city: parts[0],
        state: parts[1],
        country: ''
      };
    } else {
      // Format: "City" only
      return {
        city: parts[0],
        state: 'Unknown',
        country: 'Unknown'
      };
    }
  };

  // Function to save location to backend
  const saveLocationToBackend = async (locationString: string, coordinates?: { latitude: number; longitude: number }) => {
    try {
      if (!session?.user?.id) {
        console.warn('No user session available, skipping backend save');
        return;
      }

      const parsedLocation = parseLocationString(locationString);
      
      // Only send city and state data
      let locationData = {
        city: parsedLocation.city || '',
        state: parsedLocation.state || '',
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        })
      };

      console.log('Saving location data:', locationData);

      await questionnaireAPI.saveUserLocation(session.user.id, locationData);
      console.log('Location saved to backend successfully');
    } catch (error) {
      console.error('Failed to save location to backend:', error);
      // Don't block the user flow if backend save fails
    }
  };

  // Update context when local state changes
  useEffect(() => {
    const updateDataWithCoordinates = {
      location,
      useCurrentLocation,
      ...(currentLocationData && {
        latitude: currentLocationData.latitude,
        longitude: currentLocationData.longitude,
      })
    };
    updateData(updateDataWithCoordinates);
  }, [location, useCurrentLocation, currentLocationData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Animate suggestions container
  useEffect(() => {
    if (showSuggestions && locationSuggestions.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showSuggestions, locationSuggestions.length]);

  // Clear input function
  const clearInput = () => {
    setLocation('');
    setShowSuggestions(false);
    setLocationSuggestions([]);
    textInputRef.current?.focus();
  };

  const handleNext = async () => {
    if (location || useCurrentLocation) {
      const finalData = {
        location,
        useCurrentLocation,
        ...(currentLocationData && {
          latitude: currentLocationData.latitude,
          longitude: currentLocationData.longitude,
        })
      };
      
      // Update local context
      updateData(finalData);
      
      // Save to backend (don't block navigation if this fails)
      if (location) {
        await saveLocationToBackend(
          location, 
          currentLocationData ? {
            latitude: currentLocationData.latitude,
            longitude: currentLocationData.longitude
          } : undefined
        );
      }
      
      // Mark basic onboarding as completed (personal info + location)
      try {
        await questionnaireAPI.completeOnboarding(session.user.id);
        console.log('Basic onboarding completed (personal info + location)');
      } catch (error) {
        console.error('Error completing basic onboarding:', error);
      }

      // Navigate to sport assessment (optional step)
      router.push('/onboarding/game-select');
    }
  };

  const selectLocation = (locationResult: LocationSearchResult) => {
    setLocation(locationResult.formatted_address);
    setShowSuggestions(false);
    setUseCurrentLocation(false);

    // Set coordinates from the selected location
    setCurrentLocationData({
      latitude: locationResult.geometry.location.lat,
      longitude: locationResult.geometry.location.lng,
      address: locationResult.formatted_address,
    });

    // If structured components are provided, persist immediately
    if (locationResult.components && session?.user?.id) {
      questionnaireAPI
        .saveUserLocation(session.user.id, {
          country: locationResult.components.country || '',
          state: locationResult.components.state || '',
          city: locationResult.components.city || '',
          latitude: locationResult.geometry.location.lat,
          longitude: locationResult.geometry.location.lng,
        })
        .then(() => console.log('Location saved to backend successfully'))
        .catch((e) => console.error('Failed to save location to backend:', e));
    }
  };

  // Handle current location button press
  const handleCurrentLocationPress = async () => {
    console.log('👆 Current location button pressed');
    const newUseCurrentLocation = !useCurrentLocation;
    console.log('🔄 Toggling useCurrentLocation to:', newUseCurrentLocation);
    
    if (newUseCurrentLocation) {
      // User wants to use current location - fetch it
      console.log('📍 User wants to use current location');
      setUseCurrentLocation(true);
      setLocation('');
      setShowSuggestions(false);
      await getCurrentLocation();
    } else {
      // User is turning off current location
      console.log('❌ User is turning off current location');
      setUseCurrentLocation(false);
      setCurrentLocationData(null);
      setLocation('');
    }
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
        {useCurrentLocation && isLoadingLocation && (
          <Text style={styles.helpText}>
            Make sure location services are enabled in your device settings
          </Text>
        )}
      </View>

      {/* Use Current Location Option */}
      <View style={styles.locationOptionsContainer}>
        <TouchableOpacity 
          style={[
            styles.currentLocationButton,
            useCurrentLocation && styles.currentLocationButtonSelected,
            isLoadingLocation && styles.currentLocationButtonLoading
          ]}
          onPress={handleCurrentLocationPress}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#FE9F4D" />
          ) : (
            <NavigationIcon color={useCurrentLocation ? '#FE9F4D' : '#1A1C1E'} />
          )}
          <Text style={[
            styles.currentLocationText,
            useCurrentLocation && styles.currentLocationTextSelected
          ]}>
            {isLoadingLocation ? 'Getting your location...' : 'Use my current location'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Choose Location Section */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Choose a location</Text>
            <View style={[
              styles.inputWithIcon,
              isInputFocused && styles.inputWithIconFocused,
              location && styles.inputWithIconFilled
            ]}>
              <SearchIcon color={isInputFocused ? "#FE9F4D" : "#6C7278"} />
              <TextInput
                ref={textInputRef}
                style={styles.input}
                placeholder="Enter city or zip code"
                placeholderTextColor="#6C7278"
                value={location}
                onChangeText={(text) => {
                  if (useCurrentLocation) {
                    setUseCurrentLocation(false);
                    setCurrentLocationData(null);
                  }
                  setLocation(text);
                  setShowSuggestions(text.trim().length > 0);
                  
                  // Trigger debounced search
                  debouncedSearch(text);
                }}
                onFocus={() => {
                  setIsInputFocused(true);
                  if (useCurrentLocation) {
                    setUseCurrentLocation(false);
                    setCurrentLocationData(null);
                  }
                  if (location.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setIsInputFocused(false);
                }}
                editable={!isLoadingLocation}
              />
              {location.length > 0 && (
                <TouchableOpacity
                  onPress={clearInput}
                  style={styles.clearButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ClearIcon color="#6C7278" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {/* Suggestions appear directly below input */}
        {showSuggestions && !useCurrentLocation && (
          <Animated.View 
            style={[
              styles.suggestionsContainer,
              { opacity: fadeAnim }
            ]}
          >
            <ScrollView 
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {isSearchingLocations && (
                <View style={styles.suggestionItem}>
                  <ActivityIndicator size="small" color="#FE9F4D" />
                  <Text style={styles.suggestionText}>Searching locations...</Text>
                </View>
              )}
              {!isSearchingLocations && locationSuggestions.length > 0 && locationSuggestions.map((item, index) => (
                <TouchableOpacity
                  key={`${item.id}-${index}`}
                  style={[
                    styles.suggestionItem,
                    index === locationSuggestions.length - 1 && styles.suggestionItemLast
                  ]}
                  onPress={() => selectLocation(item)}
                  activeOpacity={0.7}
                >
                  <LocationIcon color="#FE9F4D" />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionText}>{item.name}</Text>
                    <Text style={styles.suggestionSubtext}>{item.formatted_address}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {!isSearchingLocations && locationSuggestions.length === 0 && location.trim().length >= 2 && (
                <View style={styles.suggestionItem}>
                  <Text style={styles.noResultsText}>No locations found</Text>
                  <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
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
  helpText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FE9F4D',
    lineHeight: 16,
    marginTop: 8,
    fontStyle: 'italic',
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
  currentLocationButtonLoading: {
    opacity: 0.7,
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
  inputWithIconFocused: {
    borderColor: '#FE9F4D',
    shadowColor: '#FE9F4D',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  inputWithIconFilled: {
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1A1C1E',
    marginLeft: 8,
    fontWeight: '600',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF1F3',
    borderRadius: 10,
    maxHeight: 200,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 56,
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionText: {
    fontSize: 15,
    color: '#1A1C1E',
    fontWeight: '600',
    lineHeight: 20,
  },
  suggestionSubtext: {
    fontSize: 13,
    color: '#6C7278',
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 18,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6C7278',
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 8,
  },
  noResultsSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
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