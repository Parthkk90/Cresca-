import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS} from '@/theme';
import {useAppStore} from '@/store';

const AvatarSelectionScreen = ({navigation}: any) => {
  const {profile, updateProfile, unlockAchievement} = useAppStore();
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  const avatarsByRarity = {
    common: [
      '😀', '😎', '🤓', '😇', '🥳', '🤩', '😊', '🙂',
      '🐶', '🐱', '🐼', '🐨', '🦁', '🐯', '🦊', '🐰',
    ],
    rare: [
      '🦄', '🐉', '🦅', '🦉', '🦋', '🐙', '🦈', '🐳',
      '👑', '💎', '🎭', '🎨', '🎸', '🎮', '🚀', '⚡',
    ],
    epic: [
      '🔥', '❄️', '⚔️', '🛡️', '🏆', '👾', '🤖', '👽',
      '🌟', '💫', '🌈', '🎆', '🎇', '✨', '💥', '🌙',
    ],
    legendary: [
      '🏅', '🥇', '🎖️', '👸', '🤴', '🧙', '🧚', '🦸',
      '💰', '💸', '🏦', '💳', '📈', '💹', '🔱', '⚜️',
    ],
  };

  const requiredLevels = {
    common: 1,
    rare: 5,
    epic: 10,
    legendary: 20,
  };

  const isUnlocked = (rarity: keyof typeof requiredLevels) => {
    return profile.level >= requiredLevels[rarity];
  };

  const handleSelectAvatar = () => {
    updateProfile({avatar: selectedAvatar});
    
    // Unlock achievement on first avatar change
    if (profile.avatar !== selectedAvatar) {
      unlockAchievement({
        id: 'avatar_change',
        name: 'Style Icon',
        description: 'Changed your avatar for the first time',
        icon: '🎨',
        xpReward: 10,
        unlockedAt: Date.now(),
      });
    }

    Alert.alert('Avatar Updated!', 'Your new avatar looks great!', [
      {
        text: 'OK',
        onPress: () => navigation.replace('MainTabs'),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradientPurple}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Text style={styles.selectedAvatar}>{selectedAvatar}</Text>
        <Text style={styles.title}>Choose Your Avatar</Text>
        <View style={styles.levelBadge}>
          <Icon name="star" size={16} color={COLORS.warning} />
          <Text style={styles.levelText}>Level {profile.level}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {Object.entries(avatarsByRarity).map(([rarity, avatars]) => {
          const unlocked = isUnlocked(rarity as keyof typeof requiredLevels);

          return (
            <View key={rarity} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.rarityTitle}>
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </Text>
                {!unlocked && (
                  <View style={styles.lockBadge}>
                    <Icon name="lock-closed" size={14} color={COLORS.text} />
                    <Text style={styles.lockText}>
                      Level {requiredLevels[rarity as keyof typeof requiredLevels]}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.avatarGrid}>
                {avatars.map((avatar, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.avatarCard,
                      selectedAvatar === avatar && styles.avatarCardSelected,
                      !unlocked && styles.avatarCardLocked,
                    ]}
                    onPress={() => unlocked && setSelectedAvatar(avatar)}
                    disabled={!unlocked}>
                    <Text
                      style={[
                        styles.avatarEmoji,
                        !unlocked && styles.avatarEmojiLocked,
                      ]}>
                      {unlocked ? avatar : '🔒'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSelectAvatar}>
          <LinearGradient
            colors={COLORS.gradientGreen}
            style={styles.confirmButton}>
            <Icon name="checkmark-circle" size={24} color={COLORS.text} />
            <Text style={styles.confirmText}>Confirm Selection</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: SPACING.xl,
  },
  selectedAvatar: {fontSize: 80, marginBottom: SPACING.md},
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background + '40',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  levelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  content: {flex: 1, padding: SPACING.lg},
  section: {marginBottom: SPACING.xl},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  rarityTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: '600',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  lockText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  avatarCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarCardSelected: {
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  avatarCardLocked: {
    opacity: 0.5,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  avatarEmojiLocked: {
    opacity: 0.3,
  },
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  confirmText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
});

export default AvatarSelectionScreen;
