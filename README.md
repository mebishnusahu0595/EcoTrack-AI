# 🌍 EcoTrack AI - Sustainability Tracking Web App

A modern, gamified web application to help users track and reduce their water and carbon footprints. Built with React, Tailwind CSS, and Firebase (with LocalStorage fallback).

![EcoTrack AI](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.3.6-cyan)

## ✨ Features

### 🏠 Home Dashboard
- **Real-time Stats**: Today's water usage, carbon footprint, and Eco Score (0-100)
- **Eco Twin Avatar**: Evolving avatar that grows with your sustainability efforts
  - 0-30: Wilted plant 🥀
  - 31-70: Growing plant 🌱
  - 71-100: Blooming tree 🌳
- **Weekly Charts**: Animated water consumption graphs
- **Quick Actions**: Fast navigation to all tracking features

### 💧 Water Tracker
- **Activity-Based Tracking**: Log water usage for bathing, washing, cooking, cleaning, gardening
- **Real-time Calculations**: Instant water usage estimates based on duration
- **GreenPulse Mode**: Advanced tracking with:
  - Live timer with flow rate calculation
  - Pipe speed & diameter configuration
  - Smart alerts at 10L (green), 20L (yellow), 30L (red)
  - Auto-stop at 30L threshold
- **Report Issue**: Quick link to report water-related problems

### 🌱 Carbon Tracker
- **Multi-Category Tracking**:
  - 🚗 Transportation (car, bike, bus, train, flight)
  - ⚡ Electricity usage
  - 🍽️ Food consumption (vegan, vegetarian, non-vegetarian)
- **Interactive Sliders**: Adjust values and see real-time CO₂ calculations
- **Weekly Charts**: Line graphs showing emission trends with Recharts
- **Breakdown View**: Detailed CO₂ breakdown by category

### 📋 Report Issue
- **Smart Form**: Name, location, description, and image upload
- **Auto-Location**: GPS-based location detection
- **Image Preview**: Upload and preview images before submission
- **Community Workflow**:
  - Reports sent to Municipal Corporation (Nagar Nigam)
  - Community can upvote/confirm reports
  - Green Credits awarded when issues are resolved

### 🤖 AI Coach
- **Personalized Insights**: AI-powered suggestions based on your Eco Score
- **Motivational Messages**: Dynamic messages that evolve with your progress
- **Weekly Stats**: Track water saved and carbon reduced
- **Action Tips**: High and medium impact suggestions for:
  - Water conservation
  - Carbon reduction
  - Energy efficiency

### 👥 Community Dashboard
- **Leaderboard**: Top 10 eco-savers with podium display
- **Badges System**:
  - 💧 Water Saver
  - 🌿 Carbon Neutral
  - 🏆 Eco Hero
- **Community Feed**: Share tips, progress, and achievements
- **Social Interactions**: Like, comment, and share posts

## 🎨 Design Features
- **Eco-Themed UI**: Green and blue color palette
- **Dark/Light Mode**: Automatic theme switching with manual toggle
- **Smooth Animations**: Framer Motion for fluid transitions
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Custom Components**: Reusable badges, buttons, and cards

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.6
- **Animations**: Framer Motion 10.16.16
- **Lottie**: lottie-react 2.4.0
- **Charts**: Recharts 2.10.3
- **Routing**: React Router DOM 6.20.0
- **Icons**: Lucide React 0.294.0
- **Backend**: Firebase 10.7.1 (with LocalStorage fallback)
- **Build Tool**: Vite 5.0.8

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

1. **Clone the repository**
```bash
cd abc
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment (optional)**

Copy the example env file:
```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Note**: If you don't configure Firebase, the app will automatically use LocalStorage as a fallback.

4. **Start the development server**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
abc/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Layout.jsx      # Main layout with navigation
│   │   └── EcoTwinAvatar.jsx  # Animated avatar component
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx    # Authentication context
│   │   └── ThemeContext.jsx   # Dark/Light theme context
│   ├── pages/             # Page components
│   │   ├── HomeDashboard.jsx
│   │   ├── WaterTracker.jsx
│   │   ├── CarbonTracker.jsx
│   │   ├── ReportIssue.jsx
│   │   ├── AICoach.jsx
│   │   └── Community.jsx
│   ├── services/          # Services and utilities
│   │   └── localStorage.js    # LocalStorage service
│   ├── firebase.js        # Firebase configuration
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## 🔥 Firebase Setup (Optional)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage for image uploads
5. Copy your Firebase config to `.env`

**Collections needed**:
- `waterLogs` - Water tracking data
- `carbonLogs` - Carbon tracking data
- `reports` - Issue reports
- `communityPosts` - Community feed posts
- `leaderboard` - User rankings

## 🌐 Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase:
```bash
firebase init
```
- Select "Hosting"
- Choose your Firebase project
- Set public directory to `dist`
- Configure as single-page app: Yes
- Don't overwrite index.html

4. Build and deploy:
```bash
npm run build
firebase deploy
```

## 🎯 Optional Enhancements

The following features are planned for future releases:

- [ ] **PDF Reports**: Download daily/weekly reports as PDF
- [ ] **React Spring**: Enhanced avatar growth animations
- [ ] **Push Notifications**: Alerts when thresholds are exceeded
- [ ] **OpenAI Integration**: Real AI-powered coaching (currently using mock data)
- [ ] **Map Integration**: Interactive map for community reporting
- [ ] **Admin Dashboard**: For municipal administrators
- [ ] **Achievements System**: Unlock badges and rewards
- [ ] **Social Sharing**: Share achievements on social media
- [ ] **Multi-language Support**: Localization for different languages
- [ ] **Mobile App**: React Native version

## 🧪 Testing

Run the linter:
```bash
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with 💚 for a sustainable future

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Charts by [Recharts](https://recharts.org/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)

---

**EcoTrack AI** - Building a sustainable future, one drop at a time. 🌍💧🌱
