import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { NativeAudioRecorder } from '../utils/audioRecorder.native';
import { speechToText, queryAI } from '../utils/api';

interface VoiceButtonProps {
  onCommand: (command: string) => void;
  label?: string;
  size?: 'large' | 'medium';
}

export function VoiceButton({ onCommand, label = 'Tap to speak', size = 'large' }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<NativeAudioRecorder | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recorderRef.current?.isRecording()) {
        recorderRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleVoiceToggle = async () => {
    if (isProcessing) return; // Don't allow toggling while processing
    
    if (!isListening) {
      // Start recording
      try {
        setError(null);
        setIsListening(true);
        
        const recorder = new NativeAudioRecorder();
        recorderRef.current = recorder;
        await recorder.start();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
        setError(errorMessage);
        Alert.alert('Recording Error', errorMessage);
        setIsListening(false);
      }
    } else {
      // Stop recording and process
      if (recorderRef.current?.isRecording()) {
        try {
          setIsProcessing(true);
          setIsListening(false); // Stop listening state immediately
          const audioData = await recorderRef.current.stop();
          
          // Validate audio data before sending
          if (!audioData || !audioData.uri || audioData.size === 0) {
            throw new Error('Recording is empty. Please try again.');
          }
          
          console.log(`Sending audio: ${audioData.size} bytes from ${audioData.uri}`);
          
          // Convert speech to text (LINEAR16/WAV format for React Native - PCM encoding)
          // Pass the file URI directly - React Native FormData supports file URIs
          const { transcription } = await speechToText(audioData.uri, 'LINEAR16', 16000, 'en-US', 'audio.wav');
          
          // Cleanup recording file after successful upload
          try {
            await FileSystem.deleteAsync(audioData.uri, { idempotent: true });
          } catch (cleanupError) {
            console.warn('Failed to cleanup recording file:', cleanupError);
          }
          
          // Send to AI
          try {
            const { response: aiResponse } = await queryAI(transcription);
            // You can use aiResponse here if needed
            console.log('AI Response:', aiResponse);
          } catch (aiError) {
            console.error('AI query error:', aiError);
            // Continue even if AI query fails
          }
          
          // Pass transcription to parent component
          onCommand(transcription);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to process audio';
          console.error('Voice processing error:', err);
          setError(errorMessage);
          // Show more helpful error messages
          let alertMessage = errorMessage;
          if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
            alertMessage = 'Network error. Please check your connection and ensure the server is running.';
          } else if (errorMessage.includes('Permission')) {
            alertMessage = 'Permission denied. Please check Google Cloud setup.';
          } else if (errorMessage.includes('No speech detected')) {
            alertMessage = 'No speech detected. Please try speaking again.';
          }
          Alert.alert('Processing Error', alertMessage);
        } finally {
          setIsProcessing(false);
          recorderRef.current = null;
        }
      } else {
        setIsListening(false);
      }
    }
  };

  const buttonSize = size === 'large' ? 144 : 96;
  const iconSize = size === 'large' ? 64 : 40;
  const backgroundColor = isListening ? '#ef4444' : isProcessing ? '#60a5fa' : '#3b82f6';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleVoiceToggle}
        disabled={isProcessing}
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor,
          },
        ]}
      >
        {isProcessing ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <MaterialIcons
            name={isListening ? 'mic-off' : 'mic'}
            size={iconSize}
            color="#ffffff"
          />
        )}
      </TouchableOpacity>

      <Text style={styles.label}>
        {isProcessing ? 'Processing...' : isListening ? 'Listening...' : label}
      </Text>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  button: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    color: '#4b5563',
    fontSize: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
