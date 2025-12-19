import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Plus, LogOut, User, Link, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

type Child = Database['public']['Tables']['children']['Row'];

export default function ParentHomeScreen() {
  const router = useRouter();
  const { signOut, profile } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    if (profile) {
      loadChildren();
    }
  }, [profile]);

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', profile?.family_id!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async () => {
    if (!newChildName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    try {
      const { error } = await supabase.from('children').insert({
        family_id: profile?.family_id!,
        name: newChildName.trim(),
      });

      if (error) throw error;

      setNewChildName('');
      setAddModalVisible(false);
      loadChildren();
    } catch (error) {
      console.error('Error adding child:', error);
      Alert.alert('Error', 'Failed to add child');
    }
  };

  const handleGenerateCode = async (child: Child) => {
    setGeneratingCode(true);
    try {
      const { data, error } = await supabase.rpc('generate_linking_code', {
        child_id_param: child.id,
      });

      if (error) {
        if (error.message.includes('Unauthorized')) {
          Alert.alert('Error', 'You do not have permission to generate a code for this child');
        } else if (error.message.includes('Child not found')) {
          Alert.alert('Error', 'Child not found');
        } else if (error.message.includes('Failed to generate unique code')) {
          Alert.alert('Error', 'System busy, please try again');
        } else {
          Alert.alert('Error', 'Failed to generate code');
        }
        return;
      }

      const updatedChild: Child = {
        ...child,
        linking_code: data.code,
        linking_code_expires_at: data.expires_at,
      };

      setChildren((prevChildren) =>
        prevChildren.map((c) => (c.id === child.id ? updatedChild : c))
      );

      setSelectedChild(updatedChild);
      setCodeModalVisible(true);
    } catch (error: any) {
      console.error('Error generating code:', error);
      Alert.alert('Error', error?.message || 'Failed to generate code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Success', 'Code copied to clipboard');
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/role-selection');
  };

  const renderChild = ({ item }: { item: Child }) => (
    <View style={styles.childCard}>
      <View style={styles.childInfo}>
        <User size={32} color="#4F46E5" />
        <View style={styles.childDetails}>
          <Text style={styles.childName}>{item.name}</Text>
          {item.device_id && (
            <Text style={styles.linkedText}>Device Linked</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => handleGenerateCode(item)}
        disabled={generatingCode}
      >
        {generatingCode ? (
          <ActivityIndicator size="small" color="#4F46E5" />
        ) : (
          <>
            <Link size={20} color="#4F46E5" />
            <Text style={styles.linkButtonText}>Link</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Zoomi</Text>
          <Text style={styles.subtitle}>Parent Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Children</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No children added yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add a child
            </Text>
          </View>
        ) : (
          <FlatList
            data={children}
            renderItem={renderChild}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Child</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Child's Name"
              value={newChildName}
              onChangeText={setNewChildName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setAddModalVisible(false);
                  setNewChildName('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddChild}
              >
                <Text style={styles.modalAddButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={codeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCodeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Linking Code</Text>
            <Text style={styles.codeInstructions}>
              Share this code with {selectedChild?.name}. It expires in 10
              minutes.
            </Text>
            <View style={styles.codeContainer}>
              <Text style={styles.code}>{selectedChild?.linking_code}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(selectedChild?.linking_code!)}
              >
                <Copy size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setCodeModalVisible(false);
                setSelectedChild(null);
              }}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#4F46E5',
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
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    gap: 12,
  },
  childCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  childDetails: {
    gap: 4,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  linkedText: {
    fontSize: 12,
    color: '#10B981',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalAddButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#4F46E5',
  },
  modalAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  codeInstructions: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  code: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4F46E5',
    letterSpacing: 8,
  },
  copyButton: {
    padding: 8,
  },
  modalCloseButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#4F46E5',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
