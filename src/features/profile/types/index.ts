export interface DropdownModalProps {
  visible: boolean;
  onClose: () => void;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  title?: string;
}

export interface WinRateCircleProps {
  winRate: number;
}

export interface GameData {
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
}

export interface MatchDetailsModalProps {
  match: GameData | null;
  onClose: () => void;
}