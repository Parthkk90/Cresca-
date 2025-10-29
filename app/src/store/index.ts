import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {WalletState, UserProfile, Transaction, ScheduledPayment, Token} from '@types';

interface AppStore {
  // Wallet state
  wallet: WalletState;
  setWallet: (wallet: Partial<WalletState>) => void;
  disconnectWallet: () => void;
  
  // User profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateXP: (xp: number) => void;
  unlockAchievement: (achievementId: string) => void;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  
  // Scheduled payments
  scheduledPayments: ScheduledPayment[];
  setScheduledPayments: (payments: ScheduledPayment[]) => void;
  addScheduledPayment: (payment: ScheduledPayment) => void;
  removeScheduledPayment: (id: number) => void;
  
  // Tokens
  tokens: Token[];
  setTokens: (tokens: Token[]) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Notifications
  notifications: Array<{id: string; title: string; message: string; type: string}>;
  addNotification: (notification: {title: string; message: string; type: string}) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial wallet state
      wallet: {
        address: null,
        privateKey: null,
        balance: 0,
        isConnected: false,
        network: 'testnet',
      },
      
      setWallet: (wallet) =>
        set((state) => ({
          wallet: {...state.wallet, ...wallet},
        })),
      
      disconnectWallet: () =>
        set({
          wallet: {
            address: null,
            privateKey: null,
            balance: 0,
            isConnected: false,
            network: 'testnet',
          },
          profile: null,
        }),
      
      // Profile
      profile: null,
      
      setProfile: (profile) => set({profile}),
      
      updateXP: (xp) =>
        set((state) => {
          if (!state.profile) return state;
          
          const newXP = state.profile.xp + xp;
          const newLevel = Math.floor(newXP / 1000) + 1; // Level up every 1000 XP
          
          return {
            profile: {
              ...state.profile,
              xp: newXP,
              level: newLevel,
            },
          };
        }),
      
      unlockAchievement: (achievementId) =>
        set((state) => {
          if (!state.profile) return state;
          
          const updatedAchievements = state.profile.achievements.map((a) =>
            a.id === achievementId
              ? {...a, unlockedAt: Date.now(), progress: a.target}
              : a
          );
          
          return {
            profile: {
              ...state.profile,
              achievements: updatedAchievements,
            },
          };
        }),
      
      // Transactions
      transactions: [],
      
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),
      
      // Scheduled payments
      scheduledPayments: [],
      
      setScheduledPayments: (payments) => set({scheduledPayments: payments}),
      
      addScheduledPayment: (payment) =>
        set((state) => ({
          scheduledPayments: [...state.scheduledPayments, payment],
        })),
      
      removeScheduledPayment: (id) =>
        set((state) => ({
          scheduledPayments: state.scheduledPayments.filter((p) => p.id !== id),
        })),
      
      // Tokens
      tokens: [],
      setTokens: (tokens) => set({tokens}),
      
      // UI state
      isLoading: false,
      setIsLoading: (loading) => set({isLoading: loading}),
      
      // Notifications
      notifications: [],
      
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: Date.now().toString(),
            },
          ],
        })),
      
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'aptpays-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        wallet: state.wallet,
        profile: state.profile,
        transactions: state.transactions.slice(0, 100), // Keep last 100
      }),
    }
  )
);
