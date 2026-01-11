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
  I18nManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Plus, LogOut, User, Link, Copy, Globe } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

type Child = Database['public']['Tables']['children']['Row'];

export default function ParentHomeScreen() {
  const router = useRouter();
  const { signOut, profile } = useAuth();
  const { t, i18n } = useTranslation();
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

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'he' ? 'en' : 'he';
    await i18n.changeLanguage(newLang);
    I18nManager.forceRTL(newLang === 'he');
  };

  const handleAddChild = async () => {
    if (!newChildName.trim()) {
      Alert.alert(t('common.error'), t('parent_home.add_child_modal.error_empty_name'));
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
      Alert.alert(t('common.error'), t('parent_home.add_child_modal.error_failed'));
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
          Alert.alert(t('common.error'), t('parent_home.code_generation_errors.unauthorized'));
        } else if (error.message.includes('Child not found')) {
          Alert.alert(t('common.error'), t('parent_home.code_generation_errors.child_not_found'));
        } else if (error.message.includes('Failed to generate unique code')) {
          Alert.alert(t('common.error'), t('parent_home.code_generation_errors.system_busy'));
        } else {
          Alert.alert(t('common.error'), t('parent_home.code_generation_errors.generic_error'));
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
      Alert.alert(t('common.error'), error?.message || t('parent_home.code_generation_errors.generic_error'));
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert(t('common.success'), t('parent_home.linking_code_modal.copy_success'));
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
            <Text style={styles.linkedText}>{t('parent_home.device_linked')}</Text>
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
            <Text style={styles.linkButtonText}>{t('parent_home.link_button')}</Text>
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
          <Text style={styles.title}>{t('parent_home.title')}</Text>
          <Text style={styles.subtitle}>{t('parent_home.subtitle')}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
            <Globe size={22} color="#4F46E5" />
            <Text style={styles.languageButtonText}>
              {i18n.language === 'he' ? 'EN' : 'HE'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('parent_home.children_section_title')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('parent_home.empty_state')}</Text>
            <Text style={styles.emptySubtext}>
              {t('parent_home.empty_state_subtitle')}
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
            <Text style={styles.modalTitle}>{t('parent_home.add_child_modal.title')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t('parent_home.add_child_modal.name_placeholder')}
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
                <Text style={styles.modalCancelButtonText}>{t('parent_home.add_child_modal.cancel_button')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddChild}
              >
                <Text style={styles.modalAddButtonText}>{t('parent_home.add_child_modal.add_button')}</Text>
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
            <Text style={styles.modalTitle}>{t('parent_home.linking_code_modal.title')}</Text>
            <Text style={styles.codeInstructions}>
              {t('parent_home.linking_code_modal.instructions', { childName: selectedChild?.name })}
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
              <Text style={styles.modalCloseButtonText}>{t('parent_home.linking_code_modal.close_button')}</Text>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
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
