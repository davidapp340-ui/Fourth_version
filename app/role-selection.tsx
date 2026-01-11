import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Baby } from 'lucide-react-native';

export default function RoleSelectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zoomi</Text>
      <Text style={styles.subtitle}>בחר תפקיד</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.parentButton]}
          onPress={() => router.push('/parent-auth')}
        >
          <Users size={48} color="#FFFFFF" />
          <Text style={styles.buttonText}>הורה</Text>
          <Text style={styles.buttonSubtext}>Parent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.childButton]}
          onPress={() => router.push('/child-login')}
        >
          <Baby size={48} color="#FFFFFF" />
          <Text style={styles.buttonText}>ילד</Text>
          <Text style={styles.buttonSubtext}>Child</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: '#6B7280',
    marginBottom: 60,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 20,
  },
  button: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  parentButton: {
    backgroundColor: '#4F46E5',
  },
  childButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  buttonSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
});
