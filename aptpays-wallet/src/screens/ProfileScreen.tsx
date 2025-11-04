import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS} from '@/theme';
import {useAppStore} from '@/store';

const ProfileScreen = ({navigation}: any) => {
  const {wallet, profile, achievements, updateXP} = useAppStore();

  const settings = [
    {icon: 'shield-checkmark', label: 'Security', route: 'Security'},
    {icon: 'notifications', label: 'Notifications', route: 'Notifications'},
    {icon: 'language', label: 'Language', route: 'Language'},
    {icon: 'help-circle', label: 'Help & Support', route: 'Support'},
    {icon: 'document-text', label: 'Terms & Privacy', route: 'Terms'},
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradientPurple}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>{profile.avatar}</Text>
        </View>

        <TouchableOpacity
          style={styles.editAvatarBtn}
          onPress={() => navigation.navigate('AvatarSelection')}>
          <Text style={styles.editAvatarText}>Change Avatar</Text>
        </TouchableOpacity>

        <View style={styles.levelBadge}>
          <Icon name="star" size={16} color={COLORS.warning} />
          <Text style={styles.levelText}>Level {profile.level}</Text>
        </View>

        <Text style={styles.xpText}>
          {profile.xp % 1000} / 1000 XP
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Wallet Info */}
        <View style={styles.walletCard}>
          <Text style={styles.cardTitle}>Wallet Address</Text>
          <Text style={styles.address} numberOfLines={1}>
            {wallet.address}
          </Text>
          <TouchableOpacity style={styles.copyBtn}>
            <Icon name="copy" size={16} color={COLORS.primary} />
            <Text style={styles.copyText}>Copy Address</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{achievements.length}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>

        {/* Achievements Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {achievements.slice(0, 3).map((achievement) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDesc}>{achievement.description}</Text>
              </View>
              <View style={styles.achievementReward}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.rewardText}>+{achievement.xpReward}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settings.map((setting, idx) => (
            <TouchableOpacity key={idx} style={styles.settingRow}>
              <Icon name={setting.icon as any} size={24} color={COLORS.text} />
              <Text style={styles.settingLabel}>{setting.label}</Text>
              <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Icon name="log-out" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Disconnect Wallet</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  avatarEmoji: {fontSize: 60},
  editAvatarBtn: {
    marginTop: SPACING.sm,
  },
  editAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background + '40',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  levelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  xpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text + 'CC',
    marginTop: SPACING.xs,
  },
  content: {flex: 1, padding: SPACING.lg},
  walletCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  address: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.xs,
  },
  copyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {marginBottom: SPACING.xl},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  achievementIcon: {fontSize: 32, marginRight: SPACING.md},
  achievementInfo: {flex: 1},
  achievementName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  achievementDesc: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  achievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.warning,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  logoutText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    fontWeight: '600',
  },
  version: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
});

export default ProfileScreen;
