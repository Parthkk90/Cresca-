import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS} from '@/theme';
import aptosService from '@/services/aptosService';
import {useAppStore} from '@/store';

const ScheduleScreen = ({navigation}: any) => {
  const {wallet, scheduledPayments, setScheduledPayments, updateXP} = useAppStore();
  const [mode, setMode] = useState<'one-time' | 'recurring'>('one-time');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [interval, setInterval] = useState('86400'); // Daily
  const [occurrences, setOccurrences] = useState('30');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, [wallet.address]);

  const loadSchedules = async () => {
    if (wallet.address) {
      const schedules = await aptosService.getAllSchedules(wallet.address);
      setScheduledPayments(
        schedules.map((s: any, idx: number) => ({
          id: s.id || idx,
          recipient: s.recipient,
          amount: s.amount / 100000000,
          nextExecSecs: s.nextExecSecs,
          intervalSecs: s.intervalSecs,
          remainingOccurrences: s.remainingOccurrences,
          active: s.active,
          type: s.intervalSecs === 0 ? 'one-time' : 'recurring',
        }))
      );
    }
  };

  const handleCreate = async () => {
    if (!recipient || !amount || !date) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const executeAt = Math.floor(new Date(date).getTime() / 1000);

      if (mode === 'one-time') {
        await aptosService.createOneTimePayment(
          wallet.privateKey!,
          recipient,
          parseFloat(amount),
          executeAt
        );
      } else {
        await aptosService.createRecurringPayment(
          wallet.privateKey!,
          recipient,
          parseFloat(amount),
          executeAt,
          parseInt(interval),
          parseInt(occurrences)
        );
      }

      updateXP(50);
      Alert.alert('Success!', 'Payment scheduled successfully');
      
      // Reset form
      setRecipient('');
      setAmount('');
      setDate('');
      
      // Reload schedules
      await loadSchedules();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (scheduleId: number) => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure? Remaining funds will be refunded.',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await aptosService.cancelSchedule(wallet.privateKey!, scheduleId);
              await loadSchedules();
              Alert.alert('Success', 'Payment canceled and funds refunded');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scheduled Payments</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'one-time' && styles.modeBtnActive]}
            onPress={() => setMode('one-time')}>
            <Text
              style={[styles.modeText, mode === 'one-time' && styles.modeTextActive]}>
              One-Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'recurring' && styles.modeBtnActive]}
            onPress={() => setMode('recurring')}>
            <Text
              style={[styles.modeText, mode === 'recurring' && styles.modeTextActive]}>
              Recurring
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Recipient Address</Text>
          <TextInput
            style={styles.input}
            value={recipient}
            onChangeText={setRecipient}
            placeholder="0x..."
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>Amount (APT)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>
            {mode === 'one-time' ? 'Execute Date' : 'First Payment Date'}
          </Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD HH:MM"
            placeholderTextColor={COLORS.textSecondary}
          />

          {mode === 'recurring' && (
            <>
              <Text style={styles.label}>Interval (seconds)</Text>
              <View style={styles.intervalOptions}>
                <TouchableOpacity
                  style={styles.intervalBtn}
                  onPress={() => setInterval('86400')}>
                  <Text style={styles.intervalText}>Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.intervalBtn}
                  onPress={() => setInterval('604800')}>
                  <Text style={styles.intervalText}>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.intervalBtn}
                  onPress={() => setInterval('2592000')}>
                  <Text style={styles.intervalText}>Monthly</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Occurrences</Text>
              <TextInput
                style={styles.input}
                value={occurrences}
                onChangeText={setOccurrences}
                placeholder="30"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="number-pad"
              />
            </>
          )}

          <TouchableOpacity onPress={handleCreate} disabled={loading}>
            <LinearGradient colors={COLORS.gradientPurple} style={styles.createBtn}>
              <Text style={styles.createText}>
                {loading ? 'Creating...' : 'Schedule Payment'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Active Schedules */}
        <Text style={styles.sectionTitle}>Active Schedules ({scheduledPayments.filter(s => s.active).length})</Text>
        {scheduledPayments
          .filter((s) => s.active)
          .map((schedule) => (
            <View key={schedule.id} style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <Icon
                  name={schedule.type === 'one-time' ? 'calendar' : 'sync'}
                  size={24}
                  color={COLORS.primary}
                />
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleType}>
                    {schedule.type === 'one-time' ? 'One-Time' : 'Recurring'}
                  </Text>
                  <Text style={styles.scheduleRecipient} numberOfLines={1}>
                    {schedule.recipient}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleCancel(schedule.id)}>
                  <Icon name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.scheduleDetails}>
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>Amount:</Text>
                  <Text style={styles.scheduleValue}>{schedule.amount} APT</Text>
                </View>
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>Next Payment:</Text>
                  <Text style={styles.scheduleValue}>
                    {new Date(schedule.nextExecSecs * 1000).toLocaleDateString()}
                  </Text>
                </View>
                {schedule.type === 'recurring' && (
                  <View style={styles.scheduleRow}>
                    <Text style={styles.scheduleLabel}>Remaining:</Text>
                    <Text style={styles.scheduleValue}>
                      {schedule.remainingOccurrences} payments
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {padding: SPACING.lg, paddingTop: 50},
  title: {fontSize: TYPOGRAPHY.fontSize.xl, color: COLORS.text, fontWeight: 'bold'},
  content: {flex: 1, padding: SPACING.lg},
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  modeBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeText: {fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary},
  modeTextActive: {color: COLORS.text, fontWeight: '600'},
  form: {marginBottom: SPACING.xl},
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  intervalOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  intervalBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  intervalText: {fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.text},
  createBtn: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  createText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  scheduleCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  scheduleInfo: {flex: 1},
  scheduleType: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  scheduleRecipient: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  scheduleDetails: {gap: SPACING.xs},
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleLabel: {fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary},
  scheduleValue: {fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.text},
});

export default ScheduleScreen;
