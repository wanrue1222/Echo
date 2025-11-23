import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VoiceButton } from '../VoiceButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface VolunteerMatchingPageProps {
  onBack: () => void;
  onVoiceCommand: (command: string) => void;
}

export function VolunteerMatchingPage({ onBack, onVoiceCommand }: VolunteerMatchingPageProps) {
  const [isMatched, setIsMatched] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Simulate matching process
    const timer = setTimeout(() => {
      setIsMatched(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isMatched) {
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
        </View>

        {/* Loading Content */}
        <View style={styles.loadingContent}>
          <Text style={styles.loadingTitle}>
            We're finding a volunteer for you…
          </Text>
          <Text style={styles.loadingSubtitle}>
            Please wait a moment
          </Text>

          {/* Loading Animation */}
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>You're matched!</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Volunteer Card */}
        <View style={styles.volunteerCard}>
          <View style={styles.volunteerHeader}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={40} color="#ffffff" />
            </View>
            <View style={styles.volunteerInfo}>
              <Text style={styles.volunteerName}>Sarah Johnson</Text>
              <View style={styles.volunteerDetails}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="access-time" size={20} color="#4b5563" />
                  <Text style={styles.detailText}>15 min</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="place" size={20} color="#4b5563" />
                  <Text style={styles.detailText}>0.5 mi</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Map Preview */}
          <View style={styles.mapPreview}>
            <MaterialIcons name="place" size={48} color="#2563eb" />
          </View>

          <Text style={styles.onTheWayText}>
            Your volunteer is on the way
          </Text>
        </View>

        {/* Verification */}
        <View style={styles.verificationCard}>
          <Text style={styles.verificationLabel}>
            Your verification word:
          </Text>
          <Text style={styles.verificationWord}>
            BLUE
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
        <VoiceButton onCommand={onVoiceCommand} label="Ask something else" size="medium" />
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
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingTitle: {
    color: '#111827',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingSubtitle: {
    color: '#4b5563',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 48,
  },
  loadingCircle: {
    width: 128,
    height: 128,
    borderRadius: 9999,
    backgroundColor: '#60a5fa',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  volunteerCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 24,
  },
  volunteerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    color: '#111827',
    fontSize: 30,
    marginBottom: 8,
  },
  volunteerDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#4b5563',
    fontSize: 20,
  },
  mapPreview: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  onTheWayText: {
    color: '#111827',
    fontSize: 24,
    textAlign: 'center',
  },
  verificationCard: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  verificationLabel: {
    color: '#ffffff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  verificationWord: {
    color: '#ffffff',
    fontSize: 48,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
});
