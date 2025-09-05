import React, { useState, useEffect, useCallback } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DropdownModal, WinRateCircle, MatchDetailsModal, EloProgressGraph, EditIcon, MatchHistoryButton, AchievementIcon } from '../src/features/profile/components';
import type { GameData, UserData } from '../src/features/profile/types';
// import { mockEloData, userData, gameTypeOptions } from '../src/features/profile/data/mockData'; // Team lead's original mock data - commented for API implementation
import { useProfileState } from '../src/features/profile/hooks/useProfileState';
import { useProfileHandlers } from '../src/features/profile/hooks/useProfileHandlers';
import { useSession, authClient } from '@/lib/auth-client';
import { getBackendBaseURL } from '@/config/network';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

const CURVE_CONFIG = {
  HEIGHT: 200,
  DEPTH: 0,
  START_Y: 130,
} as const;

const SPORT_COLORS = {
  Tennis: '#354a33',
  Pickleball: '#512f48', 
  Padel: '#af7e04',
} as const;

const generateCurvePath = (width: number): string => {
  const { HEIGHT, DEPTH, START_Y } = CURVE_CONFIG;
  
  // Safety check for width to prevent NaN issues
  const safeWidth = !isNaN(width) && width > 0 ? width : 300; // Default fallback width
  
  return `M0,${HEIGHT} L0,${START_Y} Q${safeWidth/2},${DEPTH} ${safeWidth},${START_Y} L${safeWidth},${START_Y} L${safeWidth},${HEIGHT} Z`;
};

// ELO Progress Graph Component


// Custom Edit Icon SVG Component



export default function ProfileAdaptedScreen() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    activeTab,
    selectedGame,
    modalVisible,
    eloDropdownVisible,
    leagueDropdownVisible,
    selectedGameType,
    setActiveTab,
    setSelectedGame,
    setModalVisible,
    setEloDropdownVisible,
    setLeagueDropdownVisible,
    setSelectedGameType,
  } = useProfileState();

  const {
    handleSettingsPress,
    handleEditPress,
    handleGameTypeSelect,
    handleLeagueSelect,
    handleTabPress,
    handleGamePointPress,
    handleModalClose,
    handleMatchHistoryPress,
  } = useProfileHandlers({
    setEloDropdownVisible,
    setLeagueDropdownVisible,
    setSelectedGameType,
    setActiveTab,
    setSelectedGame,
    setModalVisible,
  });
  
  // API functions to fetch real data from backend
  const fetchAchievements = async () => {
    try {
      if (!session?.user?.id) {
        console.log('No session user ID available for achievements');
        return;
      }

      const backendUrl = getBackendBaseURL();
      console.log('Fetching achievements from:', `${backendUrl}/api/player/profile/achievements`);
      
      const response = await authClient.$fetch(`${backendUrl}/api/player/profile/achievements`, {
        method: 'GET',
      });
      
      console.log('Achievements API response:', response);
      
      if (response && response.data && response.data.achievements) {
        console.log('Setting achievements data:', response.data.achievements);
        setAchievements(response.data.achievements);
      } else {
        console.log('No achievements data found, setting empty array');
        setAchievements([]);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements([]); // Set empty array on error
    }
  };

  const fetchProfileData = async () => {
    try {
      if (!session?.user?.id) {
        console.log('No session user ID available');
        return;
      }
      
      console.log('Current session:', session);
      
      const backendUrl = getBackendBaseURL();
      console.log('Fetching profile data from:', `${backendUrl}/api/player/profile/me`);
      
      // Use authClient.$fetch as primary method for better session handling
      const authResponse = await authClient.$fetch(`${backendUrl}/api/player/profile/me`, {
        method: 'GET',
      });
      
      console.log('Profile API response:', authResponse);
      
      if (authResponse && authResponse.data && authResponse.data.data) {
        console.log('Setting profile data:', authResponse.data.data);
        setProfileData(authResponse.data.data);
      } else if (authResponse && authResponse.data) {
        console.log('Setting profile data (direct):', authResponse.data);
        setProfileData(authResponse.data);
      } else {
        console.error('No profile data received from authClient');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const fetchMatchHistory = async () => {
    try {
      if (!session?.user?.id) return;
      
      const backendUrl = getBackendBaseURL();
      console.log('Fetching match history from:', `${backendUrl}/api/player/profile/matches`);
      
      // Use authClient's internal fetch method for proper session handling
      const response = await authClient.$fetch(`${backendUrl}/api/player/profile/matches`, {
        method: 'GET',
      });
      
      console.log('Match history data received:', response);
      
      if (response && response.data) {
        setMatchHistory(response.data);
      } else if (response && response.error && response.error.status === 404) {
        console.log('No match history found for user (404) - this is normal for new users');
        setMatchHistory([]);
      } else {
        console.error('No match history data received');
        setMatchHistory([]);
      }
    } catch (error) {
      console.error('Error fetching match history:', error);
      
      // Fallback to regular fetch with proper headers if authClient.$fetch fails
      try {
        const backendUrl = getBackendBaseURL();
        const response = await fetch(`${backendUrl}/api/player/profile/matches`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Get session token from storage and include it
            'Authorization': `Bearer ${await SecureStore.getItemAsync('deuceleague.sessionToken')}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          setMatchHistory(result.data || []);
        } else if (response.status === 404) {
          console.log('No match history found (fallback 404) - normal for new users');
          setMatchHistory([]);
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
        setMatchHistory([]); // Set empty array as final fallback
      }
    }
  };

  // Use useFocusEffect to refresh data every time the screen comes into focus
  const loadData = useCallback(async () => {
    if (session?.user?.id) {
      setIsLoading(true);
      // Fetch profile data and achievements
      await fetchProfileData();
      await fetchAchievements();
      // await fetchMatchHistory(); // Commented until match system is ready
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );
  
  // Fallback data using team lead's original mock data for when API is not available
  // const { mockEloData, userData, gameTypeOptions } = require('../src/features/profile/data/mockData');
  
  // Transform API data to match frontend expectations
  console.log('Transforming profile data:', profileData);
  console.log('Skill ratings:', profileData?.skillRatings);
  
  const userData = profileData ? {
    name: profileData.name || 'No name available',
    username: profileData.username || profileData.displayUsername || 'No username',
    bio: profileData.bio || 'No bio added yet.',
    location: profileData.area || 'Location not set',
    gender: profileData.gender || 'Gender not set',
    skillLevel: 'Intermediate', // This would come from skillRatings
    skillRatings: profileData.skillRatings || {}, // Pass through the actual skill ratings for DMR section
    sports: profileData.skillRatings && typeof profileData.skillRatings === 'object' 
      ? Object.keys(profileData.skillRatings).map(sport => sport.charAt(0).toUpperCase() + sport.slice(1)) 
      : ['No sports yet'],
    activeSports: profileData.skillRatings && typeof profileData.skillRatings === 'object' 
      ? Object.keys(profileData.skillRatings).map(sport => sport.charAt(0).toUpperCase() + sport.slice(1)) 
      : [],
    achievements: achievements || [],
  } : {
    name: 'Loading...',
    username: 'loading',
    bio: 'Loading...',
    location: 'Loading...',
    gender: 'Loading...',
    skillLevel: 'Loading...',
    sports: [],
    activeSports: [],
    achievements: [],
  };
  
  console.log('Final userData:', userData);
  
  // Helper function to get rating values from skillRatings
  const getRatingForType = (sport: string, type: 'singles' | 'doubles') => {
    if (userData.skillRatings && userData.skillRatings[sport.toLowerCase()]) {
      const rating = userData.skillRatings[sport.toLowerCase()];
      
      // Check for specific singles/doubles rating first
      if (type === 'singles' && rating.singles) {
        return Math.round(rating.singles * 1000); // Convert to display format
      } else if (type === 'doubles' && rating.doubles) {
        return Math.round(rating.doubles * 1000); // Convert to display format
      } else if (rating.rating) {
        // Fallback to general rating if specific type not available
        return Math.round(rating.rating * 1000);
      }
    }
    return 0; // Default to 0 if no rating available
  };
  
  const gameTypeOptions = ['Singles', 'Doubles']; // Static options
  
  // Calculate win rate from match history - placeholder until match system is implemented
  const calculateWinRate = () => {
    if (userData.name === 'Loading...') return 0; // Still loading
    
    // Check if user has match data
    const hasMatches = profileData?.totalMatches && profileData.totalMatches > 0;
    if (hasMatches) {
      // TODO: Calculate actual win rate from match history when matches exist
      return 0; // For now, return 0 until we have match data
    }
    return 0; // No matches yet
  };
  
  // Placeholder ELO data until match system is implemented
  const mockEloData = [
    {
      date: 'No matches yet',
      time: '',
      rating: 1400,
      opponent: 'No data available',
      result: '-',
      score: '-',
      ratingChange: 0,
      league: 'Play your first match to see data here!',
      player1: userData.name || 'You',
      player2: 'No opponent',
      scores: { 
        set1: { player1: null, player2: null }, 
        set2: { player1: null, player2: null }, 
        set3: { player1: null, player2: null } 
      },
      status: 'pending'
    }
  ];
  
  // Using real API data instead of mock data


  // Show loading state while fetching data
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

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
              height={CURVE_CONFIG.HEIGHT}
              width={width}
              viewBox={`0 0 ${width} ${CURVE_CONFIG.HEIGHT}`}
              style={styles.concaveCurve}
            >
              <Path
                d={generateCurvePath(width)}
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
              
              return (
                <Pressable 
                  key={sport}
                  style={[
                    styles.sportPill,
                    { 
                      backgroundColor: SPORT_COLORS[sport as keyof typeof SPORT_COLORS],
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
                {userData.achievements && userData.achievements.length > 0 ? (
                  userData.achievements.slice(0, 2).map((achievement) => (
                    <View key={achievement.id} style={styles.achievementItem}>
                      <AchievementIcon iconName={achievement.icon} />
                      <View style={styles.achievementTextContainer}>
                        <Text style={styles.achievementText}>{achievement.title}</Text>
                        {achievement.unlockedAt && (
                          <Text style={styles.achievementYear}>
                            ({new Date(achievement.unlockedAt).getFullYear()})
                          </Text>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noAchievementsContainer}>
                    <Ionicons name="trophy-outline" size={32} color={theme.colors.neutral.gray[400]} />
                    <Text style={styles.noAchievementsText}>No achievements yet</Text>
                    <Text style={styles.noAchievementsSubtext}>Keep playing to unlock achievements!</Text>
                  </View>
                )}
              </View>
              {userData.achievements && userData.achievements.length > 0 && (
                <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} style={styles.achievementChevron} />
              )}
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
                      <Text style={styles.ratingTextSmall}>
                        {getRatingForType(userData.sports[0] || 'pickleball', 'singles') || 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.dmrItemVertical}>
                    <Text style={styles.dmrTypeLabel}>Doubles</Text>
                    <View style={styles.ratingCircleSmall}>
                      <Text style={styles.ratingTextSmall}>
                        {getRatingForType(userData.sports[0] || 'pickleball', 'doubles') || 'N/A'}
                      </Text>
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
                <WinRateCircle winRate={calculateWinRate()} />
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
          onClose={handleModalClose}
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
  noAchievementsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  noAchievementsText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral.gray[600],
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing.sm,
  },
  noAchievementsSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.gray[400],
    fontFamily: theme.typography.fontFamily.primary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.neutral.gray[600],
    fontFamily: theme.typography.fontFamily.primary,
  },
});