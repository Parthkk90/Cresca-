import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SwapScreen from '../screens/SwapScreen';
import InvestScreen from '../screens/InvestScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import SendScreen from '../screens/SendScreen';
import ReceiveScreen from '../screens/ReceiveScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import NFCPayScreen from '../screens/NFCPayScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AvatarSelectionScreen from '../screens/AvatarSelectionScreen';

import {COLORS, SPACING, TYPOGRAPHY} from '../theme';
import {useAppStore} from '../store';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom tab bar icon with gradient
const TabIcon = ({
  name,
  focused,
  label,
}: {
  name: string;
  focused: boolean;
  label: string;
}) => {
  if (focused) {
    return (
      <LinearGradient
        colors={COLORS.gradientPurple}
        style={styles.activeTab}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Icon name={name} size={24} color={COLORS.text} />
      </LinearGradient>
    );
  }

  return (
    <View style={styles.inactiveTab}>
      <Icon name={name} size={24} color={COLORS.textSecondary} />
    </View>
  );
};

// Main tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon name="home" focused={focused} label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="Swap"
        component={SwapScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon name="swap-horizontal" focused={focused} label="Swap" />
          ),
        }}
      />
      <Tab.Screen
        name="Invest"
        component={InvestScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon name="trending-up" focused={focused} label="Invest" />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon name="calendar" focused={focused} label="Schedule" />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon name="list" focused={focused} label="All" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root stack navigator
const AppNavigator = () => {
  const {wallet} = useAppStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: COLORS.background},
        cardStyleInterpolator: ({current}) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
      }}>
      {!wallet.isConnected ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen
            name="AvatarSelection"
            component={AvatarSelectionScreen}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="Send" component={SendScreen} />
          <Stack.Screen name="Receive" component={ReceiveScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} />
          <Stack.Screen name="NFCPay" component={NFCPayScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  activeTab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveTab: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
