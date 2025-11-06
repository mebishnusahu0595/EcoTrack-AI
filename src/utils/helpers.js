// Utility functions for EcoTrack AI

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};

export const calculateEcoScore = (waterUsage, carbonFootprint) => {
  const avgWater = 150; // daily target in liters
  const avgCarbon = 10; // daily target in kg CO2
  
  const waterScore = Math.max(0, 50 - (waterUsage - avgWater) / 2);
  const carbonScore = Math.max(0, 50 - (carbonFootprint - avgCarbon) * 2);
  
  return Math.min(100, Math.max(0, Math.round(waterScore + carbonScore)));
};

export const getEcoLevel = (score) => {
  if (score <= 30) return { level: 'Beginner', color: 'red' };
  if (score <= 70) return { level: 'Intermediate', color: 'yellow' };
  return { level: 'Expert', color: 'green' };
};

export const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
};

export const generateShareText = (stats) => {
  return `I'm tracking my eco-footprint with EcoTrack AI! 🌍
💧 Water saved: ${stats.waterSaved}L
🌱 Carbon reduced: ${stats.carbonReduced}kg CO₂
🏆 Eco Score: ${stats.ecoScore}/100

Join me in building a sustainable future!`;
};

export const downloadAsJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
