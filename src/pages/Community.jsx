import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Medal, ThumbsUp, MessageCircle, Share2, TrendingUp, Users, Droplet, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import localStorageService from '../services/localStorage';

function Community() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    // Load leaderboard - only real users
    let leaderboardData = await localStorageService.getDocs('leaderboard');
    
    // Calculate scores for all users based on their actual logs
    const users = await localStorageService.getItem('users') || [];
    const waterLogs = await localStorageService.getDocs('waterLogs');
    const carbonLogs = await localStorageService.getDocs('carbonLogs');
    
    leaderboardData = users.filter(u => !u.isGuest).map(user => {
      const userWaterLogs = waterLogs.filter(log => log.userId === user.uid);
      const userCarbonLogs = carbonLogs.filter(log => log.userId === user.uid);
      
      const waterSaved = Math.max(0, 1050 - userWaterLogs.reduce((sum, log) => sum + (log.liters || 0), 0));
      const carbonReduced = Math.max(0, 70 - userCarbonLogs.reduce((sum, log) => sum + (log.co2kg || 0), 0));
      
      const ecoScore = Math.min(100, Math.max(0, Math.round(
        (waterSaved / 10) + (carbonReduced * 2)
      )));
      
      // Award badges based on performance
      const badges = [];
      if (waterSaved > 200) badges.push('Water Saver');
      if (carbonReduced > 15) badges.push('Carbon Neutral');
      if (ecoScore > 80) badges.push('Eco Hero');
      
      return {
        ...user,
        ecoScore,
        waterSaved: Math.round(waterSaved),
        carbonReduced: Math.round(carbonReduced),
        badges
      };
    });
    
    setLeaderboard(leaderboardData.sort((a, b) => b.ecoScore - a.ecoScore).slice(0, 10));

    // Load community posts - only real posts
    let postsData = await localStorageService.getDocs('communityPosts');
    setPosts(postsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim() || !currentUser) return;

    const post = {
      author: currentUser.displayName || currentUser.email,
      content: newPost,
      avatar: '🌱',
      likes: 0,
      comments: 0,
      userId: currentUser.uid,
      timestamp: new Date().toISOString()
    };

    await localStorageService.addDoc('communityPosts', post);
    setNewPost('');
    loadCommunityData();
  };

  const handleLike = async (index) => {
    const post = posts[index];
    const updatedPost = {
      ...post,
      likes: (post.likes || 0) + 1
    };
    await localStorageService.updateDoc('communityPosts', post.id, updatedPost);
    loadCommunityData();
  };

  const badgeIcons = {
    'Water Saver': { icon: Droplet, color: 'text-eco-blue-600', bg: 'bg-eco-blue-100 dark:bg-eco-blue-900' },
    'Carbon Neutral': { icon: Leaf, color: 'text-eco-green-600', bg: 'bg-eco-green-100 dark:bg-eco-green-900' },
    'Eco Hero': { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900' },
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Medal className="w-8 h-8 text-orange-600" />;
    return <span className="text-2xl font-bold text-gray-400">#{rank}</span>;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Community Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with eco-warriors and celebrate sustainability together! 🌍
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center space-x-2 ${
              activeTab === 'leaderboard'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center space-x-2 ${
              activeTab === 'feed'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Community Feed</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'leaderboard' ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Top 3 Podium */}
                <div className="lg:col-span-3">
                  <div className="grid md:grid-cols-3 gap-4">
                    {leaderboard.slice(0, 3).map((user, index) => (
                      <motion.div
                        key={index}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`card text-center ${
                          index === 0
                            ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 md:order-2'
                            : index === 1
                            ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 md:order-1'
                            : 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 md:order-3'
                        }`}
                      >
                        <div className="mb-4">
                          {getMedalIcon(index + 1)}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{user.displayName || user.email}</h3>
                        <div className="text-3xl font-bold text-eco-green-600 mb-2">
                          {user.ecoScore}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Eco Score</p>
                        
                        <div className="flex justify-center gap-2 flex-wrap">
                          {user.badges.map((badge, i) => {
                            const badgeInfo = badgeIcons[badge];
                            const BadgeIcon = badgeInfo.icon;
                            return (
                              <div
                                key={i}
                                className={`${badgeInfo.bg} ${badgeInfo.color} px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1`}
                              >
                                <BadgeIcon className="w-3 h-3" />
                                <span>{badge}</span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Leaderboard */}
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Top Eco-Savers</h2>
                <div className="space-y-2">
                  {leaderboard.map((user, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md ${
                        user.uid === currentUser?.uid
                          ? 'bg-eco-green-100 dark:bg-eco-green-900 border-2 border-eco-green-500'
                          : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 text-center font-bold text-gray-600 dark:text-gray-400">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {user.displayName || user.email}
                            {user.uid === currentUser?.uid && ' (You)'}
                          </h3>
                          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <span className="flex items-center space-x-1">
                              <Droplet className="w-3 h-3" />
                              <span>{user.waterSaved}L saved</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Leaf className="w-3 h-3" />
                              <span>{user.carbonReduced}kg reduced</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-eco-green-600">
                          {user.ecoScore}
                        </div>
                        <div className="text-xs text-gray-500">score</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="feed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Create Post */}
              <div className="card mb-6">
                <h2 className="text-xl font-bold mb-4">Share Your Eco Journey</h2>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your eco-tips, progress, or achievements with the community..."
                  className="input-field resize-none"
                  rows="3"
                />
                <button
                  onClick={handlePostSubmit}
                  disabled={!newPost.trim()}
                  className="btn-primary mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>

              {/* Posts Feed */}
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl">{post.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold">{post.author}</h3>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(post.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {post.content}
                        </p>
                        <div className="flex items-center space-x-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLike(index)}
                            className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-eco-green-600 transition-colors"
                          >
                            <ThumbsUp className="w-5 h-5" />
                            <span className="text-sm font-medium">{post.likes}</span>
                          </motion.button>
                          <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-eco-blue-600 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors">
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Community;
