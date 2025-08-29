export interface DashboardUser {
  id: string;
  username: string;
  email: string;
}

export interface DashboardStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
}
