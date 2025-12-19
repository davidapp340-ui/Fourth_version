import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Activity } from 'lucide-react-native';

export default function ChildHomeScreen() {
  const router = useRouter();
  const { signOut, child } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/role-selection');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Zoomi</Text>
          <Text style={styles.subtitle}>Welcome, {child?.name}!</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Activity size={64} color="#10B981" />
          <Text style={styles.cardTitle}>Ready to Workout!</Text>
          <Text style={styles.cardText}>
            Your workout programs will appear here. Stay tuned for exciting
            training sessions!
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Coming Soon:</Text>
          <Text style={styles.infoItem}>Custom workout paths</Text>
          <Text style={styles.infoItem}>Progress tracking</Text>
          <Text style={styles.infoItem}>Achievement badges</Text>
          <Text style={styles.infoItem}>Family challenges</Text>
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
