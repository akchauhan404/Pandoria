# 🔑 API Key Setup Guide

## ⚠️ REQUIRED: Add Your OpenAI API Key

Before you can use the AI Storyteller application, you **MUST** add your OpenAI API key.

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the generated key (starts with `sk-`)

### Step 2: Add the API Key to the Application

**File to Edit**: `backend/server.js`

**Line to Change**: Line 12

**Before:**
```javascript
const OPENAI_API_KEY = "your-openai-api-key-here"; // <-- REPLACE THIS WITH YOUR ACTUAL API KEY
```

**After:**
```javascript
const OPENAI_API_KEY = "sk-your-actual-api-key-here"; // <-- REPLACE THIS WITH YOUR ACTUAL API KEY
```

### Step 3: Save and Restart

1. Save the `backend/server.js` file
2. Restart the backend server if it's already running
3. The application will now be able to generate stories and images

## 💡 Alternative: Environment Variables

You can also use environment variables for better security:

1. Create a `.env` file in the `backend` directory:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

2. Update `backend/server.js` line 12 to:
   ```javascript
   const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "your-openai-api-key-here";
   ```

## 🚨 Important Notes

- **Keep your API key secret** - Never commit it to version control
- **OpenAI charges for usage** - Monitor your usage at [OpenAI Usage](https://platform.openai.com/usage)
- **DALL-E 3 requires a paid account** - Free tier may not include image generation
- **Rate limits apply** - OpenAI has rate limits for API calls

## 🧪 Testing Your Setup

1. Start both servers:
   ```bash
   # Terminal 1
   cd backend && npm start
   
   # Terminal 2  
   cd frontend && pnpm run dev --host
   ```

2. Open `http://localhost:5173`

3. Enter a story idea and click "Generate Story"

4. If you see "Failed to generate story" error, check:
   - API key is correctly set
   - You have OpenAI credits
   - Backend server is running

## 📞 Need Help?

If you're having trouble:

1. Check the console logs in both terminal windows
2. Verify your API key is valid at [OpenAI API Keys](https://platform.openai.com/api-keys)
3. Check your OpenAI account billing and usage
4. Read the full README.md for detailed troubleshooting

---

**Once your API key is set up, you're ready to create amazing AI-powered stories! ✨**

