import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Activity } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function ChildHomeScreen() {
  const router = useRouter();
  const { signOut, child } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/role-selection');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('child_home.title')}</Text>
          <Text style={styles.subtitle}>{t('child_home.welcome', { childName: child?.name })}</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Activity size={64} color="#10B981" />
          <Text style={styles.cardTitle}>{t('child_home.ready_workout_title')}</Text>
          <Text style={styles.cardText}>
            {t('child_home.ready_workout_text')}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('child_home.coming_soon_title')}</Text>
          <Text style={styles.infoItem}>{t('child_home.coming_soon_custom_paths')}</Text>
          <Text style={styles.infoItem}>{t('child_home.coming_soon_progress')}</Text>
          <Text style={styles.infoItem}>{t('child_home.coming_soon_badges')}</Text>
          <Text style={styles.infoItem}>{t('child_home.coming_soon_challenges')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  signOutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    paddingLeft: 8,
  },
});
