import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Edit2, 
  Save, 
  X, 
  Trophy,
  Droplet,
  Leaf,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import localStorageService from '../services/localStorage';
import EcoTwinAvatar from '../components/EcoTwinAvatar';

function Profile() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: ''
  });
  const [stats, setStats] = useState({
    ecoScore: 0,
    waterScore: 0,
    carbonScore: 0,
    totalWaterSaved: 0,
    totalCarbonReduced: 0,
    badges: [],
    daysActive: 0
  });
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || ''
      });
      loadUserStats();
    }
  }, [currentUser]);

  const loadUserStats = async () => {
    if (!currentUser) return;

    const waterLogs = await localStorageService.getDocs('waterLogs');
    const carbonLogs = await localStorageService.getDocs('carbonLogs');

    const userWaterLogs = waterLogs.filter(log => log.userId === currentUser.uid);
    const userCarbonLogs = carbonLogs.filter(log => log.userId === currentUser.uid);

    // Calculate total water saved
    const totalWaterUsed = userWaterLogs.reduce((sum, log) => sum + (log.liters || 0), 0);
    const avgWaterTarget = 1050; // weekly target
    const totalWaterSaved = Math.max(0, avgWaterTarget - totalWaterUsed);

    // Calculate total carbon reduced
    const totalCarbonEmitted = userCarbonLogs.reduce((sum, log) => sum + (log.co2kg || 0), 0);
    const avgCarbonTarget = 70; // weekly target
    const totalCarbonReduced = Math.max(0, avgCarbonTarget - totalCarbonEmitted);

    // Calculate individual scores
    const waterScore = Math.min(100, Math.max(0, Math.round((totalWaterSaved / avgWaterTarget) * 100)));
    const carbonScore = Math.min(100, Math.max(0, Math.round((totalCarbonReduced / avgCarbonTarget) * 100)));
    
    // Overall eco score
    const ecoScore = Math.round((waterScore + carbonScore) / 2);

    // Calculate active days
    const allLogs = [...userWaterLogs, ...userCarbonLogs];
    const uniqueDays = new Set(
      allLogs.map(log => new Date(log.createdAt).toDateString())
    );
    const daysActive = uniqueDays.size;

    // Badges
    const badges = [];
    if (totalWaterSaved > 200) badges.push('Water Saver');
    if (totalCarbonReduced > 15) badges.push('Carbon Neutral');
    if (ecoScore > 80) badges.push('Eco Hero');
    if (daysActive >= 7) badges.push('Consistent Tracker');

    setStats({
      ecoScore,
      waterScore,
      carbonScore,
      totalWaterSaved: Math.round(totalWaterSaved),
      totalCarbonReduced: Math.round(totalCarbonReduced),
      badges,
      daysActive
    });
  };

  const getScoreColor = (score) => {
    if (score >= 70) return {
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900',
      border: 'border-green-500',
      icon: CheckCircle,
      label: 'Excellent',
      iconColor: 'text-green-500'
    };
    if (score >= 40) return {
      color: 'text-orange-600',
      bg: 'bg-orange-100 dark:bg-orange-900',
      border: 'border-orange-500',
      icon: AlertTriangle,
      label: 'Good',
      iconColor: 'text-orange-500'
    };
    return {
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900',
      border: 'border-red-500',
      icon: AlertCircle,
      label: 'Needs Improvement',
      iconColor: 'text-red-500'
    };
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      displayName: currentUser.displayName || '',
      email: currentUser.email || ''
    });
    setSaveMessage('');
  };

  const handleSave = async () => {
    try {
      // Update user in localStorage
      const users = await localStorageService.getItem('users') || [];
      const userIndex = users.findIndex(u => u.uid === currentUser.uid);
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          displayName: formData.displayName,
          email: formData.email,
          updatedAt: new Date().toISOString()
        };
        
        await localStorageService.setItem('users', users);
        await localStorageService.setItem('currentUser', users[userIndex]);
        
        setSaveMessage('Profile updated successfully! ✓');
        setIsEditing(false);
        
        // Reload page to update context
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage('Failed to update profile. Please try again.');
    }
  };

  const badgeIcons = {
    'Water Saver': { icon: Droplet, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' },
    'Carbon Neutral': { icon: Leaf, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900' },
    'Eco Hero': { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900' },
    'Consistent Tracker': { icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900' }
  };

  const ecoScoreInfo = getScoreColor(stats.ecoScore);
  const waterScoreInfo = getScoreColor(stats.waterScore);
  const carbonScoreInfo = getScoreColor(stats.carbonScore);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-eco-green-600 to-eco-blue-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and view your eco journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Avatar & Basic Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="card text-center"
            >
              <EcoTwinAvatar ecoScore={stats.ecoScore} size="large" />
              
              <div className="mt-6">
                <h2 className="text-2xl font-bold mb-1">
                  {currentUser?.displayName || 'User'}
                </h2>
                <p className="text-gray-500 text-sm mb-4">{currentUser?.email}</p>
                
                {/* Overall Eco Score with Color Indicator */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`${ecoScoreInfo.bg} ${ecoScoreInfo.border} border-2 rounded-lg p-4 mb-4`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <ecoScoreInfo.icon className={`w-6 h-6 ${ecoScoreInfo.iconColor}`} />
                    <span className={`text-sm font-semibold ${ecoScoreInfo.color}`}>
                      {ecoScoreInfo.label}
                    </span>
                  </div>
                  <div className={`text-5xl font-bold ${ecoScoreInfo.color} mb-1`}>
                    {stats.ecoScore}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overall Eco Score</p>
                </motion.div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <Droplet className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="font-bold text-blue-600">{stats.totalWaterSaved}L</p>
                    <p className="text-xs text-gray-500">Saved</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <Leaf className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="font-bold text-green-600">{stats.totalCarbonReduced}kg</p>
                    <p className="text-xs text-gray-500">Reduced</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <Award className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                    <p className="font-bold text-yellow-600">{stats.badges.length}</p>
                    <p className="text-xs text-gray-500">Badges</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="font-bold text-purple-600">{stats.daysActive}</p>
                    <p className="text-xs text-gray-500">Days Active</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Breakdown */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <span>Performance Scores</span>
              </h3>

              <div className="space-y-4">
                {/* Water Score */}
                <div className={`${waterScoreInfo.bg} ${waterScoreInfo.border} border-2 rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Droplet className={`w-5 h-5 ${waterScoreInfo.iconColor}`} />
                      <span className="font-semibold">Water Conservation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <waterScoreInfo.icon className={`w-5 h-5 ${waterScoreInfo.iconColor}`} />
                      <span className={`text-2xl font-bold ${waterScoreInfo.color}`}>
                        {stats.waterScore}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        stats.waterScore >= 70 ? 'bg-green-500' :
                        stats.waterScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stats.waterScore}%` }}
                    />
                  </div>
                  <p className={`text-sm mt-2 ${waterScoreInfo.color} font-medium`}>
                    {waterScoreInfo.label} - {stats.totalWaterSaved}L saved this week
                  </p>
                </div>

                {/* Carbon Score */}
                <div className={`${carbonScoreInfo.bg} ${carbonScoreInfo.border} border-2 rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Leaf className={`w-5 h-5 ${carbonScoreInfo.iconColor}`} />
                      <span className="font-semibold">Carbon Footprint</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <carbonScoreInfo.icon className={`w-5 h-5 ${carbonScoreInfo.iconColor}`} />
                      <span className={`text-2xl font-bold ${carbonScoreInfo.color}`}>
                        {stats.carbonScore}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        stats.carbonScore >= 70 ? 'bg-green-500' :
                        stats.carbonScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stats.carbonScore}%` }}
                    />
                  </div>
                  <p className={`text-sm mt-2 ${carbonScoreInfo.color} font-medium`}>
                    {carbonScoreInfo.label} - {stats.totalCarbonReduced}kg CO₂ reduced
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Edit Profile */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center space-x-2">
                  <User className="w-6 h-6 text-eco-green-600" />
                  <span>Account Information</span>
                </h3>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="input-field"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {currentUser?.displayName || 'Not set'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {currentUser?.email || 'Not set'}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={handleSave}
                      className="btn-primary flex items-center space-x-2 flex-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}

                {saveMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg ${
                      saveMessage.includes('success')
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {saveMessage}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Award className="w-6 h-6 text-yellow-600" />
                <span>Achievements</span>
              </h3>

              {stats.badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {stats.badges.map((badge, index) => {
                    const badgeInfo = badgeIcons[badge];
                    const BadgeIcon = badgeInfo.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className={`${badgeInfo.bg} rounded-lg p-4 text-center`}
                      >
                        <BadgeIcon className={`w-8 h-8 ${badgeInfo.color} mx-auto mb-2`} />
                        <p className={`font-semibold ${badgeInfo.color}`}>{badge}</p>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No badges earned yet. Keep tracking to earn achievements!</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;
