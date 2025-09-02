import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@core/theme/theme';
import type { MatchDetailsModalProps } from '../types';

// Default Profile Icon Component
const DefaultProfileIcon = () => (
  <View style={styles.profileIcon}>
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path 
        fill="#FFFFFF" 
        fillRule="evenodd" 
        d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z" 
        clipRule="evenodd" 
      />
    </Svg>
  </View>
);

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ match, onClose }) => {
  if (!match) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'ongoing':
        return theme.colors.primary;
      case 'upcoming':
        return theme.colors.neutral.gray[500];
      default:
        return theme.colors.neutral.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'ongoing':
        return 'Ongoing';
      case 'upcoming':
        return 'Upcoming';
      default:
        return status;
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContentLarge}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Match Details</Text>
            <Pressable onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={theme.colors.neutral.gray[600]} />
            </Pressable>
          </View>
          
          <View style={styles.matchDetailsCard}>
              {/* League Name with Container */}
              <View style={styles.leagueNameContainer}>
                <Text style={styles.leagueName}>{match.league}</Text>
              </View>
              
              {/* Scoreboard */}
              <View style={styles.scoreboardContainer}>
                {/* Player Names Column with Profile Icons */}
                <View style={styles.playerColumn}>
                  <View style={styles.playerRow}>
                    <DefaultProfileIcon />
                    <Text style={styles.playerName}>{match.player1}</Text>
                  </View>
                  <View style={styles.playerRow}>
                    <DefaultProfileIcon />
                    <Text style={styles.playerName}>{match.player2}</Text>
                  </View>
                </View>
                
                {/* Set 1 */}
                <View style={styles.setColumn}>
                  <Text style={styles.setHeader}>Set 1</Text>
                  <Text style={styles.score}>
                    {match.scores.set1.player1 !== null ? match.scores.set1.player1 : '-'}
                  </Text>
                  <Text style={styles.score}>
                    {match.scores.set1.player2 !== null ? match.scores.set1.player2 : '-'}
                  </Text>
                </View>
                
                {/* Set 2 */}
                <View style={styles.setColumn}>
                  <Text style={styles.setHeader}>Set 2</Text>
                  <Text style={styles.score}>
                    {match.scores.set2.player1 !== null ? match.scores.set2.player1 : '-'}
                  </Text>
                  <Text style={styles.score}>
                    {match.scores.set2.player2 !== null ? match.scores.set2.player2 : '-'}
                  </Text>
                </View>
                
                {/* Set 3 */}
                <View style={styles.setColumn}>
                  <Text style={styles.setHeader}>Set 3</Text>
                  <Text style={styles.score}>
                    {match.scores.set3.player1 !== null ? match.scores.set3.player1 : '-'}
                  </Text>
                  <Text style={styles.score}>
                    {match.scores.set3.player2 !== null ? match.scores.set3.player2 : '-'}
                  </Text>
                </View>
              </View>
              
              {/* Divider */}
              <View style={styles.divider} />
              
              {/* Bottom Section */}
              <View style={styles.bottomSection}>
                {/* Date and Time */}
                <View style={styles.dateTimeContainer}>
                  <Text style={styles.dateText}>{match.date}</Text>
                  <Text style={styles.timeText}>{match.time}</Text>
                </View>
                
                {/* Status */}
                <View style={[styles.statusContainer, { backgroundColor: `${getStatusColor(match.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(match.status) }]}>
                    {getStatusText(match.status)}
                  </Text>
                </View>
              </View>
              
              {/* Rating Change Info */}
              <View style={styles.ratingChangeSection}>
                <Text style={styles.ratingChangeLabel}>Rating Change</Text>
                <Text style={[styles.ratingChangeValue, { color: match.ratingChange > 0 ? '#34C759' : '#FF3B30' }]}>
                  {match.ratingChange > 0 ? '+' : ''}{match.ratingChange} → {match.rating}
                </Text>
              </View>
            </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentLarge: {
    backgroundColor: theme.colors.neutral.white,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.gray[100],
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.neutral.gray[900],
    fontFamily: theme.typography.fontFamily.primary,
  },
  modalCloseButton: {
    padding: theme.spacing.xs,
  },
  matchDetailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
  },
  leagueNameContainer: {
    backgroundColor: '#feecdb',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  leagueName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.primary,
  },
  scoreboardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  playerColumn: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  playerName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.neutral.gray[900],
    fontFamily: theme.typography.fontFamily.primary,
  },
  setColumn: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    minWidth: 50,
  },
  setHeader: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.neutral.gray[600],
    fontFamily: theme.typography.fontFamily.primary,
    marginBottom: 2,
  },
  score: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.neutral.gray[900],
    fontFamily: theme.typography.fontFamily.primary,
    textAlign: 'center',
    minHeight: 20,
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral.gray[200],
    marginVertical: theme.spacing.md,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dateTimeContainer: {
    gap: 2,
  },
  dateText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.neutral.gray[900],
    fontFamily: theme.typography.fontFamily.primary,
  },
  timeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral.gray[500],
    fontFamily: theme.typography.fontFamily.primary,
  },
  statusContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.base,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold as any,
    fontFamily: theme.typography.fontFamily.primary,
  },
  ratingChangeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral.gray[100],
  },
  ratingChangeLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.gray[600],
    fontFamily: theme.typography.fontFamily.primary,
  },
  ratingChangeValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold as any,
    fontFamily: theme.typography.fontFamily.primary,
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.neutral.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
});