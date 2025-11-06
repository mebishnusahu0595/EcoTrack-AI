// Script to clear fake community data from localStorage
const clearData = () => {
  // Clear community posts
  localStorage.removeItem('ecotrack_communityPosts');
  
  // Clear leaderboard
  localStorage.removeItem('ecotrack_leaderboard');
  
  console.log('✅ Community fake data cleared!');
  console.log('Refresh the page to see clean community.');
};

clearData();
