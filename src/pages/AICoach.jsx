import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Loader2, Send, MessageCircle, X } from 'lucide-react';
import EcoTwinAvatar from '../components/EcoTwinAvatar';
import { useAuth } from '../context/AuthContext';
import localStorageService from '../services/localStorage';
import { generateAISuggestions, generateMotivation, streamAIResponse } from '../services/groqService';

function AICoach() {
  const [ecoScore, setEcoScore] = useState(50);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [aiMotivation, setAiMotivation] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    waterSaved: 0,
    carbonReduced: 0,
    weekProgress: 0,
    recentActivities: []
  });
  
  // Chat states
  const [chatOpen, setChatOpen] = useState(true); // Open by default
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const waterLogs = await localStorageService.getDocs('waterLogs');
      const carbonLogs = await localStorageService.getDocs('carbonLogs');

      // Filter for current user only
      const userWaterLogs = waterLogs.filter(log => log.userId === currentUser.uid);
      const userCarbonLogs = carbonLogs.filter(log => log.userId === currentUser.uid);

      // Calculate weekly stats
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weekWaterLogs = userWaterLogs.filter(log => 
        new Date(log.createdAt) >= oneWeekAgo
      );
      const weekCarbonLogs = userCarbonLogs.filter(log => 
        new Date(log.createdAt) >= oneWeekAgo
      );

      const totalWater = weekWaterLogs.reduce((sum, log) => sum + (log.liters || 0), 0);
      const totalCarbon = weekCarbonLogs.reduce((sum, log) => sum + (log.co2kg || 0), 0);

      // Calculate eco score
      const avgWater = 1050; // weekly target
      const avgCarbon = 70; // weekly target
      const waterScore = Math.max(0, 50 - (totalWater - avgWater) / 20);
      const carbonScore = Math.max(0, 50 - (totalCarbon - avgCarbon));
      const calculatedScore = Math.min(100, Math.max(0, Math.round(waterScore + carbonScore)));

      const waterSaved = Math.max(0, avgWater - totalWater);
      const carbonReduced = Math.max(0, avgCarbon - totalCarbon);

      // Recent activities
      const recentActivities = [];
      if (weekWaterLogs.length > 0) recentActivities.push("water tracking");
      if (weekCarbonLogs.length > 0) recentActivities.push("carbon tracking");
      if (calculatedScore > 70) recentActivities.push("maintaining high eco score");

      setEcoScore(calculatedScore);
      setStats({
        waterSaved,
        carbonReduced,
        weekProgress: (weekWaterLogs.length + weekCarbonLogs.length),
        recentActivities
      });

      // Generate AI suggestions and motivation
      await generateAIContent({
        ecoScore: calculatedScore,
        waterSaved,
        carbonReduced,
        recentActivities
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIContent = async (userData) => {
    try {
      // Generate AI suggestions
      const suggestions = await generateAISuggestions(userData);
      setAiSuggestions(suggestions);

      // Generate AI motivation
      const motivation = await generateMotivation({
        ...userData,
        daysActive: userData.weekProgress
      });
      setAiMotivation(motivation);
    } catch (error) {
      console.error("Error generating AI content:", error);
      // Fallback content
      setAiSuggestions("Keep tracking your water and carbon usage to get personalized AI suggestions!");
      setAiMotivation("You're making a difference! Every small action counts. 🌱");
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping) return;

    const userMessage = userInput.trim();
    setUserInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    setIsTyping(true);
    
    try {
      // Create AI message placeholder
      const aiMessageId = Date.now();
      setMessages(prev => [...prev, { role: 'assistant', content: '', id: aiMessageId }]);
      
      let fullResponse = '';
      
      // Stream AI response
      for await (const chunk of streamAIResponse(userMessage, {
        ecoScore,
        waterSaved: stats.waterSaved,
        carbonReduced: stats.carbonReduced
      })) {
        fullResponse += chunk;
        
        // Update the AI message with streaming content
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: fullResponse }
            : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Eco Coach
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized insights to help you live sustainably 🤖
          </p>
        </div>

        {/* Eco Twin & Motivation */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="card text-center mb-8 max-w-md mx-auto"
        >
          <EcoTwinAvatar ecoScore={ecoScore} size="large" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg"
          >
            <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "{aiMotivation}"
            </p>
          </motion.div>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span>AI-Powered Personalized Tips</span>
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Analyzing your eco data with AI...
              </span>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-6">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                  {aiSuggestions}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 card bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-2">Ready to Level Up? 🚀</h3>
          <p className="mb-4">
            Keep tracking your water and carbon footprint to unlock more personalized insights!
          </p>
          <div className="flex justify-center gap-4">
            <a href="/water" className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Track Water
            </a>
            <a href="/carbon" className="bg-white text-pink-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Track Carbon
            </a>
          </div>
        </motion.div>

        {/* AI Chat Button - Floating */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5, type: 'spring' }}
          onClick={() => setChatOpen(!chatOpen)}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {chatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </motion.button>

        {/* AI Chat Window */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed bottom-24 right-8 z-40 w-96 max-w-[calc(100vw-4rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <div>
                    <h3 className="font-bold">EcoTwin AI</h3>
                    <p className="text-xs opacity-90">Your Sustainability Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                    <p className="text-sm">Ask me anything about sustainability!</p>
                    <p className="text-xs mt-2">Try: "How can I reduce my water usage?"</p>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Brain className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                            EcoTwin
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    disabled={isTyping}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isTyping}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default AICoach;
