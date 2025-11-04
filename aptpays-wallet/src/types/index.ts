export interface WalletState {
  address: string | null;
  privateKey: string | null;
  balance: number;
  isConnected: boolean;
  network: 'mainnet' | 'testnet';
}

export interface UserProfile {
  address: string;
  avatarId: string;
  username: string;
  level: number;
  xp: number;
  achievements: Achievement[];
  joinedAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress: number;
  target: number;
}

export interface Transaction {
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'schedule' | 'invest';
  from: string;
  to: string;
  amount: number;
  token: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  fee?: number;
}

export interface ScheduledPayment {
  id: number;
  recipient: string;
  amount: number;
  nextExecSecs: number;
  intervalSecs: number;
  remainingOccurrences: number;
  active: boolean;
  type: 'one-time' | 'recurring';
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: number;
  priceUSD: number;
  change24h: number;
  icon: string;
}

export interface InvestmentBundle {
  id: string;
  name: string;
  description: string;
  apy: number;
  riskLevel: 'low' | 'medium' | 'high';
  minAmount: number;
  tokens: {symbol: string; allocation: number}[];
  totalInvested: number;
  icon: string;
}

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  priceImpact: number;
  fee: number;
  route: string[];
}

export interface NFCPayment {
  amount: number;
  recipient: string;
  merchantName?: string;
  timestamp: number;
}

export interface QRCodeData {
  address: string;
  amount?: number;
  token?: string;
  message?: string;
}

// Avatar system
export interface AvatarOption {
  id: string;
  name: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockLevel: number;
}

// Gamification
export interface LevelProgress {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
}

export interface Reward {
  id: string;
  type: 'xp' | 'achievement' | 'avatar' | 'token';
  amount: number;
  description: string;
  timestamp: number;
}
