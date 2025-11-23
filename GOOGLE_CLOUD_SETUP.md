# Google Cloud Speech-to-Text and Gemini Setup Guide

This guide will help you set up Google Cloud Speech-to-Text API and Google Gemini AI for the voice interface.

## Prerequisites

1. A Google Cloud account
2. Node.js installed (v16 or later)
3. npm or yarn package manager

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "whack-2025")
5. Click "Create"
6. Note your Project ID (you'll need this later)

## Step 2: Enable Required APIs

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - **Cloud Speech-to-Text API**
   - **Generative Language API** (for Gemini)

## Step 3: Authenticate with Application Default Credentials (ADC)

**Note**: This setup uses Application Default Credentials instead of service account keys, which is more secure and avoids organization policy restrictions.

1. Install Google Cloud SDK if you haven't already:
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Set up your shell environment**:
   
   **Option A: Use the setup script (recommended)**:
   ```bash
   ./setup-gcloud.sh
   ```
   
   **Option B: Manual setup** - Add to your `~/.zshrc` or `~/.bash_profile`:
   ```bash
   # Add Google Cloud SDK to PATH
   export PATH="/opt/homebrew/share/google-cloud-sdk/bin:$PATH"
   
   # Set Python for gcloud (if using Homebrew Python)
   export CLOUDSDK_PYTHON=/opt/homebrew/bin/python3
   ```
   
   Then reload your shell:
   ```bash
   source ~/.zshrc  # or source ~/.bash_profile
   ```

3. Authenticate with your Google account:
   ```bash
   gcloud auth application-default login
   ```
   This will open a browser window for you to sign in with your Google account.
   
   **Note**: If you get a Python error, make sure `CLOUDSDK_PYTHON` is set correctly. You can also run:
   ```bash
   export CLOUDSDK_PYTHON=/opt/homebrew/bin/python3
   gcloud auth application-default login
   ```

4. Set your default project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```
   Replace `YOUR_PROJECT_ID` with the Project ID you noted in Step 1.

5. **Important**: Make sure your Google account has the necessary permissions:
   - Access to the project you created
   - The APIs enabled in Step 2 should be accessible with your account

## Step 5: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key or use an existing one
4. Copy the API key (you'll need this for the `.env` file)

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Create a `.env` file in the `server` directory and fill in the following:
   ```env
   # Your Google Cloud Project ID
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   
   # Your Gemini API Key
   GEMINI_API_KEY=your-gemini-api-key
   
   # Server port (default: 3001)
   PORT=3001
   
   # API Base URL (for frontend)
   API_BASE_URL=http://localhost:3001
   ```

3. **Important**: 
   - No service account key file needed - ADC handles authentication automatically
   - Never commit the `.env` file to version control
   - Replace `your-project-id` with your actual Project ID from Step 1
   - Replace `your-gemini-api-key` with your Gemini API key from Step 5

## Step 7: Install Backend Dependencies

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Step 8: Start the Backend Server

1. From the server directory, start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

2. The server should start on `http://localhost:3001`
3. You can test it by visiting `http://localhost:3001/api/health`

## Step 9: Configure Frontend API URL

If your backend is running on a different URL (e.g., deployed backend), update the API base URL:

1. Create a `.env` file in the root directory (if not already created)
2. Add:
   ```env
   REACT_APP_API_BASE_URL=http://your-backend-url:3001
   ```

## Troubleshooting

### "Permission denied" errors
- Make sure you've authenticated with `gcloud auth application-default login`
- Verify your Google account has access to the project
- Check that the APIs are enabled in your Google Cloud project
- Ensure your default project is set correctly: `gcloud config set project YOUR_PROJECT_ID`

### "API not enabled" errors
- Go to Google Cloud Console > APIs & Services > Library
- Ensure both "Cloud Speech-to-Text API" and "Generative Language API" are enabled

### "Invalid API key" errors
- Verify your Gemini API key is correct
- Make sure you're using the API key from Google AI Studio, not the service account key

### CORS errors
- The backend includes CORS middleware, but if you're deploying, make sure to update CORS settings in `server/index.js`

## Testing the Integration

1. Start the backend server: `npm run server`
2. Start the frontend: `npm start`
3. Use the voice interface in the app
4. Check the browser console and server logs for any errors

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive configuration
- Application Default Credentials (ADC) is more secure than service account keys
- For production deployments, consider using Workload Identity or other secure authentication methods
- Rotate API keys regularly
- Use least-privilege IAM roles for your user account

