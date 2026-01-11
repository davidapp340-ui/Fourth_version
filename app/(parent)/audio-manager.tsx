import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Upload, Trash2, FileAudio } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';

interface AudioFile {
  name: string;
  path: string;
  size: number;
  created_at: string;
}

export default function AudioManagerScreen() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAudioFiles();
  }, []);

  const loadAudioFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('exercise-audio')
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const files: AudioFile[] = (data || []).map((file) => ({
        name: file.name,
        path: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at || '',
      }));

      setAudioFiles(files);
    } catch (error) {
      console.error('Error loading audio files:', error);
      Alert.alert('Error', 'Failed to load audio files');
    } finally {
      setLoading(false);
    }
  };

  const pickAndUploadAudio = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert(
          'Web Upload',
          'For web uploads, please use the Supabase Dashboard:\n\n1. Go to your Supabase project dashboard\n2. Navigate to Storage\n3. Select "exercise-audio" bucket\n4. Click "Upload file"'
        );
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      if (!file.uri) {
        Alert.alert('Error', 'No file selected');
        return;
      }

      if (file.size && file.size > 52428800) {
        Alert.alert('Error', 'File size must be less than 50MB');
        return;
      }

      setUploading(true);

      const response = await fetch(file.uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('exercise-audio')
        .upload(file.name, arrayBuffer, {
          contentType: file.mimeType || 'audio/mpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      Alert.alert('Success', `File "${file.name}" uploaded successfully`);
      await loadAudioFiles();
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const deleteAudioFile = async (filePath: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${filePath}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.storage
                .from('exercise-audio')
                .remove([filePath]);

              if (error) throw error;

              Alert.alert('Success', 'File deleted successfully');
              await loadAudioFiles();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete file');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getPublicUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('exercise-audio')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Audio Manager</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading audio files...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Audio Manager</Text>
        <Text style={styles.subtitle}>Upload and manage exercise audio files</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Upload Instructions</Text>
        <Text style={styles.infoText}>
          {Platform.OS === 'web'
            ? '• Use Supabase Dashboard for web uploads\n• Max file size: 50MB\n• Supported formats: MP3, WAV, OGG, AAC, M4A'
            : '• Tap "Upload Audio File" to select a file\n• Max file size: 50MB\n• Supported formats: MP3, WAV, OGG, AAC, M4A'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
        onPress={pickAndUploadAudio}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Upload size={20} color="#FFF" />
            <Text style={styles.uploadButtonText}>Upload Audio File</Text>
          </>
        )}
      </TouchableOpacity>

      <ScrollView style={styles.fileList} contentContainerStyle={styles.fileListContent}>
        <Text style={styles.sectionTitle}>
          Uploaded Files ({audioFiles.length})
        </Text>

        {audioFiles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileAudio size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No audio files uploaded yet</Text>
          </View>
        ) : (
          audioFiles.map((file) => (
            <View key={file.path} style={styles.fileCard}>
              <View style={styles.fileIcon}>
                <FileAudio size={24} color="#10B981" />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                <Text style={styles.filePath} numberOfLines={1}>
                  {getPublicUrl(file.path)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteAudioFile(file.path)}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  infoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  fileList: {
    flex: 1,
  },
  fileListContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9CA3AF',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  filePath: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
});
