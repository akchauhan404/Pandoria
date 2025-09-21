const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const OpenAI = require('openai');
require('dotenv').config();
// Helper function to extract JSON from a string that might contain extra text
function extractJson(str) {
  try {
    const jsonMatch = str.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    } else {
      // Fallback: try to parse the whole string if no markdown code block is found
      return JSON.parse(str);
    }
  } catch (e) {
    console.error("Failed to extract or parse JSON:", e);
    return null;
  }
}


const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// ADD YOUR OPENAI API KEY HERE
// ============================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Make sure this line exists and is uncommented
const HF_API_TOKEN = process.env.HF_API_TOKEN; // And this one too

if (!GEMINI_API_KEY || !HF_API_TOKEN) {
    console.error("FATAL ERROR: API keys are not configured in the .env file.");
    process.exit(1); // This stops the server from running without keys
  }
// ============================================

// Initialize gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// Initialize Hugging Face Inference client
const { HfInference } = require("@huggingface/inference");
const HF = new HfInference(HF_API_TOKEN);
const HF_IMAGE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"; //

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'AI Storyteller API',
    timestamp: new Date().toISOString()
  });
});

// Generate story endpoint
app.post('/api/generate-story', async (req, res) => {
  try {
    const { story_idea, genre = 'fantasy', tone = 'lighthearted', target_audience = 'general' } = req.body;
    
    if (!story_idea) {
      return res.status(400).json({ error: 'Story idea is required' });
    }

    const storyPrompt = `
Create a cohesive narrative story based on this idea: "${story_idea}"

Requirements:
- Genre: ${genre}
- Tone: ${tone}
- Target audience: ${target_audience}
- Structure the story into exactly 4 scenes: Introduction/Setting, Rising Action, Climax, Resolution
- Each scene should be 2-3 paragraphs long
- Make the story engaging and complete
- Ensure smooth transitions between scenes

Format your entire response as a single, valid JSON object. DO NOT include any other text, explanations, or markdown outside the JSON. The JSON structure must be exactly as follows:
{{
    "title": "Story Title",
    "scenes": [
        {{
            "scene_number": 1,
            "scene_title": "Introduction",
            "content": "Scene content here...",
            "image_prompt": "Detailed description for image generation"
        }},
        {{
            "scene_number": 2,
            "scene_title": "Rising Action",
            "content": "Scene content here...",
            "image_prompt": "Detailed description for image generation"
        }},
        {{
            "scene_number": 3,
            "scene_title": "Climax",
            "content": "Scene content here...",
            "image_prompt": "Detailed description for image generation"
        }},
        {{
            "scene_number": 4,
            "scene_title": "Resolution",
            "content": "Scene content here...",
            "image_prompt": "Detailed description for image generation"

    }
  ]
}`;

const result = await geminiModel.generateContent({
  contents: [{
    role: "user",
    parts: [{ text: storyPrompt }]
  }],
  generationConfig: {
    temperature: 0.8,
    maxOutputTokens: 2000,
  },
});
const response = result.response;
const storyContent = response.text();
    
const storyData = extractJson(storyContent);
if (storyData) {
  res.json(storyData);
} else {
  // Fallback if JSON parsing fails even with extraction
  const fallbackData = {
    title: "Generated Story",
    scenes: [
      {
        scene_number: 1,
        scene_title: "Complete Story",
        content: storyContent,
        image_prompt: `Illustration of ${story_idea}`
      }
    ]
  };
  res.json(fallbackData);
}


  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ error: `Failed to generate story: ${error.message}` });
  }
});

// Generate image endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { image_prompt, art_style = 'realistic' } = req.body;
    
    if (!image_prompt) {
      return res.status(400).json({ error: 'Image prompt is required' });
    }

    const enhancedPrompt = `${image_prompt}, ${art_style} style, high quality, detailed, storybook illustration`;

    const imageResponse = await HF.textToImage({
      model: HF_IMAGE_MODEL,
      inputs: enhancedPrompt,
      parameters: {
        width: 1024,
        height: 1024,
      },
    });

    // Convert ArrayBuffer to base64
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const imageData = buffer.toString("base64");

    res.json({
      image_data: imageData,
      prompt_used: enhancedPrompt
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: `Failed to generate image: ${error.message}` });
  }
});

// Generate complete story with images
app.post('/api/generate-complete-story', async (req, res) => {
  try {
    const { 
      story_idea, 
      genre = 'fantasy', 
      tone = 'lighthearted', 
      target_audience = 'general',
      art_style = 'realistic'
    } = req.body;
    
    if (!story_idea) {
      return res.status(400).json({ error: 'Story idea is required' });
    }

    // Generate story first
    const storyPrompt = `
Create a cohesive narrative story based on this idea: "${story_idea}"

Requirements:
- Genre: ${genre}
- Tone: ${tone}
- Target audience: ${target_audience}
- Structure the story into exactly 4 scenes: Introduction/Setting, Rising Action, Climax, Resolution
- Each scene should be 2-3 paragraphs long
- Make the story engaging and complete
- Ensure smooth transitions between scenes

Format your response as a JSON object with this structure:
{{
    "title": "Story Title",
    "scenes": [
        {{
            "scene_number": 1,
            "scene_title": "Introduction",
            "content": "Scene content here...",
            "image_prompt": "Detailed description for image generation"
        }},
        {{
            "scene_number": 2,
            "scene_title": "Rising Action",
            "content": "Scene content here...",
            "image_prompt": "Detailed description for image generation"
        }},
        {{
            "scene_number": 3,
            "scene_title": "Climax",
            "content": "Scene content here...",
            "image_prompt": "Detailed description for image generation"
        }},
        {{
            "scene_number": 4,
            "scene_title": "Resolution",
            "content": "Scene content here...",
            "image_prompt": "Detailed description for image generation"
    }
  ]
}`;
console.log("Attempting to generate story with Gemini...");
const storyResult = await geminiModel.generateContent({
  contents: [{
    role: "user",
    parts: [{ text: storyPrompt }]
  }],
  generationConfig: {
    temperature: 0.8,
    maxOutputTokens: 2000,
  },
});
const storyResponse = storyResult.response;
const storyContent = storyResponse.text();
console.log("Gemini raw story content received:", storyContent);
    let storyData;
    try {
      storyData = extractJson(storyContent);
      if (!storyData) {
        throw new Error("Could not extract valid JSON from Gemini response.");
      }
    } catch (parseError) {
      console.error("JSON extraction/parsing error:", parseError);
      return res.status(500).json({ error: `Failed to parse story data: ${parseError.message}` });
    }

    // Generate images for each scene
    const imagePromises = storyData.scenes.map(async (scene, index) => {
      try {
        const imagePrompt = scene.image_prompt;
        if (imagePrompt) {
          const enhancedPrompt = `${imagePrompt}, ${art_style} style, high quality, detailed, storybook illustration`;
          console.log(`Attempting to generate image for scene ${scene.scene_number} with prompt: ${enhancedPrompt}`);
          const imageResponse = await HF.textToImage({
            model: HF_IMAGE_MODEL,
            inputs: enhancedPrompt,
            parameters: {
              width: 1024,
              height: 1024,
            },
          });

          const buffer = Buffer.from(await imageResponse.arrayBuffer());
          scene.image_data = buffer.toString("base64");
          scene.enhanced_prompt = enhancedPrompt;
        } else {
          scene.image_data = null;
          scene.enhanced_prompt = null;
        }
        return scene;
      } catch (imgError) {
        console.error(`Failed to generate image for scene ${scene.scene_number}:`, imgError);
        scene.image_data = null;
        scene.enhanced_prompt = null;
        return scene;
      }
    });

    // Wait for all images to be generated
    await Promise.all(imagePromises);

    res.json(storyData);

  } catch (error) {
    console.error('Complete story generation error:', error);
    res.status(500).json({ error: `Failed to generate complete story: ${error.message}` });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI Storyteller API server running on http://0.0.0.0:${PORT}`);
  console.log(`📚 Available endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   POST /api/generate-story - Generate story only`);
  console.log(`   POST /api/generate-image - Generate image only`);
  console.log(`   POST /api/generate-complete-story - Generate story with images`);
});

module.exports = app;

