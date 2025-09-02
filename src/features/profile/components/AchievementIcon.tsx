import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface AchievementIconProps {
  iconName: string;
}

export const AchievementIcon: React.FC<AchievementIconProps> = ({ iconName }) => {
  return <Ionicons name={iconName as any} size={24} color="#FFD700" />;
};