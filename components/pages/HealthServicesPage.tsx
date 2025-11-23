import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VoiceButton } from '../VoiceButton';
import { Page } from '../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HealthServicesPageProps {
  onBack: () => void;
  onNavigate: (page: Page) => void;
  onVoiceCommand: (command: string) => void;
}

const healthServices = [
  {
    id: 1,
    name: 'Springfield Medical Center',
    distance: '0.8 mi',
    hours: 'Open 24 hours',
    type: 'Hospital',
  },
  {
    id: 2,
    name: 'Community Health Clinic',
    distance: '1.2 mi',
    hours: 'Mon-Fri: 8 AM - 5 PM',
    type: 'Clinic',
  },
  {
    id: 3,
    name: 'Riverside Urgent Care',
    distance: '1.5 mi',
    hours: 'Daily: 7 AM - 9 PM',
    type: 'Urgent Care',
  },
];

export function HealthServicesPage({ onBack, onNavigate, onVoiceCommand }: HealthServicesPageProps) {
  const insets = useSafeAreaInsets();
  
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
        <Text style={styles.headerTitle}>Health Services Nearby</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {healthServices.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceContent}>
              <View style={styles.iconBox}>
                <MaterialIcons name="favorite" size={32} color="#ef4444" />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceType}>{service.type}</Text>
                <View style={styles.serviceDetails}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="access-time" size={20} color="#4b5563" />
                    <Text style={styles.detailText}>{service.hours}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="place" size={20} color="#2563eb" />
                    <Text style={styles.detailTextBlue}>{service.distance}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Volunteer Prompt */}
        <View style={styles.volunteerPrompt}>
          <Text style={styles.promptText}>
            Would you like help from a volunteer?
          </Text>
          <TouchableOpacity 
            onPress={() => onNavigate('volunteer')}
            style={styles.volunteerButton}
          >
            <Text style={styles.volunteerButtonText}>Yes, find a volunteer</Text>
          </TouchableOpacity>
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
    paddingVertical: 24,
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  serviceContent: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: '#111827',
    fontSize: 24,
    marginBottom: 4,
  },
  serviceType: {
    color: '#4b5563',
    fontSize: 20,
    marginBottom: 12,
  },
  serviceDetails: {
    gap: 8,
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
  detailTextBlue: {
    color: '#2563eb',
    fontSize: 20,
  },
  volunteerPrompt: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  promptText: {
    color: '#ffffff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  volunteerButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  volunteerButtonText: {
    color: '#2563eb',
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
