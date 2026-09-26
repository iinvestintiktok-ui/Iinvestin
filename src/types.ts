export type InvestmentStatus = 'gain' | 'loss' | 'neutral' | 'pending';

export type LeaderboardPeriod = 'day' | 'week' | 'all';

export interface Creator {
  id: string;
  pseudo: string;
  avatar: string;
  followers: number;
  tiktokUrl: string;
  bio: string;
  joinedAt: string;
}

export interface Investor {
  id: string;
  pseudo: string;
  tag: string;
  avatarColor: string;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface Investment {
  id: string;
  investorId: string;
  creatorId: string;
  videoTitle: string;
  videoDescription: string;
  thumbnail: string;
  viewsAtInvestment: number;
  followersAtInvestment: number;
  amountInvested: number;
  currentViews: number | null;
  viewsAfter48h: number | null;
  valueAfter48h: number | null;
  multiplier: number | null;
  percentage: number | null;
  status: InvestmentStatus;
  timestamp: string;
  tiktokUrl: string;
}

export interface InvestmentWithRelations extends Investment {
  investor: Investor | null;
  creator: Creator | null;
}

export interface InvestorStats {
  totalProfit: number;
  rank: number;
  winRate: number;
  bestMultiplier: number;
  winningBets: number;
  totalBets: number;
}

export interface CreatorStats {
  timesBet: number;
  totalGain: number;
  mostProfitableVideo: string | null;
  bestMultiplier: number;
}

export interface LeaderboardEntry {
  investor: Investor;
  totalProfit: number;
  winningBets: number;
  losingBets: number;
  totalBets: number;
  maxPercentage: number;
}

export interface KpiData {
  totalDistributed: number;
  totalUsers: number;
  investmentsLast48h: number;
  bestMultiplier: number;
  activeBets: number;
}

export interface Sponsor {
  name: string;
  logo: string;
  prizePool: number;
  endDate: string;
}
