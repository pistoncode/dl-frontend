import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@core/theme/theme';

interface MatchHistoryButtonProps {
  onPress: () => void;
}

export const MatchHistoryButton: React.FC<MatchHistoryButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.skillLevelSection}>
      <Pressable 
        style={styles.matchHistoryContainer}
        onPress={onPress}
      >
        <Text style={styles.matchHistoryText}>View Match History</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  skillLevelSection: {
    marginTop: theme.spacing.lg,
  },
  matchHistoryContainer: {
    backgroundColor: theme.colors.neutral.gray[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral.gray[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchHistoryText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.neutral.gray[900],
    fontFamily: theme.typography.fontFamily.primary,
  },
});