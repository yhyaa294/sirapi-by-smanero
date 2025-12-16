# SmartAPD - Frontend Design Concept

## 🎨 Color Palette (Tetap Sama)

### Primary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Slate 950** | `#020617` | rgb(2, 6, 23) | Background utama |
| **Slate 900** | `#0f172a` | rgb(15, 23, 42) | Card/Section background |
| **Slate 800** | `#1e293b` | rgb(30, 41, 59) | Border, secondary bg |
| **Slate 400** | `#94a3b8` | rgb(148, 163, 184) | Text secondary |

### Accent Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Orange 500** | `#f97316` | rgb(249, 115, 22) | Primary accent, CTA |
| **Orange 600** | `#ea580c` | rgb(234, 88, 12) | Hover states |
| **Emerald 500** | `#10b981` | rgb(16, 185, 129) | Success, safe |
| **Red 500** | `#ef4444` | rgb(239, 68, 68) | Error, danger, violation |
| **Yellow 500** | `#eab308` | rgb(234, 179, 8) | Warning |
| **Blue 500** | `#3b82f6` | rgb(59, 130, 246) | Info |

---

## 📐 Layout Structure

### Landing Page Sections
```
┌─────────────────────────────────────────────┐
│ 1. NAVBAR (Fixed, Backdrop Blur)            │
├─────────────────────────────────────────────┤
│ 2. HERO (Full Height, Worker Image Slider)  │
│    - Headline + Stats + CTA                 │
├─────────────────────────────────────────────┤
│ 3. FEATURES GRID (6 Cards, 3 Columns)       │
├─────────────────────────────────────────────┤
│ 4. APD EDUCATION (4 Cards, Educational)     │
│    - Helm, Rompi, Sarung Tangan, Sepatu     │
├─────────────────────────────────────────────┤
│ 5. TUTORIAL / HOW IT WORKS (4 Steps)        │
│    - Alternating Left/Right Layout          │
├─────────────────────────────────────────────┤
│ 6. WORKFLOW DIAGRAM (Full Width Image)      │
├─────────────────────────────────────────────┤
│ 7. FAQ (Accordion Style)                    │
├─────────────────────────────────────────────┤
│ 8. CTA SECTION (Call to Action)             │
├─────────────────────────────────────────────┤
│ 9. FOOTER (4 Columns)                       │
└─────────────────────────────────────────────┘
```

---

## 🖼️ Visual Elements Needed

### Hero Section
- [ ] Background hologram/tech pattern
- [ ] Worker images (4 variants, transparent PNG)
- [ ] Animated gradient orb

### Features
- [ ] Icon illustrations (AI, Alert, Map, Dashboard, Report, Security)

### APD Education
- [ ] Helm 3D illustration
- [ ] Rompi 3D illustration
- [ ] Sarung tangan 3D illustration
- [ ] Sepatu safety 3D illustration

### Tutorial
- [ ] Step 1: CCTV installation
- [ ] Step 2: System architecture diagram
- [ ] Step 3: Mobile notification mockup
- [ ] Step 4: Dashboard screenshot

### Workflow
- [ ] Full workflow diagram (Input → AI → Output)

---

## 🎯 Design Principles

1. **Dark Theme** - Mata nyaman untuk monitoring 24/7
2. **High Contrast** - Orange accent pop di background gelap
3. **Industrial Feel** - Sesuai dengan K3/Safety
4. **Modern Tech** - Glassmorphism, gradients subtl
5. **Mobile First** - Responsive semua ukuran layar

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | 1 column |
| Tablet | 640-1024px | 2 columns |
| Desktop | > 1024px | 3+ columns |

---

## 🔤 Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 (Hero) | System/Inter | 900 (Black) | 48-72px |
| H2 (Section) | System/Inter | 900 (Black) | 36-48px |
| H3 (Card Title) | System/Inter | 700 (Bold) | 20-24px |
| Body | System/Inter | 400 (Regular) | 14-16px |
| Caption | System/Inter | 500 (Medium) | 12-14px |

---

## ✨ Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Hero Images | Fade + Scale | 0.5s |
| Cards | Fade Up on Scroll | 0.3s |
| Navbar | Backdrop blur | - |
| Buttons | Scale on hover | 0.2s |
| FAQ | Height expand | 0.2s |
