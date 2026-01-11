import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { loading, isParent, isChild } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (isParent) {
          router.replace('/(parent)/home');
        } else if (isChild) {
          router.replace('/(child)/home');
        } else {
          router.replace('/role-selection');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [loading, isParent, isChild]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zoomi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
