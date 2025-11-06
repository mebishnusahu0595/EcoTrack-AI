import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingDown, Droplet, Leaf, Lightbulb, Loader2 } from 'lucide-react';
import EcoTwinAvatar from '../components/EcoTwinAvatar';
import { useAuth } from '../context/AuthContext';
import localStorageService from '../services/localStorage';
import { generateAISuggestions, generateMotivation } from '../services/groqService';

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
  const { currentUser } = useAuth();

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

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

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Eco Twin & Score */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="card text-center"
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

          {/* Stats */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="card bg-gradient-to-r from-eco-blue-50 to-eco-blue-100 dark:from-eco-blue-900 dark:to-eco-blue-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-eco-blue-700 dark:text-eco-blue-300 font-medium mb-1">
                    Water Saved This Week
                  </p>
                  <p className="text-4xl font-bold text-eco-blue-600 dark:text-eco-blue-400">
                    {Math.round(stats.waterSaved)}L
                  </p>
                  <p className="text-xs text-eco-blue-600 dark:text-eco-blue-400 mt-1">
                    vs. average consumption
                  </p>
                </div>
                <TrendingDown className="w-16 h-16 text-eco-blue-500 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="card bg-gradient-to-r from-eco-green-50 to-eco-green-100 dark:from-eco-green-900 dark:to-eco-green-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-eco-green-700 dark:text-eco-green-300 font-medium mb-1">
                    Carbon Reduced This Week
                  </p>
                  <p className="text-4xl font-bold text-eco-green-600 dark:text-eco-green-400">
                    {stats.carbonReduced.toFixed(1)}kg
                  </p>
                  <p className="text-xs text-eco-green-600 dark:text-eco-green-400 mt-1">
                    CO₂ emissions prevented
                  </p>
                </div>
                <Leaf className="w-16 h-16 text-eco-green-500 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">
                    Tracking Streak
                  </p>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.weekProgress}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    logs this week
                  </p>
                </div>
                <Sparkles className="w-16 h-16 text-purple-500 opacity-50" />
              </div>
            </motion.div>
          </div>
        </div>

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
      </motion.div>
    </div>
  );
}

export default AICoach;
