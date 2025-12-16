# SmartAPD Dashboard - AI Improvement Prompt

## 🎯 Objective
Perbaiki dan tingkatkan Dashboard SmartAPD agar lebih menarik, mudah dibaca, dan fungsional.

---

## 📁 Project Location
```
d:\PROJECT PROJECT KU\smartapd\frontend\
```

## 🛠 Tech Stack (Jangan Ganti)
- Next.js 14
- React 18
- TailwindCSS
- Framer Motion
- Lucide React Icons
- Recharts (untuk grafik)

## 🎨 Color Palette (WAJIB Sama)
```css
/* Background */
--slate-950: #020617;  /* Main background */
--slate-900: #0f172a;  /* Card background */
--slate-800: #1e293b;  /* Border, secondary */

/* Text */
--white: #ffffff;
--slate-400: #94a3b8;  /* Secondary text */

/* Accent */
--orange-500: #f97316; /* Primary accent, CTA */
--orange-600: #ea580c; /* Hover */
--emerald-500: #10b981; /* Success, safe */
--red-500: #ef4444;    /* Danger, violation */
--yellow-500: #eab308; /* Warning */
--blue-500: #3b82f6;   /* Info */
```

---

## 📋 Tasks

### 1. Dashboard Main Page (`app/dashboard/page.tsx`)

**Current Issues:**
- Layout kurang clean
- Statistik kurang menonjol
- Grafik kurang informatif

**Improvements Needed:**
- [ ] Buat stats cards dengan gradient subtle dan shadow
- [ ] Tambah animasi angka naik (count-up animation)
- [ ] Improve grafik dengan lebih banyak data points
- [ ] Tambah filter by date (hari ini, minggu ini, bulan ini)
- [ ] Tambah real-time indicator (blinking dot)
- [ ] Grid layout yang lebih responsive

**Stats Cards Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Total Deteksi    🚨 Pelanggaran    ✅ Kepatuhan   📹 Camera │
│      1,234              45              96.3%         8/8     │
│      ↑12% vs kemarin   ↓5%             ↑2.1%        Online   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Live Camera Grid (`components/LiveCameraGrid.tsx`)

**Create New Component:**
- [ ] Grid 2x2 atau 3x3 untuk live preview kamera
- [ ] Setiap card ada: nama kamera, status (online/offline), last detection
- [ ] Hover effect untuk fullscreen preview
- [ ] Badge untuk pelanggaran terakhir

### 3. Activity Feed (`components/ActivityFeed.tsx`)

**Create New Component:**
- [ ] Real-time scrolling feed
- [ ] Format: [Time] [Icon] [Message] [Location]
- [ ] Color-coded by severity (red = critical, orange = warning, green = info)
- [ ] Auto-scroll terbaru di atas
- [ ] Max 20 items, lazy load more

### 4. Alerts Panel (`app/alerts/page.tsx`)

**Improvements:**
- [ ] Table dengan sorting dan filtering
- [ ] Badge status: Pending, Acknowledged, Resolved
- [ ] Quick action buttons: Acknowledge, View Detail, Dismiss
- [ ] Bulk actions: Select all, Acknowledge selected
- [ ] Search by location, type, date

### 5. Reports Page (`app/reports/page.tsx`)

**Improvements:**
- [ ] Date range picker
- [ ] Multiple chart types: Line, Bar, Pie
- [ ] Export to PDF/Excel buttons
- [ ] Comparison mode (this week vs last week)
- [ ] Top 5 violation locations
- [ ] Hourly breakdown heatmap

### 6. Settings Page (`app/settings/page.tsx`)

**Improvements:**
- [ ] Camera management (add, edit, delete)
- [ ] Notification settings (Telegram, Email)
- [ ] Detection sensitivity slider
- [ ] Zone configuration
- [ ] User management (basic)

---

## 🎨 UI Components to Create

### GlassCard Component
```tsx
// Glassmorphism card with subtle glow
<GlassCard 
  className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 shadow-xl"
  glowColor="orange" // optional glow effect
>
  {children}
</GlassCard>
```

### StatCard Component
```tsx
<StatCard
  icon={<AlertTriangle />}
  title="Pelanggaran"
  value={45}
  change={-5}
  changeType="decrease"
  color="red"
/>
```

### StatusBadge Component
```tsx
<StatusBadge status="critical" /> // red pulsing
<StatusBadge status="warning" />  // yellow
<StatusBadge status="success" />  // green
<StatusBadge status="offline" />  // gray
```

---

## ✨ Animation Guidelines

1. **Page transitions**: Fade + slide up
2. **Card hover**: Scale 1.02 + shadow increase
3. **Numbers**: Count-up animation on load
4. **Charts**: Draw animation on load
5. **Alerts**: Slide in from right
6. **Status dots**: Pulse animation for live

---

## 📱 Responsive Breakpoints

| Screen | Layout |
|--------|--------|
| Mobile (<640px) | 1 column, stacked cards |
| Tablet (640-1024px) | 2 columns |
| Desktop (>1024px) | 3-4 columns, sidebar visible |

---

## 🗂 File Structure to Create/Modify

```
frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx        # Main dashboard (IMPROVE)
│   ├── alerts/
│   │   └── page.tsx        # Alerts list (IMPROVE)
│   ├── reports/
│   │   └── page.tsx        # Reports page (IMPROVE)
│   ├── cameras/
│   │   └── page.tsx        # Camera management (NEW)
│   └── settings/
│       └── page.tsx        # Settings (IMPROVE)
├── components/
│   ├── dashboard/
│   │   ├── StatCard.tsx        # NEW
│   │   ├── LiveCameraGrid.tsx  # NEW
│   │   ├── ActivityFeed.tsx    # NEW
│   │   ├── ViolationChart.tsx  # NEW
│   │   └── ComplianceGauge.tsx # NEW
│   ├── ui/
│   │   ├── GlassCard.tsx    # NEW
│   │   ├── StatusBadge.tsx  # NEW
│   │   └── DatePicker.tsx   # NEW
│   └── Sidebar.tsx          # IMPROVE
```

---

## 🔗 API Endpoints (Backend sudah ada)

```
GET  /api/v1/detections        # List detections
GET  /api/v1/detections/stats  # Statistics
GET  /api/v1/alerts            # List alerts
PUT  /api/v1/alerts/:id/acknowledge
GET  /api/v1/cameras           # List cameras
GET  /api/v1/reports/daily     # Daily report
GET  /api/v1/reports/weekly    # Weekly report
WS   /ws                       # Real-time updates
```

---

## 📝 Example Implementation

### StatCard.tsx
```tsx
"use client";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  change?: number;
  changeType?: "increase" | "decrease";
  color?: "orange" | "red" | "green" | "blue";
}

export function StatCard({ icon, title, value, change, changeType, color = "orange" }: StatCardProps) {
  const colorClasses = {
    orange: "from-orange-500/20 to-orange-600/5 border-orange-500/30",
    red: "from-red-500/20 to-red-600/5 border-red-500/30",
    green: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className="p-2 bg-slate-800/50 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-black text-white">{value.toLocaleString()}</span>
        {change !== undefined && (
          <span className={`flex items-center text-sm ${changeType === "increase" ? "text-emerald-500" : "text-red-500"}`}>
            {changeType === "increase" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
```

---

## 🚀 Priority Order

1. **HIGH**: Dashboard main page + StatCard
2. **HIGH**: Activity Feed component
3. **MEDIUM**: Live Camera Grid
4. **MEDIUM**: Alerts page improvements
5. **LOW**: Reports page
6. **LOW**: Settings page

---

## ⚠️ Important Notes

1. **Jangan ganti color palette** - harus tetap orange/slate theme
2. **Semua halaman harus dark mode**
3. **Gunakan Framer Motion untuk animasi**
4. **Responsive design wajib**
5. **Data boleh dummy/mock untuk sekarang**
6. **Comment code dengan jelas**

---

*Prompt ini untuk AI lain yang akan mengerjakan frontend dashboard*
