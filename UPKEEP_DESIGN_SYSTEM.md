# Upkeep Design System & UI Specification

> **A modern, human-centric design system for AI-first Real Estate & SaaS applications.**  
> Crafted from the Google Stitch design language, featuring clean typography, soft surfaces, tactile cards, subtle ambient glows, and interactive voice/chat components.

---

## 1. Design Philosophy

1. **Soft Modern Surfaces:** Avoiding harsh contrasts. We use warm, off-white surfaces (`#f7f8fb`), ultra-soft neutral borders (`#e6e9f0`), and crisp white card elevation with micro-drop-shadows.
2. **Dynamic Brand Presence:** Royal electric blue (`#2563eb`) serves as the action color. Subtle radial gradient glows (`bg-brand-400/15 blur-[120px]`) are positioned behind hero sections and auth cards for depth.
3. **Tactile Feedback:** Buttons and interactive cards feature micro-press animations (`active:scale-[0.98]`) and smooth 150ms transitions.
4. **Autonomous AI Status Clarity:** Clear, human-readable state indicators (e.g., pulsating live dots for active triage, segmented controls, and inline status badges).

---

## 2. Color Palette & Semantic Tokens

### Primary Brand Blue
Used for primary actions, active indicators, and brand accents.

| Token | Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| `brand-50` | `#eff6ff` | `bg-brand-50` | Chip backgrounds, subtle hover tints |
| `brand-100` | `#dbeafe` | `bg-brand-100` | Pill highlights, selection backgrounds |
| `brand-200` | `#bfdbfe` | `border-brand-200` | Active input borders, card outlines |
| `brand-500` | `#3b82f6` | `bg-brand-500` | Pulsing indicators, secondary accents |
| `brand-600` | `#2563eb` | `bg-brand-600` | **Primary CTA Buttons**, Logo, Main Accent |
| `brand-700` | `#1d4ed8` | `bg-brand-700` | Button hover states, active links |
| `brand-900` | `#1e3a8a` | `text-brand-900` | Dark text on blue badges |

### Neutral Ink & Backgrounds
Deep, calm navy-slates replacing harsh `#000000`.

| Token | Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| `ink` | `#0b1220` | `text-ink` | Headings, primary body text |
| `ink-muted`| `#5b6478` | `text-ink-muted` | Subtitles, labels, secondary text |
| `ink-subtle`| `#98a0b3` | `text-ink-subtle`| Placeholders, inactive icons, timestamps |
| `line` | `#e6e9f0` | `border-line` | Subtle card borders, dividers |
| `surface` | `#f7f8fb` | `bg-surface` | Page background |
| `white` | `#ffffff` | `bg-white` | Card bodies, input fields, popovers |

### Status & Severity Colors
| State | Badge Background | Text / Dot Color |
| :--- | :--- | :--- |
| **Pending** | `bg-white ring-1 ring-inset ring-line` | `text-ink-muted`, dot: `bg-ink-subtle` |
| **In Progress** | `bg-brand-50` | `text-brand-700`, dot: `bg-brand-500 animate-pulse` |
| **Resolved** | `bg-brand-600` | `text-white`, dot: `bg-white` |
| **Emergency** | `bg-red-50` | `text-red-700` |
| **High** | `bg-brand-100` | `text-brand-800` |

---

## 3. Typography & Spacing Scale

### Font Family
- **Sans:** `Inter`, `ui-sans-serif`, `system-ui`, `-apple-system`, `sans-serif`.

### Type Scale
* **Eyebrow:** `text-xs font-medium uppercase tracking-[0.14em] text-brand-600`
* **Display / Hero H1:** `text-4xl sm:text-5xl font-semibold tracking-tight text-ink`
* **Page Title H2:** `text-2xl sm:text-3xl font-semibold tracking-tight text-ink`
* **Section Heading H3:** `text-base sm:text-lg font-medium text-ink`
* **Body Text:** `text-sm text-ink leading-relaxed`
* **Muted / Secondary:** `text-xs sm:text-sm text-ink-muted`
* **Microcopy & Meta:** `text-[11px] text-ink-subtle`

---

## 4. Elevation, Radii & Shadows

* **Border Radius:**
  * Cards & Containers: `rounded-2xl` (16px) or `rounded-3xl` (24px)
  * Inputs: `rounded-xl` (12px)
  * Buttons & Badges: `rounded-full` (9999px)
* **Shadows:**
  * `shadow-soft`: `0 1px 2px rgba(11, 18, 32, 0.04), 0 4px 16px -4px rgba(11, 18, 32, 0.06)`
  * `shadow-lift`: `0 24px 48px -16px rgba(37, 99, 235, 0.25)` (used for glowing action cards)
* **Ambient Glow Backdrop:**
  ```html
  <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-brand-400/15 blur-[120px]" />
  ```

---

## 5. Master Component Library

### 1. Buttons (`.btn`)
```html
<!-- Primary Pill CTA -->
<button className="btn btn-primary">
  <span>Get Started</span>
</button>

<!-- Secondary Outline Button -->
<button className="btn btn-secondary">
  <span>View Documentation</span>
</button>

<!-- Ghost Action Button -->
<button className="btn btn-ghost">
  <span>Cancel</span>
</button>

<!-- Icon Button -->
<button className="btn btn-secondary btn-icon">
  <Trash2 className="h-4 w-4" />
</button>
```

### 2. Form Inputs (`.input`, `.label`)
```html
<div>
  <label className="label">Work Email</label>
  <input 
    type="email" 
    placeholder="you@company.com" 
    className="input" 
  />
</div>
```

### 3. Segmented Controls (Tab Bar)
```html
<div className="segmented">
  <button className="segmented-item segmented-item-active">Active</button>
  <button className="segmented-item">Resolved</button>
  <button className="segmented-item">All</button>
</div>
```

### 4. Status Badges (`StatusBadge`, `SeverityBadge`)
```html
<!-- In Progress Badge with Pulsing Dot -->
<span className="badge bg-brand-50 text-brand-700">
  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
  In Progress
</span>

<!-- Emergency Badge -->
<span className="badge bg-red-50 text-red-700 font-semibold">
  Emergency
</span>
```

### 5. Tactical Cards (`.card`)
```html
<div className="card p-5 shadow-soft hover:border-brand-200 transition">
  <div className="flex items-center justify-between">
    <h4 className="text-sm font-semibold text-ink">Leaking faucet</h4>
    <span className="badge bg-brand-50 text-brand-700">In Progress</span>
  </div>
  <p className="mt-1 text-xs text-ink-muted">Hot water shutoff valve is dripping under sink.</p>
</div>
```

### 6. Voice Call 3D Audio Visualizer Orb
```html
<div className="relative flex items-center justify-center my-6">
  <!-- Outer Glow Ring -->
  <div className="absolute h-44 w-44 rounded-full bg-brand-400/20 scale-125 animate-pulse-slow" />
  <!-- Inner Ring -->
  <div className="absolute h-36 w-36 rounded-full bg-brand-500/25 scale-110" />
  <!-- Core Gradient Orb -->
  <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-500 shadow-lift">
    <div className="flex items-center gap-1">
      <span className="h-5 w-1 rounded-full bg-white animate-bounce [animation-delay:0ms]" />
      <span className="h-8 w-1 rounded-full bg-white animate-bounce [animation-delay:150ms]" />
      <span className="h-6 w-1 rounded-full bg-white animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
</div>
```

### 7. Auth & Onboarding Container Shell (`AuthShell`)
```html
<div className="relative flex min-h-screen flex-col items-center px-4 py-10">
  <!-- Radial Glow -->
  <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-brand-400/15 blur-[120px]" />
  
  <!-- Logo -->
  <a href="/" className="text-lg font-semibold tracking-tight">
    Upkeep<span className="text-brand-600">.</span>
  </a>

  <!-- Content Box -->
  <div className="mt-14 w-full max-w-sm">
    <p className="eyebrow text-center">Company Signup</p>
    <h1 className="mt-2 text-center text-3xl font-semibold tracking-tight">Create your account</h1>
    
    <div className="card mt-8 p-6 shadow-soft">
      {/* Form Content */}
    </div>
  </div>
</div>
```

---

## 6. Tailwind CSS & Layer Presets (Copy-Paste Ready)

### `tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        ink: {
          DEFAULT: "#0b1220",
          muted: "#5b6478",
          subtle: "#98a0b3",
        },
        line: "#e6e9f0",
        surface: "#f7f8fb",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11, 18, 32, 0.04), 0 4px 16px -4px rgba(11, 18, 32, 0.06)",
        lift: "0 24px 48px -16px rgba(37, 99, 235, 0.25)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pop-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pulse-slow": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "pop-in": "pop-in 200ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

### `globals.css` `@layer components`
```css
@layer components {
  /* Surfaces */
  .card {
    @apply rounded-2xl border border-line bg-white;
  }

  /* Buttons */
  .btn {
    @apply inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-medium transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50;
  }
  .btn-primary {
    @apply bg-brand-600 text-white hover:bg-brand-700;
  }
  .btn-secondary {
    @apply border border-line bg-white text-ink hover:border-brand-200 hover:bg-brand-50;
  }
  .btn-ghost {
    @apply text-ink-muted hover:bg-brand-50 hover:text-brand-700;
  }
  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700;
  }
  .btn-icon {
    @apply h-10 w-10 px-0;
  }

  /* Form controls */
  .input {
    @apply h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink placeholder:text-ink-subtle transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10;
  }
  .label {
    @apply mb-1.5 block text-xs font-medium text-ink-muted;
  }

  /* Badges */
  .badge {
    @apply inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium;
  }

  /* Segmented control */
  .segmented {
    @apply inline-flex rounded-full bg-brand-50/70 p-1;
  }
  .segmented-item {
    @apply rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-muted transition hover:text-ink;
  }
  .segmented-item-active {
    @apply bg-white text-brand-700 shadow-soft;
  }

  .eyebrow {
    @apply text-xs font-medium uppercase tracking-[0.14em] text-brand-600;
  }
}
```

---

## 7. How to Use for Future Projects

1. Copy the **`colors`**, **`fontFamily`**, and **`boxShadow`** into your new project's `tailwind.config.ts`.
2. Add the **`@layer components`** styles into your `globals.css`.
3. Drop in the **`StatusBadge`**, **`AuthShell`**, and **`Select`** components for instantaneous production-quality UI.
