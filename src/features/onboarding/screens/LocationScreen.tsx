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
  PermissionsAndroid,
} from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { Svg, Path } from 'react-native-svg';
import { BackgroundGradient } from '../components';
import * as Location from 'expo-location';
import axios from 'axios';
import { APP_CONFIG } from '@/src/core/config';
import { useSession } from '@/lib/auth-client';

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
  const { data: sessionData } = useSession();
  const [location, setLocation] = useState(data.location || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(data.useCurrentLocation || false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  // State for dynamic location suggestions
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [currentUserLocation, setCurrentUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Use the fetched suggestions directly (they're already filtered by the API)
  const filteredSuggestions = locationSuggestions;

  // Update context when local state changes
  useEffect(() => {
    updateData({ location, useCurrentLocation });
  }, [location, useCurrentLocation]);

  // Get user's current location for suggestions (passive, no UI feedback)
  useEffect(() => {
    const getCurrentLocationForSuggestions = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setCurrentUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.log('Could not get location for suggestions:', error);
      }
    };

    getCurrentLocationForSuggestions();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Debounced function to fetch location suggestions
  const debouncedFetchSuggestions = (query: string) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      fetchLocationSuggestions(query);
    }, 300); // 300ms delay
  };

  // Fetch location suggestions based on user input
  const fetchLocationSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      // Option 1: Use Google Places API (requires API key)
      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${GOOGLE_API_KEY}`
      // );
      
      // Option 2: Use a free geocoding service like Nominatim (OpenStreetMap)
      const baseUrl = 'https://nominatim.openstreetmap.org/search';
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5',
        countrycodes: 'my', // Focus on Malaysia
      });

      // Add location bias if we have user's location
      if (currentUserLocation) {
        params.append('lat', currentUserLocation.latitude.toString());
        params.append('lon', currentUserLocation.longitude.toString());
        params.append('radius', '50000'); // 50km radius
      }

      const response = await fetch(`${baseUrl}?${params}`, {
        headers: {
          'User-Agent': 'DeuceLegueApp/1.0', // Required by Nominatim
        },
      });

      if (response.ok) {
        const data = await response.json();
        const suggestions = data.map((item: any) => {
          const city = item.address?.city || item.address?.town || item.address?.village;
          const state = item.address?.state;
          const country = item.address?.country;
          
          if (city && state) {
            return `${city}, ${state}`;
          } else if (city && country) {
            return `${city}, ${country}`;
          } else {
            return item.display_name.split(',').slice(0, 2).join(',').trim();
          }
        }).filter((suggestion: string) => suggestion.length > 0);

        setLocationSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      // Fallback to static suggestions for Malaysia
      setLocationSuggestions([
        'Kuala Lumpur, Selangor',
        'George Town, Penang',
        'Johor Bahru, Johor',
        'Ipoh, Perak',
        'Shah Alam, Selangor',
        'Petaling Jaya, Selangor',
        'Kuching, Sarawak',
        'Kota Kinabalu, Sabah',
        'Malacca City, Malacca',
        'Alor Setar, Kedah',
      ].filter(loc => loc.toLowerCase().includes(query.toLowerCase())));
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Request location permissions
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
                 const granted = await PermissionsAndroid.request(
           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
           {
             title: 'Location Permission',
             message: 'Deuce League needs access to your location to find leagues and players near you in Malaysia.',
             buttonNeutral: 'Ask Me Later',
             buttonNegative: 'Cancel',
             buttonPositive: 'OK',
           }
         );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    }
  };

  // Show location tracking consent dialog
  const showLocationConsentDialog = () => {
    Alert.alert(
      'Location Tracking',
      'Deuce League would like to access your location to find leagues and players near you. This helps us provide better matchmaking and show relevant events in your area.\n\nYour location data is only used to improve your experience and is not shared with third parties.',
      [
        {
          text: 'Don\'t Allow',
          style: 'cancel',
          onPress: () => {
            console.log('User declined location tracking');
            // Optionally show manual location input as alternative
          }
        },
        {
          text: 'Allow',
          onPress: () => getCurrentLocation()
        }
      ],
      { cancelable: false }
    );
  };

  // Get current location and save to backend
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      console.log('[Location] Getting current location...');
      
      // Request permissions
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.warn('[Location] Location permission denied');
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions in your device settings to use this feature.'
        );
        return;
      }

      console.log('[Location] Permission granted, getting position...');
      
      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      console.log('[Location] Position obtained:', location.coords);

      console.log('[Location] Reverse geocoding...');
      
      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log('[Location] Reverse geocode result:', reverseGeocode);

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationString = `${address.city || ''}, ${address.region || ''}`.trim();
        
        console.log('[Location] Address parsed:', address);
        console.log('[Location] Location string:', locationString);
        
        // Save to backend
        console.log('[Location] Saving current location to backend...');
        await saveLocationToBackend({
          country: address.country || '',
          state: address.region || '',
          city: address.city || '',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        setLocation(locationString);
        setUseCurrentLocation(true);
        setShowSuggestions(false);
        
        Alert.alert(
          'Location Set Successfully', 
          'Your current location has been saved. You can modify this by selecting a different location below.',
          [{ text: 'Continue' }]
        );
      } else {
        throw new Error('Could not determine address from coordinates');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Detection Failed',
        'We were unable to detect your current location. Please try again or select your location manually from the options below.'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Save location to backend
  const saveLocationToBackend = async (locationData: {
    country: string;
    state: string;
    city: string;
    latitude: number;
    longitude: number;
  }) => {
    try {
      // Get user ID from session
      const userId = sessionData?.user?.id;
      console.log('[Location] Session data:', sessionData);
      console.log('[Location] User ID:', userId);
      
      if (!userId) {
        console.warn('[Location] No user ID available from session');
        Alert.alert(
          'Authentication Required', 
          'Please log in to save your location preferences.',
          [{ text: 'OK' }]
        );
        return null;
      }
      
      const apiUrl = `${APP_CONFIG.api.baseUrl}/api/users/${userId}/location`;
      console.log('[Location] Saving to:', apiUrl);
      console.log('[Location] Data:', locationData);
      
      const response = await axios.post(
        apiUrl,
        locationData,
        {
          timeout: APP_CONFIG.api.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[Location] Save successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[Location] Save failed:', error);
      console.error('[Location] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      // Show user-friendly error message
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        Alert.alert(
          'Connection Error',
          'Unable to save location to server. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else if (error.response?.status === 404) {
        Alert.alert(
          'Service Unavailable',
          'Location service is currently unavailable. Please try again later.',
          [{ text: 'OK' }]
        );
      } else if (error.response?.status >= 500) {
        Alert.alert(
          'Server Error',
          'Our servers are temporarily unavailable. Please try again in a few minutes.',
          [{ text: 'OK' }]
        );
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert(
          'Authentication Required',
          'Please log in to save your location preferences.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Update Failed',
          'We encountered an issue while updating your location. Please try again.',
          [{ text: 'OK' }]
        );
      }
      
      return null;
    }
  };

  const handleNext = () => {
    if (location || useCurrentLocation) {
      updateData({ location, useCurrentLocation });
      router.push('/onboarding/game-select');
    }
  };

  const selectLocation = async (loc: string) => {
    // Set the new location and reset current location state
    setLocation(loc);
    setShowSuggestions(false);
    setUseCurrentLocation(false);

    console.log('[Location] Selecting location:', loc);

    // Geocode the selected location to get coordinates and full details
    try {
      const baseUrl = 'https://nominatim.openstreetmap.org/search';
      const params = new URLSearchParams({
        q: loc,
        format: 'json',
        addressdetails: '1',
        limit: '1',
        countrycodes: 'my',
      });

      const response = await fetch(`${baseUrl}?${params}`, {
        headers: {
          'User-Agent': 'DeuceLegueApp/1.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Location] Geocoding response:', data);
        
        if (data.length > 0) {
          const item = data[0];
          
          // More comprehensive city extraction - try multiple possible fields
          const city = item.address?.city || 
                      item.address?.town || 
                      item.address?.village || 
                      item.address?.suburb ||
                      item.address?.district ||
                      item.address?.county ||
                      // Fallback: extract from display_name if other fields are empty
                      (item.display_name && item.display_name.split(',')[0]?.trim());
          
          const state = item.address?.state || item.address?.province;
          const country = item.address?.country;

          console.log('[Location] Parsed data:', { city, state, country, lat: item.lat, lon: item.lon });

          if (city && state && country) {
            console.log('[Location] Data complete, saving to backend...');
            
            // Save the new location to backend (this will replace any existing location)
            const result = await saveLocationToBackend({
              country,
              state,
              city,
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
            });
            
            if (result) {
              console.log('[Location] Save successful');
              Alert.alert(
                'Location Updated Successfully', 
                'Your location preferences have been updated.',
                [{ text: 'Continue' }]
              );
            } else {
              console.warn('[Location] Save returned no result');
              Alert.alert(
                'Update Incomplete', 
                'Your location was set locally but we encountered an issue saving to our servers. Please try again.',
                [{ text: 'OK' }]
              );
            }
          } else {
            // Try to provide a fallback city if possible
            let fallbackCity = city;
            if (!city && item.display_name) {
              const parts = item.display_name.split(',');
              fallbackCity = parts[0]?.trim();
              console.log('[Location] Using fallback city:', fallbackCity);
            }
            
            if (fallbackCity && state && country) {
              console.log('[Location] Using fallback city, saving to backend...');
              
              const result = await saveLocationToBackend({
                country,
                state,
                city: fallbackCity,
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
              });
              
              if (result) {
                console.log('[Location] Save with fallback city successful');
                Alert.alert(
                  'Location Updated Successfully', 
                  `Your location has been set to ${fallbackCity}, ${state}, ${country}. This will be used for finding nearby leagues and players.`,
                  [{ text: 'Continue' }]
                );
              } else {
                console.warn('[Location] Save with fallback city returned no result');
                Alert.alert(
                  'Update Incomplete', 
                  'Your location was set locally but we encountered an issue saving to our servers. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            } else {
              console.warn('[Location] Incomplete data:', { city, state, country });
              Alert.alert(
                'Location Information Incomplete', 
                `We couldn't retrieve complete location details for "${loc}". Please try selecting a different location or contact our support team for assistance.`,
                [{ text: 'OK' }]
              );
            }
          }
        } else {
          console.warn('[Location] No geocoding results found for:', loc);
          Alert.alert(
            'Location Not Found', 
            `We couldn't find "${loc}" in our location database. Please try a different location or check your spelling.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        console.error('[Location] Geocoding API error:', response.status, response.statusText);
        Alert.alert(
          'Service Temporarily Unavailable', 
          'Our location service is currently experiencing issues. Please try again in a few minutes.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[Location] Error in selectLocation:', error);
      Alert.alert(
        'Update Failed', 
        'We encountered an issue while updating your location. Please try again.',
        [{ text: 'OK' }]
      );
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
      </View>

      {/* Use Current Location Option */}
      <View style={styles.locationOptionsContainer}>
        <TouchableOpacity 
          style={[
            styles.currentLocationButton,
            useCurrentLocation && styles.currentLocationButtonSelected,
            isLoadingLocation && styles.currentLocationButtonLoading
          ]}
                     onPress={showLocationConsentDialog}
          disabled={isLoadingLocation}
        >
          <NavigationIcon color={useCurrentLocation ? '#FE9F4D' : '#1A1C1E'} />
          <Text style={[
            styles.currentLocationText,
            useCurrentLocation && styles.currentLocationTextSelected,
            isLoadingLocation && styles.currentLocationTextLoading
          ]}>
            {isLoadingLocation ? 'Getting location...' : 'Use my current location'}
          </Text>
        </TouchableOpacity>
        
        {/* Helpful text for users */}
        {useCurrentLocation && (
          <Text style={styles.helpText}>
            ✓ Current location set. You can change this by selecting a location below.
          </Text>
        )}
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
                   
                   // Fetch location suggestions with debouncing
                   if (text.trim().length >= 2) {
                     debouncedFetchSuggestions(text.trim());
                   } else {
                     setLocationSuggestions([]);
                     setIsLoadingSuggestions(false);
                   }
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
         {showSuggestions && !useCurrentLocation && (
           <View style={styles.suggestionsContainer}>
             <ScrollView 
               style={styles.suggestionsList}
               showsVerticalScrollIndicator={false}
               keyboardShouldPersistTaps="handled"
             >
               {isLoadingSuggestions ? (
                 <View style={styles.loadingSuggestion}>
                   <Text style={styles.loadingSuggestionText}>Searching locations in Malaysia...</Text>
                 </View>
               ) : filteredSuggestions.length > 0 ? (
                 filteredSuggestions.slice(0, 5).map((item, index) => (
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
                 ))
               ) : location.trim().length >= 2 ? (
                 <View style={styles.noSuggestions}>
                   <Text style={styles.noSuggestionsText}>No locations found</Text>
                 </View>
               ) : null}
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
  currentLocationButtonLoading: {
    opacity: 0.6,
  },
  currentLocationTextLoading: {
    opacity: 0.8,
  },
  helpText: {
    fontSize: 12,
    color: '#6C7278',
    fontStyle: 'italic',
    marginTop: 8,
    paddingHorizontal: 4,
    fontFamily: 'Inter',
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
  loadingSuggestion: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingSuggestionText: {
    fontSize: 14,
    color: '#6C7278',
    fontStyle: 'italic',
  },
  noSuggestions: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  noSuggestionsText: {
    fontSize: 14,
    color: '#6C7278',
    fontStyle: 'italic',
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