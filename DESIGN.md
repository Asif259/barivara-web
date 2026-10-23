---
name: BariVara Dashboard Design System
version: 1.0.0
colors:
  primary: "#12664F"
  primary-hover: "#0E513F"
  secondary: "#307473"
  accent: "#2DC2BD"
  neutral-bg: "#FAFAF9"
  surface: "#FFFFFF"
  surface-subtle: "#F9FAFB"
  border: "#E5E7EB"
  border-subtle: "#F3F4F6"
  text-main: "#171717"
  text-muted: "#6B7280"
  text-subtle: "#9CA3AF"
  success: "#15803D"
  warning: "#B45309"
  danger: "#DC2626"
  info: "#2563EB"
typography:
  headline: { fontFamily: Inter, fontSize: 30px, fontWeight: 600, lineHeight: 1.2 }
  section-title: { fontFamily: Inter, fontSize: 17px, fontWeight: 600, lineHeight: 1.3 }
  body: { fontFamily: Inter, fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
  label: { fontFamily: Inter, fontSize: 12px, fontWeight: 500, lineHeight: 1.4 }
  font-bangla: { fontFamily: Noto Sans Bengali, fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
rounded:
  tag: 6px
  btn: 8px
  card: 10px
  panel: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    border: "{colors.border}"
  metric-card:
    backgroundColor: "{colors.surface}"
    border: "{colors.border}"
  table:
    borderColor: "{colors.border}"
    headerBg: "{colors.surface-subtle}"
  sidebar:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    activeItemBg: "{colors.primary}"
---

# BariVara (বাড়িভাড়া) Dashboard Design System

## Overview
BariVara is a property and rental management dashboard engineered specifically for residential and commercial property owners and landlords in Bangladesh.
The application operates in a distraction-free, light-studio aesthetic with high financial legibility, clear bilingual support (Bangla & English), and seamless mobile-friendly workflows.

## Color Palette & Semantic Roles
- **Canvas (`#FAFAF9`)**: Clean, warm off-white foundation providing high contrast and calm operational space.
- **Surface (`#FFFFFF`)**: Pure white cards, dialogs, and table containers with subtle `#E5E7EB` borders.
- **Primary Emerald (`#12664F`, hover: `#0E513F`)**: Authoritative brand green used for primary actions, active navigation states, and confirm buttons.
- **Secondary Teal (`#307473`)**: Supplementary structural green for tags, icons, and secondary visual indicators.
- **Bright Accent (`#2DC2BD`)**: Selection highlights and micro-indicators.
- **Text Primary (`#171717`)**: High-contrast charcoal for titles, values, and essential information.
- **Text Muted (`#6B7280`)**: Secondary metadata, timestamps, and subtitles meeting WCAG AA contrast standards.
- **Status Colors**:
  - Success (`#15803D`): Fully paid rents, active agreements, verified tenants.
  - Warning (`#B45309`): Partial rent collections, upcoming expiries.
  - Danger (`#DC2626`): Overdue rents, unpaid balances, deleted records.
  - Info (`#2563EB`): Informational notices, draft agreements.

## Typography
- **Primary Sans**: `Inter` for Latin numerals, English UI strings, and navigation.
- **Bangla Font**: `Noto Sans Bengali` for native, authentic Bengali typography.
- **Tabular Numerals**: `font-variant-numeric: tabular-nums` for precise alignment of Bangladeshi Taka (`৳`) amounts across tables and ledgers.

## Layout & Components
- **Sidebar Navigation**: Desktop collapsible/floating sidebar with instant tooltip awareness; full drawer on mobile.
- **Data Tables**: Dense desktop tables with sticky identity columns, paired with `MobileDataRow` touch cards and bottom-sheets on mobile viewports.
- **Metric Cards**: 4-column metric grid displaying total properties, units, active tenants, and occupancy rate.
- **Receipt Dialogs & Print Layout**: A4-ready printable rent receipts and WhatsApp receipt generation.
