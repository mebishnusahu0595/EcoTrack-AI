import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Droplet, Leaf, TrendingUp, Award, ArrowRight } from 'lucide-react';
import EcoTwinAvatar from '../components/EcoTwinAvatar';
import { useAuth } from '../context/AuthContext';
import localStorageService from '../services/localStorage';

function HomeDashboard() {
  const [stats, setStats] = useState({
    todayWater: 0,
    todayCarbon: 0,
    ecoScore: 50,
    weeklyWaterData: []
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    loadStats();
  }, [currentUser]);

  const loadStats = async () => {
    if (!currentUser) return;
    
    const waterLogs = await localStorageService.getDocs('waterLogs');
    const carbonLogs = await localStorageService.getDocs('carbonLogs');
    
    // Filter logs for current user only
    const userWaterLogs = waterLogs.filter(log => log.userId === currentUser.uid);
    const userCarbonLogs = carbonLogs.filter(log => log.userId === currentUser.uid);
    
    const today = new Date().toDateString();
    
    // Calculate today's water usage
    const todayWater = userWaterLogs
      .filter(log => new Date(log.createdAt).toDateString() === today)
      .reduce((sum, log) => sum + (log.liters || 0), 0);
    
    // Calculate today's carbon footprint
    const todayCarbon = userCarbonLogs
      .filter(log => new Date(log.createdAt).toDateString() === today)
      .reduce((sum, log) => sum + (log.co2kg || 0), 0);
    
    // Calculate eco score (simplified formula)
    const avgWater = 150; // average daily water usage target
    const avgCarbon = 10; // average daily carbon target
    const waterScore = Math.max(0, 50 - (todayWater - avgWater) / 2);
    const carbonScore = Math.max(0, 50 - (todayCarbon - avgCarbon) * 2);
    const ecoScore = Math.min(100, Math.max(0, Math.round(waterScore + carbonScore)));
    
    // Generate weekly water data for current user
    const weeklyWaterData = generateWeeklyData(userWaterLogs);
    
    setStats({
      todayWater: Math.round(todayWater),
      todayCarbon: todayCarbon.toFixed(1),
      ecoScore,
      weeklyWaterData
    });
  };

  const generateWeeklyData = (logs) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayLogs = logs.filter(log => 
        new Date(log.createdAt).toDateString() === dateStr
      );
      
      const total = dayLogs.reduce((sum, log) => sum + (log.liters || 0), 0);
      
      data.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        liters: Math.round(total)
      });
    }
    
    return data;
  };

  const quickActions = [
    { to: '/water', icon: Droplet, label: 'Track Water', color: 'bg-eco-blue-500' },
    { to: '/carbon', icon: Leaf, label: 'Track Carbon', color: 'bg-eco-green-500' },
    { to: '/coach', icon: TrendingUp, label: 'AI Coach', color: 'bg-purple-500' },
    { to: '/community', icon: Award, label: 'Community', color: 'bg-orange-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-eco-green-600 to-eco-blue-600 bg-clip-text text-transparent">
          Welcome to EcoTrack AI
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your journey to a sustainable lifestyle starts here
        </p>
      </motion.div>

      {/* Eco Twin Avatar Section */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card max-w-md mx-auto mb-8"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Your Eco Twin</h2>
        <EcoTwinAvatar ecoScore={stats.ecoScore} size="large" />
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Keep tracking to help your Eco Twin grow! 🌱
        </p>
      </motion.div>

      {/* Today's Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-eco-blue-50 to-eco-blue-100 dark:from-eco-blue-900 dark:to-eco-blue-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-eco-blue-700 dark:text-eco-blue-300 font-medium">
                Today's Water Usage
              </p>
              <p className="text-4xl font-bold text-eco-blue-800 dark:text-eco-blue-200 mt-2">
                {stats.todayWater}<span className="text-2xl ml-1">L</span>
              </p>
              <p className="text-xs text-eco-blue-600 dark:text-eco-blue-400 mt-1">
                Target: 150L per day
              </p>
            </div>
            <Droplet className="w-16 h-16 text-eco-blue-500 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card bg-gradient-to-br from-eco-green-50 to-eco-green-100 dark:from-eco-green-900 dark:to-eco-green-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-eco-green-700 dark:text-eco-green-300 font-medium">
                Today's Carbon Footprint
              </p>
              <p className="text-4xl font-bold text-eco-green-800 dark:text-eco-green-200 mt-2">
                {stats.todayCarbon}<span className="text-2xl ml-1">kg</span>
              </p>
              <p className="text-xs text-eco-green-600 dark:text-eco-green-400 mt-1">
                CO₂ emissions today
              </p>
            </div>
            <Leaf className="w-16 h-16 text-eco-green-500 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Weekly Water Chart */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Weekly Water Consumption</h2>
        <div className="flex items-end justify-between h-48 space-x-2">
          {stats.weeklyWaterData.map((data, index) => {
            const maxHeight = Math.max(...stats.weeklyWaterData.map(d => d.liters), 1);
            const heightPercent = (data.liters / maxHeight) * 100;
            
            return (
              <motion.div
                key={data.day}
                className="flex-1 flex flex-col items-center"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
              >
                <motion.div
                  className="w-full bg-gradient-to-t from-eco-blue-500 to-eco-blue-300 rounded-t-lg relative"
                  style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                  whileHover={{ scale: 1.05 }}
                  title={`${data.liters}L`}
                >
                  <motion.div
                    className="absolute inset-0 bg-white opacity-0 hover:opacity-20 rounded-t-lg"
                    whileHover={{ opacity: 0.2 }}
                  />
                </motion.div>
                <p className="text-xs mt-2 font-medium text-gray-600 dark:text-gray-400">
                  {data.day}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.liters}L
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to}>
                <motion.div
                  className="card text-center hover:shadow-2xl cursor-pointer"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <div className={`${action.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {action.label}
                  </p>
                  <ArrowRight className="w-4 h-4 mx-auto mt-2 text-gray-400" />
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default HomeDashboard;
