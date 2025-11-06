// LocalStorage fallback service when Firebase is not configured
class LocalStorageService {
  constructor() {
    this.prefix = 'ecotrack_';
    this.initializeDefaults();
  }

  initializeDefaults() {
    if (!this.getItem('users')) {
      this.setItem('users', []);
    }
    // No default guest user - force login/signup
    if (!this.getItem('waterLogs')) {
      this.setItem('waterLogs', []);
    }
    if (!this.getItem('carbonLogs')) {
      this.setItem('carbonLogs', []);
    }
    if (!this.getItem('reports')) {
      this.setItem('reports', []);
    }
    if (!this.getItem('communityPosts')) {
      this.setItem('communityPosts', []);
    }
    if (!this.getItem('leaderboard')) {
      this.setItem('leaderboard', []);
    }
  }

  getItem(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('LocalStorage getItem error:', error);
      return null;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('LocalStorage setItem error:', error);
      return false;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('LocalStorage removeItem error:', error);
      return false;
    }
  }

  // Firestore-like methods
  async addDoc(collection, data) {
    const items = this.getItem(collection) || [];
    const newItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    this.setItem(collection, items);
    return newItem;
  }

  async getDocs(collection) {
    return this.getItem(collection) || [];
  }

  async getDoc(collection, id) {
    const items = this.getItem(collection) || [];
    return items.find(item => item.id === id);
  }

  async updateDoc(collection, id, data) {
    const items = this.getItem(collection) || [];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      this.setItem(collection, items);
      return items[index];
    }
    return null;
  }

  async deleteDoc(collection, id) {
    const items = this.getItem(collection) || [];
    const filtered = items.filter(item => item.id !== id);
    this.setItem(collection, filtered);
    return true;
  }

  // Auth-like methods
  getCurrentUser() {
    return this.getItem('currentUser');
  }

  async signUp(email, password, name) {
    const users = this.getItem('users') || [];
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const user = {
      uid: 'user-' + Date.now(),
      email,
      displayName: name || email.split('@')[0],
      isGuest: false,
      createdAt: new Date().toISOString(),
      ecoScore: 50,
      waterSaved: 0,
      carbonReduced: 0,
      badges: []
    };
    
    users.push(user);
    this.setItem('users', users);
    this.setItem('currentUser', user);
    
    return user;
  }

  async signIn(email, password) {
    // Check if user exists
    const users = this.getItem('users') || [];
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found. Please sign up first.');
    }
    
    // In a real app, you'd verify password here
    // For simplicity, we're just checking if user exists
    
    this.setItem('currentUser', user);
    return user;
  }

  async signOut() {
    // Remove current user - no guest user
    this.removeItem('currentUser');
    return true;
  }
}

export default new LocalStorageService();
