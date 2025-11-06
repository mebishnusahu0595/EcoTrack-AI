import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Zap, UtensilsCrossed, Save, CheckCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import localStorageService from '../services/localStorage';

function CarbonTracker() {
  const [transport, setTransport] = useState({ mode: 'car', distance: 0 });
  const [electricity, setElectricity] = useState(0);
  const [food, setFood] = useState({ type: 'vegetarian', meals: 0 });
  const [totalCO2, setTotalCO2] = useState(0);
  const [savedMessage, setSavedMessage] = useState('');
  const [chartData, setChartData] = useState([]);
  const { currentUser } = useAuth();

  // CO2 emission factors
  const emissionFactors = {
    transport: {
      car: 0.12, // kg CO2 per km
      bike: 0,
      bus: 0.05,
      train: 0.03,
      flight: 0.25
    },
    electricity: 0.5, // kg CO2 per kWh
    food: {
      vegetarian: 1.5, // kg CO2 per meal
      nonVegetarian: 3.0,
      vegan: 1.0
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);

  useEffect(() => {
    calculateTotalCO2();
  }, [transport, electricity, food]);

  const calculateTotalCO2 = () => {
    const transportCO2 = transport.distance * emissionFactors.transport[transport.mode];
    const electricityCO2 = electricity * emissionFactors.electricity;
    const foodCO2 = food.meals * emissionFactors.food[food.type];
    
    setTotalCO2((transportCO2 + electricityCO2 + foodCO2).toFixed(2));
  };

  const loadChartData = async () => {
    const logs = await localStorageService.getDocs('carbonLogs');
    
    // Generate daily data for the last 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayLogs = logs.filter(log => 
        new Date(log.createdAt).toDateString() === dateStr
      );
      
      const total = dayLogs.reduce((sum, log) => sum + (log.co2kg || 0), 0);
      
      data.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        co2: parseFloat(total.toFixed(1)),
        date: dateStr
      });
    }
    
    setChartData(data);
  };

  const handleSave = async () => {
    const logData = {
      transport: {
        mode: transport.mode,
        distance: transport.distance
      },
      electricity,
      food: {
        type: food.type,
        meals: food.meals
      },
      co2kg: parseFloat(totalCO2),
      userId: currentUser?.uid || 'guest'
    };

    await localStorageService.addDoc('carbonLogs', logData);
    setSavedMessage('Carbon footprint logged successfully! 🌱');
    setTimeout(() => setSavedMessage(''), 3000);
    
    // Reset form
    setTransport({ mode: 'car', distance: 0 });
    setElectricity(0);
    setFood({ type: 'vegetarian', meals: 0 });
    
    // Reload chart
    loadChartData();
  };

  const transportModes = [
    { value: 'car', label: '🚗 Car', icon: Car },
    { value: 'bike', label: '🚴 Bike', icon: Car },
    { value: 'bus', label: '🚌 Bus', icon: Car },
    { value: 'train', label: '🚆 Train', icon: Car },
    { value: 'flight', label: '✈️ Flight', icon: Car },
  ];

  const foodTypes = [
    { value: 'vegan', label: '🥗 Vegan' },
    { value: 'vegetarian', label: '🥬 Vegetarian' },
    { value: 'nonVegetarian', label: '🍖 Non-Vegetarian' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-eco-green-600 to-eco-green-400 bg-clip-text text-transparent">
            Carbon Footprint Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Calculate and reduce your daily carbon emissions 🌍
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Transport */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="card"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Car className="w-6 h-6 text-eco-blue-600" />
                <h2 className="text-xl font-semibold">Transportation</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mode of Transport</label>
                  <div className="grid grid-cols-2 gap-2">
                    {transportModes.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setTransport({ ...transport, mode: mode.value })}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          transport.mode === mode.value
                            ? 'border-eco-blue-500 bg-eco-blue-50 dark:bg-eco-blue-900'
                            : 'border-gray-200 dark:border-gray-700 hover:border-eco-blue-300'
                        }`}
                      >
                        <span className="font-medium">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Distance (km)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={transport.distance}
                    onChange={(e) => setTransport({ ...transport, distance: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span>0 km</span>
                    <span className="font-bold text-eco-blue-600">{transport.distance} km</span>
                    <span>100 km</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Electricity */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-semibold">Electricity Usage</h2>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Daily Usage (kWh)</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={electricity}
                  onChange={(e) => setElectricity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>0 kWh</span>
                  <span className="font-bold text-yellow-600">{electricity} kWh</span>
                  <span>50 kWh</span>
                </div>
              </div>
            </motion.div>

            {/* Food */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center space-x-2 mb-4">
                <UtensilsCrossed className="w-6 h-6 text-eco-green-600" />
                <h2 className="text-xl font-semibold">Food Consumption</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Diet Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {foodTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFood({ ...food, type: type.value })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          food.type === type.value
                            ? 'border-eco-green-500 bg-eco-green-50 dark:bg-eco-green-900'
                            : 'border-gray-200 dark:border-gray-700 hover:border-eco-green-300'
                        }`}
                      >
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Number of Meals</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={food.meals}
                    onChange={(e) => setFood({ ...food, meals: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="Enter number of meals"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Total CO2 */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="card bg-gradient-to-br from-eco-green-50 to-eco-blue-50 dark:from-eco-green-900 dark:to-eco-blue-900"
            >
              <h2 className="text-xl font-semibold mb-4 text-center">Your Carbon Footprint</h2>
              
              <motion.div
                className="text-center mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-6xl font-bold text-eco-green-600 dark:text-eco-green-400">
                  {totalCO2}
                </p>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                  kg CO₂
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total emissions today
                </p>
              </motion.div>

              {/* Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">🚗 Transport</span>
                  <span className="font-bold text-eco-blue-600">
                    {(transport.distance * emissionFactors.transport[transport.mode]).toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">⚡ Electricity</span>
                  <span className="font-bold text-yellow-600">
                    {(electricity * emissionFactors.electricity).toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">🍽️ Food</span>
                  <span className="font-bold text-eco-green-600">
                    {(food.meals * emissionFactors.food[food.type]).toFixed(2)} kg
                  </span>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={totalCO2 === '0.00'}
                className="btn-primary w-full mt-6 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>Save Log</span>
              </button>
            </motion.div>

            {/* Chart */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6 text-eco-green-600" />
                <h2 className="text-xl font-semibold">Weekly Emissions</h2>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>

        {/* Success Message */}
        {savedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-eco-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{savedMessage}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default CarbonTracker;
