# 🌐 Smart Safety Vision - React Dashboard

Modern, responsive web dashboard built with **Next.js 14**, **React**, **Tailwind CSS**, and **Recharts**.

---

## ✨ Features

- 🎨 **Modern UI** - Gradient backgrounds, smooth animations, glassmorphism
- 📊 **Interactive Charts** - Real-time data visualization with Recharts
- 📱 **Fully Responsive** - Perfect on desktop, tablet, and mobile
- ⚡ **Fast & Optimized** - Built with Next.js 14 App Router
- 🎯 **Real-time Updates** - Auto-refresh functionality
- 📥 **Data Export** - Download reports as CSV
- 🔔 **Status Alerts** - Color-coded compliance indicators

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd web-dashboard
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Open Browser

```
http://localhost:3000
```

---

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3
- **Charts:** Recharts
- **Icons:** Lucide React
- **Language:** TypeScript

---

## 🎨 UI Components

### Header
- Logo & branding
- Real-time clock
- Refresh button

### KPI Cards
- Total Detections
- Total Violations
- Compliance Rate
- Compliant Workers

### Charts
- Daily Violation Trend (Area Chart)
- Violation Distribution (Pie Chart)

### Violations List
- Recent violations
- Filter & search
- View details
- Export data

---

## 🔧 Configuration

### Connect to Backend

Edit `app/page.tsx` to connect to your Python backend:

```typescript
// Replace mock data with API calls
const fetchStats = async () => {
  const response = await fetch('http://localhost:8000/api/stats')
  const data = await response.json()
  setStats(data)
}
```

### Customize Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#8b5cf6', // Change to your brand color
  }
}
```

---

## 📱 Responsive Design

- **Desktop:** Full dashboard with all features
- **Tablet:** Optimized layout
- **Mobile:** Touch-friendly, stacked layout

---

## 🎯 Production Build

```bash
npm run build
npm start
```

---

## 🌐 Deploy

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy dist folder
```

---

## 📊 Features Comparison

| Feature | Streamlit | React Dashboard |
|---------|-----------|-----------------|
| Setup Time | 5 min | 15 min |
| Customization | Limited | Full control |
| Performance | Good | Excellent |
| Mobile | Basic | Optimized |
| Deployment | Simple | Flexible |
| UI/UX | Standard | Modern |

---

## 🎨 Screenshots

### Desktop View
- Full dashboard with all metrics
- Interactive charts
- Responsive tables

### Mobile View
- Touch-optimized
- Stacked layout
- Swipe gestures

---

## 🔄 Auto Refresh

Dashboard auto-refreshes every 5 seconds when enabled.

Toggle in sidebar or modify in code:

```typescript
const REFRESH_INTERVAL = 5000 // milliseconds
```

---

## 📥 Export Data

Click "Export CSV" button to download:
- Violations list
- Statistics
- Violation types

---

## 🎯 Next Steps

1. **Connect Backend API**
   - Create FastAPI/Flask endpoints
   - Fetch real data from database
   - Update charts in real-time

2. **Add Authentication**
   - Login/logout
   - Role-based access
   - Secure routes

3. **Enhanced Features**
   - Live camera feed
   - Push notifications
   - Advanced filtering

---

## 🆘 Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Build errors

```bash
# Clear cache
rm -rf .next
npm run build
```

---

## 📝 License

MIT License - See main project LICENSE

---

## 🎉 Ready to Use!

Dashboard sudah siap pakai dengan:
- ✅ Modern UI
- ✅ Responsive design
- ✅ Interactive charts
- ✅ Real-time updates
- ✅ Export functionality

**Buka:** http://localhost:3000

**DASHBOARD REACT KEREN & MODERN! 🔥**
