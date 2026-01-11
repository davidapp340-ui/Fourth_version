import { View, Text, StyleSheet } from 'react-native';
import { Lightbulb } from 'lucide-react-native';

export default function ScienceScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Lightbulb size={80} color="#4F46E5" />
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.subtitle}>
          We're working on exciting science content for you and your children
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
