import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Line, Circle, Polyline, G, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@core/theme/theme';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DropdownModal, WinRateCircle, MatchDetailsModal, EloProgressGraph, EditIcon, MatchHistoryButton } from '@features/profile/components';

const { width } = Dimensions.get('window');

// Mock ELO data for the last 6 months with full match details
type GameData = {
  date: string;
  time: string;
  rating: number;
  opponent: string;
  result: 'W' | 'L';
  score: string;
  ratingChange: number;
  league: string;
  player1: string;
  player2: string;
  scores: {
    set1: { player1: number | null; player2: number | null };
    set2: { player1: number | null; player2: number | null };
    set3: { player1: number | null; player2: number | null };
  };
  status: 'completed' | 'ongoing' | 'upcoming';
};

const mockEloData: GameData[] = [
  { 
    date: 'Mar 1, 2024', time: '10:00 AM', rating: 1350, opponent: 'John D.', result: 'W', 
    score: '6-4, 6-3', ratingChange: +25, league: 'Sepang Club League',
    player1: 'Ken', player2: 'John D.',
    scores: { set1: { player1: 6, player2: 4 }, set2: { player1: 6, player2: 3 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
  { 
    date: 'Mar 15, 2024', time: '2:30 PM', rating: 1375, opponent: 'Sarah M.', result: 'W', 
    score: '7-5, 6-4', ratingChange: +30, league: 'KL Open Tournament',
    player1: 'Ken', player2: 'Sarah M.',
    scores: { set1: { player1: 7, player2: 5 }, set2: { player1: 6, player2: 4 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
  { 
    date: 'Apr 2, 2024', time: '4:00 PM', rating: 1405, opponent: 'Mike R.', result: 'L', 
    score: '4-6, 5-7', ratingChange: -20, league: 'Petaling Jaya Singles League',
    player1: 'Ken', player2: 'Mike R.',
    scores: { set1: { player1: 4, player2: 6 }, set2: { player1: 5, player2: 7 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
  { 
    date: 'Apr 20, 2024', time: '9:00 AM', rating: 1385, opponent: 'Emma L.', result: 'W', 
    score: '6-3, 6-2', ratingChange: +35, league: 'Selangor Championship',
    player1: 'Ken', player2: 'Emma L.',
    scores: { set1: { player1: 6, player2: 3 }, set2: { player1: 6, player2: 2 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
  { 
    date: 'May 5, 2024', time: '11:00 AM', rating: 1420, opponent: 'David K.', result: 'W', 
    score: '6-4, 7-6', ratingChange: +15, league: 'Club Tournament',
    player1: 'Ken', player2: 'David K.',
    scores: { set1: { player1: 6, player2: 4 }, set2: { player1: 7, player2: 6 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
  { 
    date: 'May 18, 2024', time: '3:00 PM', rating: 1435, opponent: 'Lisa P.', result: 'L', 
    score: '3-6, 4-6', ratingChange: -25, league: 'Weekend League',
    player1: 'Ken', player2: 'Lisa P.',
    scores: { set1: { player1: 3, player2: 6 }, set2: { player1: 4, player2: 6 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
  { 
    date: 'Jun 1, 2024', time: '10:30 AM', rating: 1410, opponent: 'Tom H.', result: 'W', 
    score: '6-2, 6-4', ratingChange: +30, league: 'Sepang Club League',
    player1: 'Ken', player2: 'Tom H.',
    scores: { set1: { player1: 6, player2: 2 }, set2: { player1: 6, player2: 4 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
  { 
    date: 'Jun 15, 2024', time: '5:00 PM', rating: 1440, opponent: 'Amy S.', result: 'W', 
    score: '7-5, 6-3', ratingChange: +20, league: 'KL Open Tournament',
    player1: 'Ken', player2: 'Amy S.',
    scores: { set1: { player1: 7, player2: 5 }, set2: { player1: 6, player2: 3 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
  { 
    date: 'Jul 3, 2024', time: '1:00 PM', rating: 1460, opponent: 'Chris B.', result: 'L', 
    score: '5-7, 4-6', ratingChange: -15, league: 'Mid-Year Championship',
    player1: 'Ken', player2: 'Chris B.',
    scores: { set1: { player1: 5, player2: 7 }, set2: { player1: 4, player2: 6 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
  { 
    date: 'Jul 20, 2024', time: '9:30 AM', rating: 1445, opponent: 'Nina T.', result: 'W', 
    score: '6-4, 6-3', ratingChange: +25, league: 'Petaling Jaya Singles League',
    player1: 'Ken', player2: 'Nina T.',
    scores: { set1: { player1: 6, player2: 4 }, set2: { player1: 6, player2: 3 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
  { 
    date: 'Aug 5, 2024', time: '2:00 PM', rating: 1470, opponent: 'Mark J.', result: 'L', 
    score: '4-6, 3-6', ratingChange: -30, league: 'Summer Cup',
    player1: 'Ken', player2: 'Mark J.',
    scores: { set1: { player1: 4, player2: 6 }, set2: { player1: 3, player2: 6 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
  { 
    date: 'Aug 20, 2024', time: '11:30 AM', rating: 1440, opponent: 'Rachel G.', result: 'W', 
    score: '6-3, 7-5', ratingChange: +10, league: 'Sepang Club League',
    player1: 'Ken', player2: 'Rachel G.',
    scores: { set1: { player1: 6, player2: 3 }, set2: { player1: 7, player2: 5 }, set3: { player1: null, player2: null } },
    status: 'completed'
  },
];

// ELO Progress Graph Component


// Custom Edit Icon SVG Component



export default function ProfileAdaptedScreen() {
  // CONCAVITY CONTROLS - Adjust these numbers to change the curve
  const CURVE_HEIGHT = 200;        // Total height of the curve area
  const CURVE_DEPTH = 0;          // How deep the curve goes (higher = more concave)
  const CURVE_START_Y = 130;       // Where the curve starts from bottom
  
  const [activeTab, setActiveTab] = useState('Tennis');
  const [selectedGame, setSelectedGame] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Dropdown states
  const [eloDropdownVisible, setEloDropdownVisible] = useState(false);
  const [leagueDropdownVisible, setLeagueDropdownVisible] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState('Singles');
  
  const gameTypeOptions = ['Singles', 'Doubles'];
  const [userData] = useState({
    name: 'Kenneth Riadi',
    username: 'Ken',
    bio: 'Tennis enthusiast, weekend warrior, always up for a good match!',
    location: 'Sepang, Selangor',
    gender: 'Male',
    profilePicture: 'https://i.pravatar.cc/150?img=3',
    skillLevel: 'Intermediate',
    achievements: [
      { id: '1', title: 'Founding Member', icon: 'shield-checkmark' },
      { id: '2', title: 'Division Winner', year: '2024', icon: 'trophy' },
    ],
    sports: ['Tennis', 'Pickleball', 'Padel'],
    activeSports: ['Tennis', 'Pickleball', 'Padel'], // Currently active sports
  });

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/edit-profile');
  };

  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleGamePointPress = (game) => {
    setSelectedGame(game);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedGame(null), 300);
  };

  // Dropdown handlers
  const handleGameTypeSelect = (gameType: string) => {
    setSelectedGameType(gameType);
    setEloDropdownVisible(false);
    setLeagueDropdownVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderAchievementIcon = (iconName: string) => {
    return <Ionicons name={iconName as any} size={24} color="#FFD700" />;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Orange Header Background with Curved Bottom */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[theme.colors.primary, '#FFA366']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orangeHeader}
          >
            <SafeAreaView edges={['top']} style={styles.safeHeader}>
              <View style={styles.header}>
                <View style={styles.headerLeft} />
                <Pressable 
                  style={styles.settingsIcon}
                  onPress={handleSettingsPress}
                  accessible={true}
                  accessibilityLabel="Settings"
                  accessibilityRole="button"
                >
                  <Ionicons name="settings-outline" size={24} color="#fff" />
                </Pressable>
              </View>
            </SafeAreaView>
            
            {/* Concave curve at bottom of orange header - ADJUSTABLE CONCAVITY */}
            <Svg
              height={CURVE_HEIGHT}
              width={width}
              viewBox={`0 0 ${width} ${CURVE_HEIGHT}`}
              style={styles.concaveCurve}
            >
              <Path
                d={`M0,${CURVE_HEIGHT} L0,${CURVE_START_Y} Q${width/2},${CURVE_DEPTH} ${width},${CURVE_START_Y} L${width},${CURVE_START_Y} L${width},${CURVE_HEIGHT} Z`}
                fill="#f0f0f0"
              />
            </Svg>
          </LinearGradient>
        </View>

        {/* White Background */}
        <View style={styles.whiteBackground}>
          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Svg width="60" height="60" viewBox="0 0 24 24">
                <Path 
                  fill="#FFFFFF" 
                  fillRule="evenodd" 
                  d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z" 
                  clipRule="evenodd" 
                />
              </Svg>
            </View>
            <Pressable 
              style={styles.editIcon}
              onPress={handleEditPress}
              accessible={true}
              accessibilityLabel="Edit profile"
              accessibilityRole="button"
            >
              <EditIcon color="#6de9a0" />
            </Pressable>
          </View>

          {/* Name and Username */}
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{userData.name}</Text>
          </View>
          <Text style={styles.username}>@{userData.username}</Text>
          <Text style={styles.bio}>{userData.bio}</Text>

          {/* Action Icons */}
          <View style={styles.actionIconsContainer}>
            <Pressable style={[styles.actionIcon, styles.addFriendIcon]}>
              <Ionicons name="person-add" size={16} color="#20659d" />
            </Pressable>
            <Pressable style={styles.actionIcon}>
              <Ionicons name="chatbubble" size={16} color={theme.colors.neutral.gray[600]} />
            </Pressable>
          </View>

          {/* Info Pills */}
          <View style={styles.infoPills}>
            <View style={styles.pill}>
              <Ionicons name="location-sharp" size={14} color="#ffffff" />
              <Text style={styles.pillText}>{userData.location}</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="male" size={14} color="#ffffff" />
              <Text style={styles.pillText}>{userData.gender}</Text>
            </View>
          </View>

          {/* Sports Pills */}
          <View style={styles.sportsPills}>
            {userData.sports.map((sport) => {
              const isActive = userData.activeSports.includes(sport);
              const sportColors = {
                Tennis: '#354a33',
                Pickleball: '#512f48', 
                Padel: '#af7e04',
              };
              
              return (
                <Pressable 
                  key={sport}
                  style={[
                    styles.sportPill,
                    { 
                      backgroundColor: sportColors[sport as keyof typeof sportColors],
                      opacity: isActive ? 1 : 0.6,
                    }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Handle sport selection
                  }}
                >
                  <Text style={[
                    styles.sportPillText,
                    isActive && styles.sportPillTextActive
                  ]}>
                    {sport}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Achievements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Pressable style={styles.achievementContainer}>
              <View style={styles.achievementsContent}>
                {userData.achievements.slice(0, 2).map((achievement) => (
                  <View key={achievement.id} style={styles.achievementItem}>
                    {renderAchievementIcon(achievement.icon)}
                    <View style={styles.achievementTextContainer}>
                      <Text style={styles.achievementText}>{achievement.title}</Text>
                      {achievement.year && (
                        <Text style={styles.achievementYear}>({achievement.year})</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} style={styles.achievementChevron} />
            </Pressable>
          </View>

          {/* Sports */}
          <View style={styles.section}>
            <View style={styles.sportsHeader}>
              <Text style={styles.sectionTitle}>Sports</Text>
              <View style={styles.tabs}>
                {userData.sports.map((sport) => (
                  <Pressable
                    key={sport}
                    style={[
                      styles.tab,
                      activeTab === sport && styles.tabActive
                    ]}
                    onPress={() => handleTabPress(sport)}
                  >
                    <Text style={[
                      styles.tabText,
                      activeTab === sport && styles.tabTextActive
                    ]}>
                      {sport}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Skill Level */}
          <View style={styles.skillLevelSection}>
            <View style={styles.skillContainer}>
              <Text style={styles.skillLabel}>Skill Level</Text>
              <Text style={styles.skillValue}>{userData.skillLevel}</Text>
            </View>
          </View>

          {/* DMR */}
          <View style={styles.skillLevelSection}>
            <View style={styles.dmrContainer}>
              {/* DMR Label and Ratings */}
              <View style={styles.dmrHeader}>
                <Text style={styles.skillLabel}>DMR</Text>
                <View style={styles.dmrRatingsRow}>
                  <View style={styles.dmrItemVertical}>
                    <Text style={styles.dmrTypeLabel}>Singles</Text>
                    <View style={styles.ratingCircleSmall}>
                      <Text style={styles.ratingTextSmall}>1440</Text>
                    </View>
                  </View>
                  <View style={styles.dmrItemVertical}>
                    <Text style={styles.dmrTypeLabel}>Doubles</Text>
                    <View style={styles.ratingCircleSmall}>
                      <Text style={styles.ratingTextSmall}>1380</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Dropdown above graph */}
              <View style={styles.dropdownSection}>
                <Pressable 
                  style={styles.dropdownHorizontal}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setEloDropdownVisible(true);
                  }}
                >
                  <Text style={styles.dropdownText}>{selectedGameType}</Text>
                  <Ionicons name="chevron-down" size={16} color={theme.colors.neutral.gray[600]} />
                </Pressable>
              </View>
              
              {/* ELO Progress Graph */}
              <EloProgressGraph 
                data={mockEloData} 
                onPointPress={handleGamePointPress}
              />
            </View>
          </View>

          <MatchHistoryButton
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/match-history');
            }}
          />

          {/* League Stats Section */}
          <View style={styles.skillLevelSection}>
            <View style={styles.leagueStatsContainer}>
              <View style={styles.statsHeader}>
                <Text style={styles.skillLabel}>League Stats</Text>
                <Pressable 
                  style={styles.dropdownHorizontal}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLeagueDropdownVisible(true);
                  }}
                >
                  <Text style={styles.dropdownText}>{selectedGameType}</Text>
                  <Ionicons name="chevron-down" size={16} color={theme.colors.neutral.gray[600]} />
                </Pressable>
              </View>
              
              {/* Win Rate Circle Chart */}
              <View style={styles.winRateContainer}>
                <WinRateCircle winRate={75} />
                <View style={styles.winRateLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#34C759' }]} />
                    <Text style={styles.legendText}>Wins</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#FF3B30' }]} />
                    <Text style={styles.legendText}>Losses</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Match Details Modal */}
      {modalVisible && selectedGame && (
        <MatchDetailsModal
          match={selectedGame}
          onClose={handleCloseModal}
        />
      )}
      
      {/* ELO Dropdown Modal */}
      <DropdownModal
        visible={eloDropdownVisible}
        onClose={() => setEloDropdownVisible(false)}
        options={gameTypeOptions}
        selectedValue={selectedGameType}
        onSelect={handleGameTypeSelect}
        title="Game Type"
      />
      
      {/* League Stats Dropdown Modal */}
      <DropdownModal
        visible={leagueDropdownVisible}
        onClose={() => setLeagueDropdownVisible(false)}
        options={gameTypeOptions}
        selectedValue={selectedGameType}
        onSelect={handleGameTypeSelect}
        title="Game Type"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    height: 290, // Adjusted height for the more concave curve
    position: 'relative',
  },
  orangeHeader: {
    height: 290,
    position: 'relative',
  },
  safeHeader: {
    flex: 1,
    paddingBottom: 150, // Space for the concave curve
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  headerLeft: {
    width: 40,
  },
  settingsIcon: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    padding: theme.spacing.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  concaveCurve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  whiteBackground: {
    backgroundColor: '#f0f0f0', // Background color
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    marginTop: -1, // Slight overlap to ensure no gap
  },
  avatarContainer: {
    alignSelf: 'center',
    marginTop: -200, // Position avatar - more negative = higher up
    position: 'relative',
    zIndex: 15,
    marginBottom: theme.spacing.sm, // Reduced spacing to bring content closer
  },
  avatar: {
    width: 100,  // 3/4 of 120
    height: 100, // 3/4 of 120
    borderRadius: 50, // Half of 100 to make it perfectly circular
    backgroundColor: '#e7e7e7', // Avatar background color
    justifyContent: 'center',
    alignItems: 'center',
    // Removed shadow styling
  },
  editIcon: {
    position: 'absolute',
    bottom: -9,      // Adjust up/down (negative = lower, positive = higher)
    right: -7,      // Adjust left/right (negative = more right, positive = more left)
    padding: 4,
    // Removed backgroundColor, borderRadius, borderWidth, borderColor, and shadows
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xs, // Reduced spacing to bring name closer
  },
  actionIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionIcon: {
    padding: theme.spacing.sm,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: theme.colors.neutral.gray[400],
  },
  addFriendIcon: {
    borderColor: '#20659d',
  },
  name: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: 'bold' as any,
    color: theme.colors.neutral.gray[900],
    fontFamily: theme.typography.fontFamily.primary,
  },
  username: {
    textAlign: 'center',
    color: theme.colors.neutral.gray[600],
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.primary,
  },
  bio: {
    textAlign: 'center',
    color: theme.colors.neutral.gray[500],
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.primary,
    paddingHorizontal: theme.spacing.md,
  },
  infoPills: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b0b0b0',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  pillText: {
    color: '#ffffff',
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.primary,
  },
  sportsPills: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  sportPill: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  sportPillText: {
    color: theme.colors.neutral.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.primary,
    opacity: 0.8,
  },
  sportPillTextActive: {
    fontWeight: theme.typography.fontWeight.semibold as any,
    opacity: 1,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold' as any,
    color: theme.colors.neutral.gray[900],
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.primary,
  },
  achievementContainer: {
    backgroundColor: theme.colors.neutral.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral.gray[100],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementsContent: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  achievementItem: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  achievementTextContainer: {
    marginTop: theme.spacing.xs,
    alignItems: 'center',
  },
  achievementText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.gray[600],
    fontFamily: theme.typography.fontFamily.primary,
    textAlign: 'center',
  },
  achievementYear: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral.gray[400],
    fontFamily: theme.typography.fontFamily.primary,
  },
  achievementChevron: {
    marginLeft: theme.spacing.sm,
  },
  sportsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xl,
  },
  tabs: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    marginLeft: theme.spacing.md,
  },
  tab: {
    paddingVertical: 2,
    paddingHorizontal: 0,
    position: 'relative',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: '#b0b1bb',
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: 'bold' as any,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold' as any,
  },
  skillContainer: {
    backgroundColor: theme.colors.neutral.gray[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral.gray[100],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xl * 3,
  },
  dmrContainer: {
    backgroundColor: theme.colors.neutral.gray[50],
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral.gray[100],
  },
  skillLevelSection: {
    marginTop: theme.spacing.md,
  },
  dmrValues: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl * 2,
    marginTop: theme.spacing.md,
  },
  dmrItem: {
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  doublesItem: {
    marginLeft: theme.spacing.sm,
  },
  dropdownSection: {
    marginTop: theme.spacing.md,
  },
  dropdown: {
    backgroundColor: theme.colors.neutral.white,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral.gray[300],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 80,
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.xl,
  },
  dropdownText: {
    color: theme.colors.neutral.gray[600],
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: '500' as any,
  },
  dmrHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingLeft: theme.spacing.md,
  },
  dmrRatingsRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginRight: theme.spacing.md,
  },
  dmrItemVertical: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dmrTypeLabel: {
    color: theme.colors.neutral.gray[600],
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.medium as any,
    marginBottom: theme.spacing.xs,
  },
  dmrItemHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ratingCircleSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.neutral.gray[50],
    borderWidth: 3,
    borderColor: '#fea04d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingTextSmall: {
    color: theme.colors.neutral.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: 'bold' as any,
    fontFamily: theme.typography.fontFamily.primary,
  },
  dropdownSection: {
    marginBottom: theme.spacing.md,
  },
  dropdownHorizontal: {
    backgroundColor: theme.colors.neutral.white,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral.gray[300],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 100,
  },
  ratingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.neutral.gray[50],
    borderWidth: 3,
    borderColor: '#fea04d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    color: theme.colors.neutral.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: 'bold' as any,
    fontFamily: theme.typography.fontFamily.primary,
  },
  skillLabel: {
    color: theme.colors.neutral.gray[600],
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: '500' as any,
  },
  dmrLabel: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  skillValue: {
    color: theme.colors.neutral.gray[500],
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.primary,
  },
  statsSection: {
    marginTop: theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: theme.colors.neutral.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.neutral.gray[900],
    fontFamily: theme.typography.fontFamily.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral.gray[500],
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.primary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.neutral.gray[200],
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
    fontWeight: '500' as any,
    color: theme.colors.neutral.gray[600],
    fontFamily: theme.typography.fontFamily.primary,
    marginLeft: theme.spacing.sm,
  },
  // Graph styles
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.neutral.white,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 400,
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
  modalScrollView: {
    flexGrow: 1,
  },
  modalScrollContent: {
    paddingBottom: 0,
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
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.gray[50],
  },
  modalLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.gray[500],
    fontFamily: theme.typography.fontFamily.primary,
  },
  modalValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral.gray[700],
    fontWeight: theme.typography.fontWeight.medium as any,
    fontFamily: theme.typography.fontFamily.primary,
  },
  modalValueLarge: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold as any,
    fontFamily: theme.typography.fontFamily.primary,
  },
  resultBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  winBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  lossBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  resultText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold as any,
    fontFamily: theme.typography.fontFamily.primary,
  },
  // Match Details Card Styles (compact version for modal)
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
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.primary,
  },
  scoreboardContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.neutral.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    height: 28,
    marginBottom: theme.spacing.xs,
  },
  playerColumn: {
    flex: 2,
    justifyContent: 'flex-end',
  },
  setColumn: {
    flex: 0.8,
    alignItems: 'center',
  },
  playerName: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral.gray[700],
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  setHeader: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral.gray[500],
    fontFamily: theme.typography.fontFamily.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  score: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.gray[700],
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.bold,
    height: 28,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
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
    flexDirection: 'column',
  },
  dateText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.gray[600],
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  timeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral.gray[500],
    fontFamily: theme.typography.fontFamily.primary,
    marginTop: 2,
  },
  statusContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fontFamily.primary,
    textTransform: 'uppercase',
  },
  ratingChangeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    paddingBottom: 0,
    marginBottom: 0,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral.gray[100],
  },
  ratingChangeLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.gray[600],
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: 0,
  },
  ratingChangeValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.primary,
    marginBottom: 0,
  },
  // League Stats Styles  
  leagueStatsContainer: {
    backgroundColor: theme.colors.neutral.gray[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral.gray[100],
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  winRateContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  winRateLegend: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.gray[700],
    fontFamily: theme.typography.fontFamily.primary,
  },
});