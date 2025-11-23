import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VoiceButton } from '../VoiceButton';
import { Page } from '../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onVoiceCommand: (command: string) => void;
}

export function HomePage({ onNavigate, onVoiceCommand }: HomePageProps) {
  const insets = useSafeAreaInsets();
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(32, insets.bottom + 32) }
      ]}
    >
      {/* Category Buttons */}
      <View style={styles.categorySection}>
        <View style={styles.categoryGrid}>
          <TouchableOpacity 
            onPress={() => onNavigate('events')}
            style={styles.categoryButton}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="event" size={32} color="#2563eb" />
            </View>
            <Text style={styles.categoryText}>Events</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => onNavigate('volunteer')}
            style={styles.categoryButton}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="people" size={32} color="#2563eb" />
            </View>
            <Text style={styles.categoryText}>Volunteers</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => onNavigate('health')}
            style={styles.categoryButton}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="favorite" size={32} color="#2563eb" />
            </View>
            <Text style={styles.categoryText}>Health Services</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>
          How can I help you today?
        </Text>

        {!isTypingMode ? (
          <>
            <VoiceButton onCommand={onVoiceCommand} label="Tap to speak" size="large" />

            <TouchableOpacity 
              style={styles.typeButton}
              onPress={() => setIsTypingMode(true)}
            >
              <Text style={styles.typeButtonText}>Type instead</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your question here..."
              placeholderTextColor="#9ca3af"
              value={textInput}
              onChangeText={setTextInput}
              multiline
              autoFocus
              onSubmitEditing={() => {
                if (textInput.trim()) {
                  onVoiceCommand(textInput.trim());
                  setTextInput('');
                  setIsTypingMode(false);
                }
              }}
            />
            <View style={styles.textInputActions}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  if (textInput.trim()) {
                    onVoiceCommand(textInput.trim());
                    setTextInput('');
                    setIsTypingMode(false);
                  }
                }}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setTextInput('');
                  setIsTypingMode(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  contentContainer: {
    flexGrow: 1,
  },
  categorySection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#dbeafe',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    color: '#111827',
    fontSize: 18,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    color: '#111827',
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: 320,
  },
  typeButton: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  typeButtonText: {
    color: '#2563eb',
    fontSize: 20,
  },
  textInputContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: '#111827',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInputActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 18,
    fontWeight: '600',
  },
});
