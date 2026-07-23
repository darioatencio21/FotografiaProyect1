# Design System

<!-- impeccable:design-schema 1 -->

## Color Strategy

Restrained — one neutral ground, one near-white primary, one warm metallic exception (logo only).

### Palette

| Token | Class | Value | Usage |
|---|---|---|---|
| Background | `dark` | `#0C0D0E` | Page body, main canvas |
| Surface base | `dark-gray` | `rgba(255,255,255,0.04)` | Cards, panels, sections |
| Surface hover | `charcoal` | `rgba(255,255,255,0.08)` | Inputs, hover states |
| Text primary | `white` | `#F0F0F0` | Body, headings (main text color) |
| Text secondary | — | `rgba(240,240,240,0.55)` | Labels, meta, placeholders |
| Text tertiary | — | `rgba(240,240,240,0.3)` | Captions, disabled |
| Border | `stone` | `rgb(40,42,46)` | Card borders, dividers |
| Overlay | `overlay` | `rgba(0,0,0,0.75)` | Modal backdrops |
| Hero text | `hero` | `#F0F0F0` | Text over hero images |
| Gold (logo only) | `gold-500` | `#B58A4A` | Retained solely for the SVG logo gradient; no UI element uses gold as an accent |

### Rationale

Near-black `#0C0D0E` (slightly warmer than Linear's `#08090A`) keeps the dark minimal foundation but reads as warm charcoal rather than sterile black. White is softened to `#F0F0F0` (warm white) to avoid clinical contrast. Borders use a warm dark gray `rgb(40,42,46)`. Gold is an exception for the logo only — no button, no link, no accent uses it. Hierarchy comes from weight and size, not color.

## Typography

| Role | Face | Weight | Size | Leading | Tracking |
|---|---|---|---|---|---|
| Display (hero, major headings) | Playfair Display | 400 (regular) + 400 italic | `clamp(2rem,5vw,5rem)` | 1.05 | `-0.02em` |
| Subheadings (h2, h3, section titles) | Inter Variable | 590 | `clamp(1rem,2.5vw,1.75rem)` | 1.2 | `-0.01em` |
| Body | Inter Variable | 510 | `0.9375rem` (15px) | 1.6 | `0em` |
| Small / Meta | Inter Variable | 510 | `0.8125rem` (13px) | 1.4 | `0.01em` |
| Label / Mono | JetBrains Mono | 400 | `0.6875rem` (11px) | 1.3 | `0.08em` |
| Price / Amount | JetBrains Mono | 500 | `1.125rem` (18px) | 1 | `0em` |

Body measure: 65–75ch.

## Corner Radius

| Level | Value |
|---|---|
| Cards | `8px` |
| Buttons / inputs | `6px` |
| Modals | `12px` |
| Pills / badges | `9999px` |

## Depth & Shadows

Surfaces separate via a 1px inset border in `rgb(40,42,46)` rather than shadows. When elevation is needed:

| Level | Value |
|---|---|
| Raised (card) | `0 0 0 1px rgb(40,42,46) inset` |
| Elevated (dropdown, modal) | `0 4px 24px rgba(0,0,0,0.4)` |
| Overlay (modal backdrop) | `rgba(0,0,0,0.75) backdrop-blur-sm` |

## Motion

| Property | Value |
|---|---|
| Default transition | `160ms cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| Button press | `transform: scale(0.97)` at 100ms |
| Enter (cards, sections) | `opacity: 0; y: 12px` → `opacity: 1; y: 0` at 400ms, staggered 60ms |
| Hover (cards) | `y: -2px` at 200ms ease-out |
| Modal | Scale from `0.95` + opacity, 200ms ease-out |

## Glass / Translucency

```css
.glass-premium {
  background: rgba(12, 13, 14, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgb(40, 42, 46);
}
```

## Iconography

Lucide React icons at `16px` for inline, `20px` for standalone. Stroke width `1.5`. Color inherits from text — no colored icons except the gold logo.

## Navigation

Fixed header (`h-[64px]`) with translucent background (`rgba(12,13,14,0.85) backdrop-blur-md`). Active nav item signaled by font-weight 590 (Inter) and a subtle bottom indicator — no gold highlight.

## Buttons

| Type | Style |
|---|---|
| Primary CTA | `bg-white/10 hover:bg-white/15 text-white border border-white/10` |
| Secondary | `bg-transparent hover:bg-white/5 text-white/70 border border-white/10` |
| Ghost | `bg-transparent hover:bg-white/5 text-white/60` |
| Active press | `transform: scale(0.97)` (100ms) |

No gold background buttons. No colored CTAs.

## Forms

| Element | Style |
|---|---|
| Input / textarea | `bg-white/5 border border-white/10 rounded-[6px] px-3 py-2.5 text-sm text-white` |
| Focus | `ring-1 ring-white/30 border-white/30` |
| Placeholder | `text-white/30` |
| Label | `text-sm text-white/55 font-510` |

## Photography & Images

Images sit on `#0C0D0E` with no background card. Gallery thumbnails are `aspect-[4/5]` with `object-cover`. Lightbox has no chrome — the image fills the viewport with a `rgba(0,0,0,0.85)` backdrop.

## Admin CMS (Operate Mode)

The admin panel inherits the same tokens but with denser spacing and smaller type. Sidebar active state uses `bg-white/10 text-white font-590`. Data displays use `font-mono` labels in `text-white/40`.

## Responsive

- Mobile-first. Single column below `768px`.
- Header collapses to hamburger at `768px`.
- Gallery grid: 1 col mobile, 2 col tablet, 3 col desktop.
- Admin sidebar becomes a bottom tab bar on mobile.
