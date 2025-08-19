import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PersonalInfoScreen from '../screens/onboarding/PersonalInfoScreen';
import LocationScreen from '../screens/onboarding/LocationScreen';
import GameSelectScreen from '../screens/onboarding/GameSelectScreen';
import SkillAssessmentScreen from '../screens/onboarding/SkillAssessmentScreen';
import ProfilePictureScreen from '../screens/onboarding/ProfilePictureScreen';

export type OnboardingStackParamList = {
  PersonalInfo: undefined;
  Location: undefined;
  GameSelect: undefined;
  SkillAssessment: { sport: string };
  ProfilePicture: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="Location" component={LocationScreen} />
      <Stack.Screen name="GameSelect" component={GameSelectScreen} />
      <Stack.Screen name="SkillAssessment" component={SkillAssessmentScreen} />
      <Stack.Screen name="ProfilePicture" component={ProfilePictureScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;