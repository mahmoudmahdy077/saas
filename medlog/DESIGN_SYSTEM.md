# MedLog SaaS - Design System v2.0

**Version:** 2.0.0 (Enterprise)  
**Last Updated:** 2026-03-14  
**Status:** ✅ Production Ready

---

## 🎨 Design Principles

### 1. **Clean & Professional**
- Minimalist interface
- Focus on content
- Healthcare-appropriate colors
- Enterprise-grade polish

### 2. **Accessible**
- WCAG 2.1 AA compliance
- High contrast ratios
- Keyboard navigation
- Screen reader support

### 3. **Responsive**
- Mobile-first approach
- Fluid layouts
- Adaptive components
- Touch-friendly (44px minimum)

### 4. **Consistent**
- Unified component library
- Standardized spacing (4px grid)
- Consistent typography
- Predictable interactions

---

## 🌈 Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Blue 500 | `#007AFF` | Primary actions, links |
| Blue 600 | `#0066D6` | Hover states |
| Blue 700 | `#0052B3` | Active states |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#34C759` | Success states, verified |
| Warning | `#FF9500` | Warnings, pending |
| Error | `#FF3B30` | Errors, critical |
| Info | `#5856D6` | Information, neutral |

### Neutral Colors
| Name | Light | Dark |
|------|-------|------|
| Background | `#FFFFFF` | `#1A1A1A` |
| Surface | `#F5F5F5` | `#2A2A2A` |
| Border | `#E5E5E5` | `#404040` |
| Text Primary | `#000000` | `#FFFFFF` |
| Text Secondary | `#666666` | `#A0A0A0` |

---

## 📐 Typography

### Font Family
- **Primary:** Inter (web), SF Pro (mobile)
- **Monospace:** JetBrains Mono (code)

### Scale
| Name | Size | Weight | Line Height |
|------|------|--------|-------------|
| H1 | 32px | Bold (700) | 1.2 |
| H2 | 24px | Bold (700) | 1.3 |
| H3 | 20px | SemiBold (600) | 1.4 |
| Body | 16px | Regular (400) | 1.5 |
| Small | 14px | Regular (400) | 1.5 |
| Tiny | 12px | Regular (400) | 1.4 |

---

## 📏 Spacing

### Grid System
- Base unit: **4px**
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

### Component Spacing
| Element | Spacing |
|---------|---------|
| Card padding | 16px |
| Button padding | 12px 24px |
| Input padding | 10px 16px |
| Section gap | 24px |
| Grid gap | 16px |

---

## 🔲 Components

### Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**Variants:**
- Default (white background, shadow)
- Elevated (deeper shadow)
- Outlined (border only)
- Filled (colored background)

### Buttons
```tsx
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
<Button variant="destructive">Danger</Button>
```

**Sizes:**
- sm: 32px height
- md: 40px height (default)
- lg: 48px height

### Badges
```tsx
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Error</Badge>
```

---

## 🎭 Animations

### Duration
| Type | Duration | Easing |
|------|----------|--------|
| Fast | 150ms | ease-out |
| Normal | 300ms | ease-in-out |
| Slow | 500ms | ease-in-out |

### Common Animations
- **Fade In:** opacity 0 → 1
- **Slide Up:** y: 20px → 0
- **Scale:** scale: 0.95 → 1
- **Bounce:** spring (stiffness: 200)

### Micro-interactions
- Button hover: slight lift + shadow
- Card hover: lift 4px + shadow increase
- Loading: pulse animation
- Success: checkmark draw animation

---

## 📱 Mobile-Specific

### Touch Targets
- Minimum: **44x44px**
- Recommended: **48x48px**
- Spacing between: **8px**

### Gestures
- Swipe left: reveal actions
- Swipe right: back navigation
- Pull down: refresh
- Long press: context menu

### Haptic Feedback
- Success: light impact
- Error: heavy impact
- Warning: medium impact

---

## 🌙 Dark Mode

### Implementation
- CSS variables for theming
- Automatic system detection
- Manual toggle available
- All components support dark mode

### Color Adjustments
| Element | Light | Dark |
|---------|-------|------|
| Background | White | #1A1A1A |
| Surface | #F5F5F5 | #2A2A2A |
| Primary | #007AFF | #0A84FF |
| Text | #000000 | #FFFFFF |

---

## ♿ Accessibility

### Requirements
- Contrast ratio: **4.5:1** minimum
- Focus indicators: **2px** outline
- Touch targets: **44px** minimum
- Motion: respect `prefers-reduced-motion`

### Keyboard Navigation
- Tab order: logical flow
- Focus visible: always
- Skip links: provided
- Shortcuts: documented

### Screen Readers
- ARIA labels: all interactive elements
- Live regions: dynamic content
- Alt text: all images
- Semantic HTML: proper structure

---

## 📊 Data Visualization

### Charts (Recharts)
- Line charts: trends over time
- Bar charts: comparisons
- Pie charts: distributions
- Area charts: cumulative data

### Colors
```typescript
const chartColors = [
  '#0088FE', // Blue
  '#00C49F', // Green
  '#FFBB28', // Yellow
  '#FF8042', // Orange
  '#8884D8', // Purple
]
```

### Best Practices
- Limit to 5-7 colors
- Use patterns for colorblind users
- Add data labels for clarity
- Provide tooltips on hover

---

## 🎯 Enterprise Features

### Dashboard Layout
```
┌─────────────────────────────────────┐
│  Header (Logo, Search, User)        │
├─────────────────────────────────────┤
│  Stats Grid (4 cards)               │
├──────────────┬──────────────────────┤
│  Main Chart  │  Side Panel          │
│  (Line/Bar)  │  - Recent Activity   │
│              │  - Top Performers    │
│              │  - Alerts            │
└──────────────┴──────────────────────┘
```

### Data Density
- **Compact:** High density (enterprise)
- **Comfortable:** Default (standard)
- **Spacious:** Low density (presentation)

---

## 📁 File Structure

```
web/src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── animated-card.tsx
│   │   └── skeleton.tsx
│   └── enterprise/
│       └── Dashboard.tsx
├── app/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── enterprise/
│   └── api/
└── lib/
    ├── utils.ts
    └── animations.ts

mobile/app/
├── (tabs)/
│   ├── index.tsx
│   └── enterprise.tsx
└── components/
    └── ui/
        └── animated.tsx
```

---

## 🚀 Performance

### Targets
- First paint: <1s
- Interactive: <2s
- Animation FPS: 60fps
- Bundle size: <500KB

### Optimization
- Code splitting: route-based
- Image optimization: WebP + lazy
- Caching: SWR + React Query
- Tree shaking: all libraries

---

**Design System v2.0 - Enterprise Edition**  
*Clean, accessible, and production-ready.*
