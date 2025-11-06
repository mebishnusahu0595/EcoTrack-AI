import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Required for browser usage
});

/**
 * Generate AI-powered sustainability suggestions
 * @param {Object} userData - User's eco data
 * @param {number} userData.ecoScore - User's current eco score
 * @param {number} userData.waterSaved - Total water saved
 * @param {number} userData.carbonReduced - Total carbon reduced
 * @param {Array} userData.recentActivities - Recent user activities
 * @returns {Promise<string>} AI-generated suggestions
 */
export async function generateAISuggestions(userData) {
  try {
    const prompt = `You are EcoTwin, an AI sustainability coach. Based on the user's data:
- Eco Score: ${userData.ecoScore}/100
- Water Saved: ${userData.waterSaved}L
- Carbon Reduced: ${userData.carbonReduced}kg CO2
- Recent Activities: ${userData.recentActivities.join(", ")}

Provide 3-5 personalized, actionable sustainability tips to help them improve. Be encouraging and specific. Keep it concise and practical.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are EcoTwin, a friendly and knowledgeable AI sustainability coach. You provide personalized, actionable advice to help people reduce their environmental impact. Be encouraging, specific, and practical."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false
    });

    return chatCompletion.choices[0]?.message?.content || "Keep up the great work on your sustainability journey!";
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    throw error;
  }
}

/**
 * Generate motivational message based on user's progress
 * @param {Object} userData - User's eco data
 * @returns {Promise<string>} AI-generated motivation
 */
export async function generateMotivation(userData) {
  try {
    const prompt = `User's sustainability stats:
- Eco Score: ${userData.ecoScore}/100
- Water Saved: ${userData.waterSaved}L
- Carbon Reduced: ${userData.carbonReduced}kg CO2
- Days Active: ${userData.daysActive}

Generate a short, encouraging motivational message (2-3 sentences) celebrating their progress and inspiring continued action.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are EcoTwin, an encouraging sustainability coach. Create brief, uplifting messages that celebrate user achievements and inspire continued environmental action."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 1.2,
      max_tokens: 256,
      top_p: 1,
      stream: false
    });

    return chatCompletion.choices[0]?.message?.content || "You're making a real difference! 🌱";
  } catch (error) {
    console.error("Error generating motivation:", error);
    throw error;
  }
}

/**
 * Get AI analysis of user's weekly performance
 * @param {Object} weeklyData - Weekly statistics
 * @returns {Promise<string>} AI-generated analysis
 */
export async function analyzeWeeklyPerformance(weeklyData) {
  try {
    const prompt = `Analyze this week's sustainability performance:
- Total Water Saved: ${weeklyData.totalWater}L
- Total Carbon Reduced: ${weeklyData.totalCarbon}kg CO2
- Active Days: ${weeklyData.activeDays}/7
- Trend: ${weeklyData.trend}

Provide a brief analysis (3-4 sentences) highlighting strengths, areas for improvement, and one specific action they can take next week.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are EcoTwin, an insightful sustainability analyst. Provide constructive, data-driven feedback on environmental performance with specific recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      max_tokens: 512,
      top_p: 1,
      stream: false
    });

    return chatCompletion.choices[0]?.message?.content || "You're on the right track! Keep tracking your impact.";
  } catch (error) {
    console.error("Error analyzing performance:", error);
    throw error;
  }
}

/**
 * Generate streaming response for chat-based interactions
 * @param {string} userMessage - User's question or message
 * @param {Object} context - Additional context about user
 * @returns {AsyncIterator} Stream of response chunks
 */
export async function* streamAIResponse(userMessage, context = {}) {
  try {
    const systemPrompt = `You are EcoTwin, the AI companion for EcoTrack. Help users with sustainability questions and provide guidance on water conservation, carbon reduction, and eco-friendly living. 

User Context:
- Eco Score: ${context.ecoScore || "Unknown"}
- Water Saved: ${context.waterSaved || 0}L
- Carbon Reduced: ${context.carbonReduced || 0}kg CO2`;

    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("Error streaming AI response:", error);
    yield "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

export default {
  generateAISuggestions,
  generateMotivation,
  analyzeWeeklyPerformance,
  streamAIResponse
};
