# 🚀 Deployment Guide - EcoTrack AI

## Table of Contents
- [Firebase Hosting](#firebase-hosting)
- [Vercel](#vercel)
- [Netlify](#netlify)
- [Docker](#docker)

---

## 🔥 Firebase Hosting

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase account

### Steps

1. **Login to Firebase**
```bash
firebase login
```

2. **Initialize Firebase in your project**
```bash
firebase init
```
Select:
- ✅ Hosting
- Choose your Firebase project (or create a new one)
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub Actions: Optional

3. **Configure Firebase (firebase.json should look like this)**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

4. **Build and Deploy**
```bash
npm run build
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

---

## ⚡ Vercel

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ecotrack-ai)

### Manual Deploy

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

Follow the prompts:
- Set up and deploy: `Y`
- Which scope: Select your account
- Link to existing project: `N`
- Project name: `ecotrack-ai`
- Directory: `./`
- Override settings: `N`

4. **Production Deploy**
```bash
vercel --prod
```

### Environment Variables
Add in Vercel Dashboard → Settings → Environment Variables:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🌐 Netlify

### One-Click Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/ecotrack-ai)

### Manual Deploy

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**
```bash
netlify login
```

3. **Initialize and Deploy**
```bash
netlify init
```

4. **Create netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

5. **Deploy**
```bash
netlify deploy --prod
```

### Environment Variables
Add in Netlify Dashboard → Site Settings → Environment Variables

---

## 🐳 Docker

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build and Run
```bash
# Build image
docker build -t ecotrack-ai .

# Run container
docker run -p 8080:80 ecotrack-ai
```

Access at: `http://localhost:8080`

### Docker Compose (docker-compose.yml)
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
```

Run with: `docker-compose up`

---

## 📱 Progressive Web App (PWA)

To make EcoTrack AI installable:

1. **Add manifest.json to public/**
```json
{
  "name": "EcoTrack AI",
  "short_name": "EcoTrack",
  "description": "Track and reduce your water and carbon footprint",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#22c55e",
  "icons": [
    {
      "src": "/eco-icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

2. **Update index.html**
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#22c55e">
```

3. **Add service worker with Vite PWA plugin**
```bash
npm install vite-plugin-pwa -D
```

---

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env` file
- Use different Firebase projects for dev/prod
- Rotate API keys regularly

### Firebase Security Rules
```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /waterLogs/{logId} {
      allow read, write: if request.auth != null;
    }
    match /carbonLogs/{logId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### CORS Configuration
If using custom domain, configure CORS in Firebase Storage

---

## 📊 Performance Optimization

### Before Deploy
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

### Optimization Tips
- Enable gzip/brotli compression
- Use CDN for static assets
- Enable HTTP/2
- Implement lazy loading
- Optimize images

---

## 🔍 Monitoring

### Google Analytics
Add to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry (Error Tracking)
```bash
npm install @sentry/react
```

---

## 🎉 Post-Deployment Checklist

- [ ] SSL certificate is active (HTTPS)
- [ ] Custom domain configured
- [ ] Environment variables set
- [ ] Firebase rules configured
- [ ] Analytics tracking works
- [ ] PWA installable on mobile
- [ ] All pages load correctly
- [ ] Forms submit properly
- [ ] Images load
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Performance score >90 (Lighthouse)

---

## 📞 Support

For deployment issues:
- Firebase: https://firebase.google.com/support
- Vercel: https://vercel.com/support
- Netlify: https://www.netlify.com/support/

---

**Happy Deploying! 🚀**
