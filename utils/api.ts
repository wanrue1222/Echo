// For Expo Go on physical device, use your computer's IP address instead of localhost
// Get your IP with: ifconfig | grep "inet " | grep -v 127.0.0.1
// Or check Expo dev tools - it shows the IP address
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.175.0.109:3001';

export interface SpeechToTextResponse {
  transcription: string;
}

export interface AIQueryResponse {
  response: string;
}

/**
 * Send audio data to backend for speech-to-text conversion
 * @param audioData - Blob (web) or file URI string (React Native)
 */
export async function speechToText(
  audioData: Blob | string,
  format: string = 'WEBM_OPUS',
  sampleRate: number = 48000,
  languageCode: string = 'en-US',
  fileName: string = 'audio.webm'
): Promise<SpeechToTextResponse> {
  const formData = new FormData();
  
  // React Native FormData supports file URIs directly
  // Web FormData needs a Blob
  if (typeof audioData === 'string') {
    // React Native: file URI
    const mimeType = fileName.endsWith('.wav') ? 'audio/wav' : 'audio/m4a';
    formData.append('audio', {
      uri: audioData,
      type: mimeType,
      name: fileName,
    } as any);
  } else {
    // Web: Blob
    formData.append('audio', audioData, fileName);
  }
  
  formData.append('format', format);
  formData.append('sampleRate', sampleRate.toString());
  formData.append('languageCode', languageCode);

  const response = await fetch(`${API_BASE_URL}/api/speech-to-text`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to convert speech to text';
    try {
      const error = await response.json();
      errorMessage = error.error || error.details || errorMessage;
    } catch (e) {
      errorMessage = `Server error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Send text to AI for processing
 */
export async function queryAI(text: string): Promise<AIQueryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ai-query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process AI query');
  }

  return response.json();
}

