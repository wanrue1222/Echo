const express = require('express');
const multer = require('multer');
const speech = require('@google-cloud/speech');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Initialize Google Cloud Speech client
// Uses Application Default Credentials (ADC) - no key file needed
const speechClient = new speech.SpeechClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to list available models via REST API
async function listAvailableModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
}

// Cache for available models
let availableModelsCache = null;
let modelsCacheTime = null;
const MODELS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getAvailableModel() {
  // Check cache first
  const now = Date.now();
  if (availableModelsCache && modelsCacheTime && (now - modelsCacheTime) < MODELS_CACHE_TTL) {
    return availableModelsCache;
  }

  // Preferred free-tier models (these should be available on free tier)
  const preferredFreeTierModels = ['gemini-pro-latest', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  
  // Try to list models from API
  const models = await listAvailableModels();
  if (models.length > 0) {
    // First, try to find a preferred free-tier model
    for (const preferredModel of preferredFreeTierModels) {
      const foundModel = models.find(m => {
        const modelName = m.name?.replace('models/', '') || m.name;
        return modelName === preferredModel && 
               (m.supportedGenerationMethods?.includes('generateContent') || m.name?.includes('gemini'));
      });
      if (foundModel) {
        const modelName = foundModel.name?.replace('models/', '') || foundModel.name;
        availableModelsCache = modelName;
        modelsCacheTime = now;
        console.log(`Found preferred free-tier model: ${modelName}`);
        return modelName;
      }
    }
    
    // If no preferred model found, find any model that supports generateContent
    const generateContentModel = models.find(m => 
      m.supportedGenerationMethods?.includes('generateContent') || 
      m.name?.includes('gemini')
    );
    if (generateContentModel) {
      // Extract model name (e.g., "models/gemini-pro" -> "gemini-pro")
      const modelName = generateContentModel.name?.replace('models/', '') || generateContentModel.name;
      availableModelsCache = modelName;
      modelsCacheTime = now;
      console.log(`Found available model: ${modelName}`);
      return modelName;
    }
  }

  // Fallback to preferred free-tier models
  console.log('Using fallback free-tier model');
  return preferredFreeTierModels[0]; // Return first as default
}

// Speech-to-Text endpoint
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No audio file received');
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Validate audio buffer
    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.error('Audio buffer is empty');
      return res.status(400).json({ error: 'Audio file is empty' });
    }

    console.log(`Received audio file: size=${req.file.buffer.length} bytes, mimetype=${req.file.mimetype}, originalname=${req.file.originalname}`);

    const audioBytes = req.file.buffer.toString('base64');
    
    if (!audioBytes || audioBytes.length === 0) {
      console.error('Failed to convert audio to base64');
      return res.status(400).json({ error: 'Failed to process audio data' });
    }

    const audioFormat = req.body.format || 'WEBM_OPUS'; // Default format
    const sampleRateHertz = parseInt(req.body.sampleRate) || 48000;
    const languageCode = req.body.languageCode || 'en-US';

    // Map format strings to Google Cloud encoding types
    // Note: Google Cloud Speech-to-Text supports: FLAC, LINEAR16, MULAW, AMR, AMR_WB, 
    // OGG_OPUS, SPEEX_WITH_HEADER_BYTE, WEBM_OPUS, MP3
    // M4A/AAC is NOT directly supported - we'll try to use MP3 encoding or convert
    const encodingMap = {
      'WEBM_OPUS': 'WEBM_OPUS',
      'WEBM': 'WEBM_OPUS',
      'MP3': 'MP3',
      'M4A': 'MP3', // M4A files often work with MP3 encoding (if they contain MP3 data)
      'AAC': 'MP3', // Try MP3 encoding for AAC files
      'LINEAR16': 'LINEAR16',
      'FLAC': 'FLAC',
    };

    let encoding = encodingMap[audioFormat.toUpperCase()] || 'WEBM_OPUS';
    
    // For M4A files, if MP3 doesn't work, we might need to convert
    // For now, try MP3 first since some M4A files contain MP3 data
    
    console.log(`Processing audio: format=${audioFormat}, encoding=${encoding}, sampleRate=${sampleRateHertz}, base64Length=${audioBytes.length}`);

    // Validate audio content before sending
    if (!audioBytes || audioBytes.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid audio data: empty base64 string' });
    }

    // Configure recognition request
    // Google Cloud Speech-to-Text requires explicit encoding
    // M4A/AAC is NOT supported - we need to handle this differently
    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
        enableAutomaticPunctuation: true,
        model: 'latest_long',
      },
    };

    // Validate request structure
    if (!request.audio || !request.audio.content) {
      console.error('Invalid request structure:', JSON.stringify(request, null, 2));
      return res.status(500).json({ error: 'Invalid request structure: audio content missing' });
    }

    console.log(`Sending request to Google Cloud Speech-to-Text: audioContentLength=${request.audio.content.length}, encoding=${encoding}`);
    
    // Perform speech recognition
    const [response] = await speechClient.recognize(request);
    
    console.log('Received response from Google Cloud Speech-to-Text');
    
    if (!response.results || response.results.length === 0) {
      return res.status(400).json({ error: 'No speech detected' });
    }

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    res.json({ transcription });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    // Provide more helpful error messages
    let errorMessage = 'Failed to process speech';
    if (error.message?.includes('Permission denied') || error.message?.includes('permission')) {
      errorMessage = 'Permission denied. Please check Google Cloud authentication.';
    } else if (error.message?.includes('API not enabled')) {
      errorMessage = 'Speech-to-Text API not enabled. Please enable it in Google Cloud Console.';
    } else if (error.message?.includes('Invalid audio')) {
      errorMessage = 'Invalid audio format. Please try recording again.';
    } else {
      errorMessage = error.message || 'Failed to process speech';
    }
    res.status(500).json({ error: errorMessage, details: error.message });
  }
});

// AI Query endpoint (Gemini)
app.post('/api/ai-query', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here' || process.env.GEMINI_API_KEY.trim() === '') {
      console.warn('Gemini API key not configured');
      console.warn('GEMINI_API_KEY value:', process.env.GEMINI_API_KEY ? 'Set but may be invalid' : 'Not set');
      return res.json({ 
        response: `I heard you say: "${text}". To enable AI responses, please configure your Gemini API key in the server/.env file. See GOOGLE_CLOUD_SETUP.md for instructions.` 
      });
    }

    // Validate API key format (Gemini API keys typically start with 'AIza')
    if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
      console.warn('Gemini API key format appears invalid (should start with "AIza")');
    }

    // Get an available model (will try to list from API or use fallback)
    let model;
    let modelName;
    
    try {
      modelName = await getAvailableModel();
      model = genAI.getGenerativeModel({ model: modelName });
      console.log(`Using Gemini model: ${modelName}`);
    } catch (err) {
      console.warn(`Failed to get available model, trying fallbacks:`, err.message);
      // Fallback: try common model names (prioritize free-tier)
      const fallbackModels = ['gemini-pro-latest', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
      let foundModel = false;
      
      for (const fallbackName of fallbackModels) {
        try {
          model = genAI.getGenerativeModel({ model: fallbackName });
          modelName = fallbackName;
          console.log(`Using fallback Gemini model: ${fallbackName}`);
          foundModel = true;
          break;
        } catch (fallbackErr) {
          console.warn(`Fallback model ${fallbackName} failed:`, fallbackErr.message);
          continue;
        }
      }
      
      if (!foundModel) {
        throw new Error('No available Gemini model found. Please check your API key and ensure the Generative Language API is enabled.');
      }
    }

    const prompt = `You are a helpful AI assistant for a community resource app that helps people find:
- Events and activities (walking groups, community lunches, workshops, book clubs)
- Volunteer opportunities and matching
- Health services (hospitals, clinics, urgent care)

The user said: "${text}"

Based on what the user is asking for, provide a helpful, friendly response that:
1. Acknowledges their request naturally
2. Guides them to the right section of the app if relevant (Events, Volunteers, or Health Services)
3. Provides helpful, actionable information
4. Is warm, supportive, and easy to understand

If they're asking about:
- Activities, events, things to do → mention the Events section
- Helping others, volunteering → mention the Volunteer Matching section  
- Medical care, doctors, hospitals → mention the Health Services section
- General community info → provide helpful information

Keep your response conversational, under 150 words, and end with a helpful suggestion or question.`;

    console.log(`Sending prompt to Gemini for text: "${text.substring(0, 50)}..."`);
    
    // Add retry logic for transient network errors
    let result;
    let lastError;
    const maxRetries = 2;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} of ${maxRetries}...`);
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        
        result = await model.generateContent(prompt);
        break; // Success, exit retry loop
      } catch (retryError) {
        lastError = retryError;
        const isNetworkError = retryError.code === 'ENOTFOUND' || 
                              retryError.code === 'ECONNREFUSED' || 
                              retryError.code === 'ETIMEDOUT' ||
                              retryError.code === 'ECONNRESET' ||
                              retryError.message?.includes('network') ||
                              retryError.message?.includes('fetch') ||
                              retryError.message?.includes('timeout');
        
        // Only retry on network errors, not on API errors
        if (!isNetworkError || attempt === maxRetries) {
          throw retryError; // Re-throw if not a network error or max retries reached
        }
        console.warn(`Network error on attempt ${attempt + 1}, will retry...`);
      }
    }
    
    const response = await result.response;
    const aiText = response.text();
    console.log(`Received AI response: "${aiText.substring(0, 100)}..."`);

    res.json({ response: aiText });
  } catch (error) {
    console.error('AI query error details:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    console.error('Error cause:', error.cause);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages based on error type
    let errorMessage = 'The AI service is currently unavailable';
    
    // Check for 404 errors (model not found) - these are configuration issues, not network errors
    if (error.message?.includes('404') || error.message?.includes('not found') || error.message?.includes('not supported')) {
      errorMessage = 'Gemini model not available. Please ensure the Generative Language API is enabled in Google Cloud Console and your API key has access to Gemini models.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS resolution failed. Please check your internet connection and DNS settings.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused. The AI service may be temporarily unavailable.';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
      errorMessage = 'Connection timeout. Please check your internet connection and try again.';
    } else if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid API key') || error.message?.includes('API key not valid')) {
      errorMessage = 'Invalid Gemini API key. Please check your server/.env file and ensure GEMINI_API_KEY is correct.';
    } else if (error.message?.includes('PERMISSION_DENIED') || error.message?.includes('permission')) {
      errorMessage = 'Permission denied. Please check your Gemini API key permissions.';
    } else if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('quota') || error.message?.includes('429')) {
      // Clear model cache if we hit quota - might be using wrong model
      availableModelsCache = null;
      modelsCacheTime = null;
      errorMessage = 'API quota exceeded for this model. The system will try a different model on the next request. Please check your Google Cloud billing and quotas.';
    } else if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      errorMessage = 'Request timeout. The AI service took too long to respond. Please try again.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('NetworkError')) {
      // Only classify as network error if it's not a 404
      if (!error.message?.includes('404')) {
        errorMessage = `Network error: ${error.message}. Please check your internet connection.`;
      } else {
        errorMessage = 'Gemini model not available. Please ensure the Generative Language API is enabled.';
      }
    } else if (error.message) {
      errorMessage = `AI service error: ${error.message}`;
    }
    
    // Return a graceful fallback with more context
    res.json({ 
      response: `I heard you say: "${req.body.text}". ${errorMessage}. Your message was received and the transcription worked correctly.` 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Whack 2025 API Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      diagnose: 'GET /api/diagnose',
      speechToText: 'POST /api/speech-to-text',
      aiQuery: 'POST /api/ai-query'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Diagnostic endpoint to check configuration
app.get('/api/diagnose', async (req, res) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    server: {
      status: 'running',
      port: port,
    },
    configuration: {
      googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID ? 'Set' : 'Not set',
      geminiApiKey: process.env.GEMINI_API_KEY ? 
        (process.env.GEMINI_API_KEY.startsWith('AIza') ? 'Set (format looks valid)' : 'Set (format may be invalid)') : 
        'Not set',
    },
    tests: {
      speechClient: 'Not tested',
      geminiClient: 'Not tested',
      geminiApiConnection: 'Not tested',
    },
  };

  // Test Speech client initialization
  try {
    if (speechClient) {
      diagnostics.tests.speechClient = 'Initialized';
    }
  } catch (err) {
    diagnostics.tests.speechClient = `Error: ${err.message}`;
  }

  // Test Gemini client initialization and API connectivity
  try {
    if (genAI) {
      diagnostics.tests.geminiClient = 'Initialized';
        // Try to get a model (will try multiple model names)
        // Start with gemini-pro as it's the most stable and widely available
        const testModelNames = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash-latest'];
        let testModel = null;
        let modelError = null;
        let workingModel = null;
        
        for (const modelName of testModelNames) {
          try {
            testModel = genAI.getGenerativeModel({ model: modelName });
            diagnostics.tests.geminiClient = `Initialized - testing model: ${modelName}`;
            
            // Test actual API call with a simple prompt
            try {
              const testResult = await testModel.generateContent('Say "test"');
              const testResponse = await testResult.response;
              const testText = testResponse.text();
              diagnostics.tests.geminiClient = `Initialized - working model: ${modelName}`;
              diagnostics.tests.geminiApiConnection = `Connected successfully using ${modelName}. Response: "${testText.substring(0, 50)}"`;
              workingModel = modelName;
              break; // Found a working model, stop trying
            } catch (apiErr) {
              // API call failed, try next model
              console.warn(`Model ${modelName} API call failed:`, apiErr.message);
              modelError = apiErr;
              continue;
            }
          } catch (modelErr) {
            // Model initialization failed, try next model
            console.warn(`Model ${modelName} initialization failed:`, modelErr.message);
            modelError = modelErr;
            continue;
          }
        }
        
        if (!workingModel) {
          diagnostics.tests.geminiClient = `Initialized but no working model found. Tried: ${testModelNames.join(', ')}. Last error: ${modelError?.message || 'Unknown'}`;
          diagnostics.tests.geminiApiConnection = `Cannot test - no accessible model found. Error: ${modelError?.message || 'Unknown'}`;
        }
    }
  } catch (err) {
    diagnostics.tests.geminiClient = `Error: ${err.message}`;
    diagnostics.tests.geminiApiConnection = `Cannot test - client initialization failed`;
  }

  res.json(diagnostics);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API available at http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});

