import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { SportButton, BackgroundGradient } from '../components';
import type { SportType } from '../types';

const GameSelectScreen = () => {
  const { data, updateData } = useOnboarding();
  const [selectedSports, setSelectedSports] = useState<SportType[]>(
    (data.selectedSports as SportType[]) || []
  );

  // Update context when sport selection changes
  useEffect(() => {
    updateData({ selectedSports });
  }, [selectedSports]);

  const handleSportSelect = (sport: SportType) => {
    setSelectedSports(prev => {
      if (prev.includes(sport)) {
        // Remove if already selected
        return prev.filter(s => s !== sport);
      } else {
        // Add to selection in order
        return [...prev, sport];
      }
    });
  };


  return (
    <SafeAreaView style={styles.container}>
      <BackgroundGradient />
      <View style={styles.contentContainer}>
        <TouchableOpacity 
          style={styles.backgroundTouchable}
          activeOpacity={1}
          onPress={() => setSelectedSports([])}
        >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>DEUCE</Text>
        </View>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Game on...</Text>
          <Text style={styles.subtitle}>
            Now tell us what sports do you play?
          </Text>
        </View>

        {/* Sport Selection using reusable SportButton component */}
        <View style={styles.sportsContainer}>
          <SportButton
            sport="pickleball"
            isSelected={selectedSports.includes('pickleball')}
            onPress={() => handleSportSelect('pickleball')}
          />
          
          <SportButton
            sport="tennis"
            isSelected={selectedSports.includes('tennis')}
            onPress={() => handleSportSelect('tennis')}
          />
          
          <SportButton
            sport="padel"
            isSelected={selectedSports.includes('padel')}
            onPress={() => handleSportSelect('padel')}
          />
        </View>

        </TouchableOpacity>
      </View>
      
      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, selectedSports.length === 0 && styles.buttonDisabled]}
          disabled={selectedSports.length === 0}
          onPress={() => {
            if (selectedSports.length > 0) {
              // Always start with the first selected sport (first in order)
              router.push(`/onboarding/skill-assessment?sport=${selectedSports[0]}&sportIndex=0`);
            }
          }}
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
  backgroundTouchable: {
    flex: 1,
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
    marginBottom: 32,
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
  sportsContainer: {
    paddingHorizontal: 37,
    gap: 18,
  },
  sportButton: {
    height: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    gap: 4,
  },
  sportButtonPickleballActive: {
    borderColor: '#512546',
    backgroundColor: '#F9F5F8',
  },
  sportButtonTennisActive: {
    borderColor: '#374F35',
    backgroundColor: '#F5F7F5',
  },
  sportButtonPadelActive: {
    borderColor: '#7D3C03',
    backgroundColor: '#FBF7F5',
  },
  sportText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
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

export default GameSelectScreen;