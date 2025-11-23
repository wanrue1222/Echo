import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VoiceButton } from '../VoiceButton';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { queryAI } from '../../utils/api';

interface GeneralInfoPageProps {
  query: string;
  onBack: () => void;
  onVoiceCommand: (command: string) => void;
}

export function GeneralInfoPage({ query, onBack, onVoiceCommand }: GeneralInfoPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Fetch AI response when query changes
    if (query && query.trim().length > 0) {
      setIsPlaying(true);
      queryAI(query)
        .then((result) => {
          setAiResponse(result.response);
          setIsPlaying(false);
        })
        .catch((error) => {
          console.error('Failed to get AI response:', error);
          setAiResponse(`I heard you say: "${query}". How can I help you find what you're looking for?`);
          setIsPlaying(false);
        });
    }
  }, [query]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={onBack}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={32} color="#2563eb" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Here's what I found</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>AI Assistant</Text>
            <TouchableOpacity 
              style={[styles.audioButton, isPlaying && styles.audioButtonActive]}
            >
              {isPlaying ? (
                <MaterialIcons 
                  name="volume-up" 
                  size={28} 
                  color="#ffffff" 
                />
              ) : (
                <MaterialIcons 
                  name="smart-toy" 
                  size={28} 
                  color="#2563eb" 
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>You asked</Text>
              <Text style={styles.infoValue}>"{query}"</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Response</Text>
              {isPlaying ? (
                <Text style={styles.infoValue}>Thinking...</Text>
              ) : aiResponse ? (
                <Text style={styles.infoValue}>{aiResponse}</Text>
              ) : (
                <Text style={styles.infoValue}>Processing your request...</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
        <View style={styles.footerContent}>
          <VoiceButton onCommand={onVoiceCommand} label="Ask another question" size="medium" />
          <TouchableOpacity style={styles.typeButton}>
            <Text style={styles.typeButtonText}>Type instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backText: {
    color: '#2563eb',
    fontSize: 24,
  },
  headerTitle: {
    color: '#111827',
    fontSize: 30,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: '#eff6ff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 30,
    flex: 1,
  },
  audioButton: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonActive: {
    backgroundColor: '#2563eb',
  },
  infoSection: {
    gap: 24,
  },
  infoItem: {
    gap: 8,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 20,
  },
  infoValue: {
    color: '#111827',
    fontSize: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  footerContent: {
    alignItems: 'center',
    gap: 16,
  },
  typeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  typeButtonText: {
    color: '#2563eb',
    fontSize: 20,
  },
});
