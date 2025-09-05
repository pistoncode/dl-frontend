import { useState } from 'react';
import type { GameData } from '../types';

export const useProfileState = (initialSport?: string) => {
  const [activeTab, setActiveTab] = useState(initialSport || 'Tennis');
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eloDropdownVisible, setEloDropdownVisible] = useState(false);
  const [leagueDropdownVisible, setLeagueDropdownVisible] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState('Singles');

  return {
    // State values
    activeTab,
    selectedGame,
    modalVisible,
    eloDropdownVisible,
    leagueDropdownVisible,
    selectedGameType,
    
    // State setters
    setActiveTab,
    setSelectedGame,
    setModalVisible,
    setEloDropdownVisible,
    setLeagueDropdownVisible,
    setSelectedGameType,
  };
};