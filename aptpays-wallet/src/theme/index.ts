// Color palette inspired by modern fintech apps (Revolut, N26, Monzo)
export const COLORS = {
  // Primary brand colors
  primary: '#6C5CE7',      // Purple (gamified, premium)
  primaryDark: '#5849C7',
  primaryLight: '#A29BFE',
  
  // Secondary accent colors
  secondary: '#00B894',    // Green (success, invest)
  secondaryDark: '#00A884',
  accent: '#FDCB6E',       // Gold (rewards, achievements)
  accentOrange: '#FF7675', // Red/Orange (urgent actions)
  
  // Neutral colors
  background: '#0F0F1E',   // Dark background
  surface: '#1A1A2E',      // Card/surface background
  surfaceLight: '#252541',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#A4A6B3',
  textTertiary: '#6B6D7A',
  
  // Functional colors
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#FF7675',
  info: '#74B9FF',
  
  // Gradient colors
  gradientPurple: ['#6C5CE7', '#A29BFE'],
  gradientGreen: ['#00B894', '#55EFC4'],
  gradientGold: ['#FDCB6E', '#FD79A8'],
  gradientBlue: ['#74B9FF', '#0984E3'],
  
  // Chart colors
  chartColors: ['#6C5CE7', '#00B894', '#FDCB6E', '#74B9FF', '#FD79A8'],
  
  // Avatar colors (for gamification)
  avatarColors: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    black: 'Inter-Black',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6C5CE7',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const ANIMATIONS = {
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  timing: {
    duration: 300,
    easing: 'ease-in-out',
  },
};
