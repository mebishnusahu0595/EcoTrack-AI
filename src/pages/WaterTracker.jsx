import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Droplet, Play, Pause, Save, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import localStorageService from '../services/localStorage';

// Simple water drop animation data
const waterDropAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Water Drop",
  ddd: 0,
  assets: [],
  layers: [{
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: "Drop",
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 1, k: [{ t: 0, s: [50, 20, 0] }, { t: 60, s: [50, 80, 0] }] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] }
    },
    ao: 0,
    shapes: [{
      ty: "gr",
      it: [{
        ty: "el",
        p: { a: 0, k: [0, 0] },
        s: { a: 0, k: [20, 20] }
      }, {
        ty: "fl",
        c: { a: 0, k: [0.2, 0.6, 0.9, 1] },
        o: { a: 0, k: 100 }
      }],
      nm: "Drop Shape"
    }],
    ip: 0,
    op: 60,
    st: 0
  }]
};

function WaterTracker() {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [duration, setDuration] = useState('');
  const [liters, setLiters] = useState(0);
  const [savedMessage, setSavedMessage] = useState('');
  const { currentUser } = useAuth();
  
  // GreenPulse Mode
  const [greenPulseActive, setGreenPulseActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [flowRate, setFlowRate] = useState(10); // L/min
  const [pipeSpeed, setPipeSpeed] = useState(5); // m/s
  const [pipeDiameter, setPipeDiameter] = useState(0.015); // meters
  const timerRef = useRef(null);

  const activities = [
    { value: 'bathing', label: 'Bathing', avgLiters: 80 },
    { value: 'washing', label: 'Washing Dishes', avgLiters: 30 },
    { value: 'cooking', label: 'Cooking', avgLiters: 15 },
    { value: 'cleaning', label: 'Cleaning', avgLiters: 25 },
    { value: 'gardening', label: 'Gardening', avgLiters: 50 },
  ];

  useEffect(() => {
    if (selectedActivity && duration) {
      const activity = activities.find(a => a.value === selectedActivity);
      const calculated = (activity.avgLiters / 10) * parseFloat(duration);
      setLiters(Math.round(calculated));
    }
  }, [selectedActivity, duration]);

  useEffect(() => {
    if (greenPulseActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [greenPulseActive]);

  // Calculate flow rate from pipe parameters
  useEffect(() => {
    const area = Math.PI * Math.pow(pipeDiameter / 2, 2);
    const flow = pipeSpeed * area * 60000; // Convert to L/min
    setFlowRate(Math.round(flow * 10) / 10);
  }, [pipeSpeed, pipeDiameter]);

  const greenPulseLiters = Math.round((flowRate * timerSeconds) / 60);

  const getAlertLevel = (liters) => {
    if (liters >= 30) return { level: 'red', message: 'CRITICAL! Stop water usage!', icon: AlertTriangle };
    if (liters >= 20) return { level: 'yellow', message: 'Warning: High water usage', icon: AlertTriangle };
    if (liters >= 10) return { level: 'green', message: 'Good! Moderate usage', icon: CheckCircle };
    return { level: 'none', message: '', icon: null };
  };

  const alert = getAlertLevel(greenPulseActive ? greenPulseLiters : liters);

  const handleSave = async () => {
    const logData = {
      activity: selectedActivity,
      duration: parseFloat(duration),
      liters: liters,
      userId: currentUser?.uid || 'guest'
    };

    await localStorageService.addDoc('waterLogs', logData);
    setSavedMessage('Water usage logged successfully! 💧');
    setTimeout(() => setSavedMessage(''), 3000);
    
    // Reset form
    setSelectedActivity('');
    setDuration('');
    setLiters(0);
  };

  const handleGreenPulseSave = async () => {
    const logData = {
      activity: 'greenpulse',
      duration: timerSeconds,
      liters: greenPulseLiters,
      flowRate: flowRate,
      userId: currentUser?.uid || 'guest'
    };

    await localStorageService.addDoc('waterLogs', logData);
    setSavedMessage('GreenPulse session logged successfully! 💧');
    setTimeout(() => setSavedMessage(''), 3000);
    
    // Reset
    setGreenPulseActive(false);
    setTimerSeconds(0);
  };

  const toggleGreenPulse = () => {
    if (greenPulseActive && greenPulseLiters >= 30) {
      // Force stop at 30L
      setGreenPulseActive(false);
      alert('Water flow stopped at 30L limit!');
    } else {
      setGreenPulseActive(!greenPulseActive);
      if (!greenPulseActive) {
        setTimerSeconds(0);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-eco-blue-600 to-eco-blue-400 bg-clip-text text-transparent">
            Water Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your water usage and save every drop 💧
          </p>
        </div>

        {/* Animated Water Tap */}
        <motion.div
          className="flex justify-center mb-8"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-32 h-32">
            <Lottie animationData={waterDropAnimation} loop={true} />
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setGreenPulseActive(false);
              setTimerSeconds(0);
            }}
            className={`px-6 py-3 font-semibold transition-colors ${
              !greenPulseActive
                ? 'text-eco-blue-600 border-b-2 border-eco-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Standard Mode
          </button>
          <button
            onClick={() => {
              setGreenPulseActive(true);
              setTimerSeconds(0);
            }}
            className={`px-6 py-3 font-semibold transition-colors ${
              greenPulseActive
                ? 'text-eco-green-600 border-b-2 border-eco-green-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            GreenPulse Mode 🌊
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!greenPulseActive ? (
            /* Standard Mode */
            <motion.div
              key="standard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="card"
            >
              <h2 className="text-2xl font-semibold mb-6">Log Water Activity</h2>

              <div className="space-y-4">
                {/* Activity Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Activity
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {activities.map((activity) => (
                      <motion.button
                        key={activity.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedActivity(activity.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedActivity === activity.value
                            ? 'border-eco-blue-500 bg-eco-blue-50 dark:bg-eco-blue-900'
                            : 'border-gray-200 dark:border-gray-700 hover:border-eco-blue-300'
                        }`}
                      >
                        <p className="font-semibold">{activity.label}</p>
                        <p className="text-xs text-gray-500 mt-1">~{activity.avgLiters}L</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Duration Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="input-field"
                    placeholder="Enter duration in minutes"
                  />
                </div>

                {/* Calculated Liters */}
                {liters > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-eco-blue-50 dark:bg-eco-blue-900 p-6 rounded-lg text-center"
                  >
                    <p className="text-sm text-eco-blue-700 dark:text-eco-blue-300 mb-2">
                      Estimated Water Usage
                    </p>
                    <p className="text-5xl font-bold text-eco-blue-600 dark:text-eco-blue-400">
                      {liters}<span className="text-2xl ml-2">Liters</span>
                    </p>
                  </motion.div>
                )}

                {/* Alert */}
                {alert.level !== 'none' && liters > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center space-x-3 p-4 rounded-lg ${
                      alert.level === 'red'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : alert.level === 'yellow'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}
                  >
                    <alert.icon className="w-6 h-6" />
                    <p className="font-semibold">{alert.message}</p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={!selectedActivity || !duration || liters === 0}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Log</span>
                  </button>
                  
                  <Link to="/report" className="btn-secondary flex items-center justify-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Report Issue</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            /* GreenPulse Mode */
            <motion.div
              key="greenpulse"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card"
            >
              <h2 className="text-2xl font-semibold mb-6 text-eco-green-600">
                GreenPulse Mode 🌊
              </h2>

              {/* Pipe Configuration */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pipe Speed (m/s)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={pipeSpeed}
                    onChange={(e) => setPipeSpeed(parseFloat(e.target.value))}
                    className="input-field"
                    disabled={greenPulseActive}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pipe Diameter (m)
                  </label>
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={pipeDiameter}
                    onChange={(e) => setPipeDiameter(parseFloat(e.target.value))}
                    className="input-field"
                    disabled={greenPulseActive}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-eco-green-50 to-eco-blue-50 dark:from-eco-green-900 dark:to-eco-blue-900 p-6 rounded-lg mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Calculated Flow Rate
                </p>
                <p className="text-3xl font-bold text-eco-green-600 dark:text-eco-green-400">
                  {flowRate} L/min
                </p>
              </div>

              {/* Timer and Water Display */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <Clock className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  <p className="text-5xl font-bold font-mono">
                    {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                  </p>
                </div>

                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="bg-eco-blue-100 dark:bg-eco-blue-800 p-8 rounded-xl inline-block"
                >
                  <Droplet className="w-16 h-16 text-eco-blue-600 dark:text-eco-blue-400 mx-auto mb-2" />
                  <p className="text-6xl font-bold text-eco-blue-700 dark:text-eco-blue-300">
                    {greenPulseLiters}<span className="text-3xl ml-2">L</span>
                  </p>
                </motion.div>
              </div>

              {/* Alert */}
              {alert.level !== 'none' && greenPulseLiters > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center space-x-3 p-4 rounded-lg mb-6 ${
                    alert.level === 'red'
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : alert.level === 'yellow'
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}
                >
                  <alert.icon className="w-6 h-6" />
                  <p className="font-semibold">{alert.message}</p>
                </motion.div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleGreenPulse}
                  disabled={greenPulseLiters >= 30}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-lg font-semibold text-white transition-all ${
                    greenPulseActive
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-eco-green-500 hover:bg-eco-green-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {greenPulseActive ? (
                    <>
                      <Pause className="w-6 h-6" />
                      <span>Stop Flow</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      <span>Start Flow</span>
                    </>
                  )}
                </motion.button>

                {timerSeconds > 0 && !greenPulseActive && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={handleGreenPulseSave}
                    className="btn-primary flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Session</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {savedMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-eco-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{savedMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default WaterTracker;
