/**
 * ============================================================================
 * JALANIDHI DESIGN SYSTEM - REUSABLE PROMPT DOCUMENT (v2)
 * ============================================================================
 *
 * HOW TO USE THIS FILE:
 * ---------------------
 * This is NOT a runtime file. It will NOT change your UI just by being present.
 *
 * To replicate this design system in a NEW Figma Make project:
 *
 *   1. Copy the "PASTE THIS INTO FIGMA MAKE" section below (Section A)
 *      into the "Background" / first message of your new Figma Make session.
 *
 *   2. Then tell the AI: "Set up the Jalanidhi design system as described
 *      in the background, then build [your feature]."
 *
 *   3. The AI will:
 *      - Add Poppins font to /src/styles/fonts.css
 *      - Add custom scrollbar CSS to /src/styles/index.css
 *      - Create GovButton, GovInput, GovSelect, GovRadio in /src/app/components/ui/
 *      - Create GovTable + helper components in /src/app/components/ui/gov-table.tsx
 *      - Create GovSidebar in /src/app/components/ui/gov-sidebar.tsx
 *      - Apply all color tokens, form patterns, sidebar patterns etc.
 *      - Follow the coding conventions (no optional chaining, localStorage persistence)
 *
 *   IMPORTANT — EXISTING PROJECTS:
 *   If you paste this into a project that already has a sidebar/navbar and tables,
 *   the AI will:
 *      - REPLACE the existing navbar/sidebar VISUAL DESIGN with GovSidebar
 *        (keeping the same navigation items, routes, and onClick handlers)
 *      - REPLACE existing table VISUAL DESIGN with the formal blue-tinted table
 *        (keeping the same data, columns, and action handlers)
 *      - ADD custom scrollbar CSS globally
 *      - NOT break any existing flows, data fetching, or business logic
 *
 * ============================================================================
 *
 *
 * ============================================================================
 * SECTION A: PASTE THIS INTO FIGMA MAKE (start copying from the next line)
 * ============================================================================

## Background

I'm building a government citizen services portal called Jalanidhi (KMDS project) for the Department of Municipal Administration, Government of Karnataka. The application uses React with Tailwind CSS v4 and follows a strict government design system documented below. All code must follow these specifications exactly.

---

## 1. FONT SETUP

Add this to `/src/styles/fonts.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
```

Every text element in the app must include `font-['Poppins',sans-serif]` in its Tailwind classes.

---

## 2. COLOR PALETTE

### Primary Brand
- **Gov Blue (Primary)**: `#1f3a5f` - Page headers, sidebar active state, primary buttons, form section titles
- **Gov Blue Dark**: `#15283f` - Button active/pressed state, scrollbar hover
- **Gov Blue Hover**: `#2d4f7f` - Button hover state
- **Gov Blue Gradient End**: `#27548a` - For gradient card headers: `from-[#1f3a5f] to-[#27548a]`
- **Gov Gold (Accent)**: `#f9a825` - Highlights, date picker nav hover, secondary accents

### Functional Accent
- **Accent Cyan**: `#0078a0` - Action links, modal buttons, date picker selected state
- **Accent Cyan Hover**: `#006b8f` - Cyan button hover
- **Accent Cyan Bright**: `#009fbc` - Button accent variant
- **Link Blue**: `#0066cc` - Text links
- **Light Blue**: `#91c7ff` - Secondary button background

### Text Colors
- **Text Primary**: `#170f49` - Table headers, form labels, modal titles
- **Text Secondary**: `#414141` - Body text, table cell values, field values
- **Text Body**: `#1b212d` - Sidebar navigation text
- **Text Muted**: `#6e7191` - Descriptions, helper text

### Background Colors
- **Page Background**: `#f5f5fa` - Full page background (min-h-screen bg-[#f5f5fa])
- **Section Background**: `#f8fafc` - Form field container boxes
- **Card Background**: `#ffffff` - Cards, sidebar, table containers
- **Table Header BG**: `bg-[#27548a]/10 backdrop-blur-[4px]` - ALL table headers (formal blue-tinted)

### Sidebar Active States
- **Active parent item**: `bg-[#1f3a5f] text-white`
- **Hover parent item**: `hover:bg-[#e3f2fd]`
- **Active child item**: `bg-[#e3f2fd] text-[#1f3a5f]`
- **Inactive child hover**: `hover:bg-gray-50`

### Status Badge Colors
| Status | Classes |
|--------|---------|
| Submitted/Received | `bg-blue-100 text-blue-800 border-blue-300` |
| Under Review | `bg-yellow-100 text-yellow-800 border-yellow-300` |
| Sent to Field Engineer | `bg-indigo-100 text-indigo-800 border-indigo-300` |
| Sent to Revenue Officer | `bg-purple-100 text-purple-800 border-purple-300` |
| Sent to Commissioner | `bg-pink-100 text-pink-800 border-pink-300` |
| Approved | `bg-green-100 text-green-800 border-green-300` |
| Rejected | `bg-red-100 text-red-800 border-red-300` |
| Pending Payment | `bg-orange-100 text-orange-800 border-orange-300` |

---

## 3. TYPOGRAPHY HIERARCHY

Every text element MUST include `font-['Poppins',sans-serif]`.
Every entry below shows the COMPLETE Tailwind classes including font color — never omit colors.

### 3.1 App Header (Top Branding Bar)
| Element | Tailwind Classes | Color |
|---------|-----------------|-------|
| Government name | `text-[16px] font-normal text-black tracking-[0.16px]` | `text-black` |
| Department name | `text-[20px] font-semibold text-black tracking-[0.2px]` | `text-black` |

### 3.2 Page Level (h1 — Main Content Headings)
| Element | Tailwind Classes | Color |
|---------|-----------------|-------|
| Page title (large) | `text-3xl font-bold text-[#1f3a5f]` | Gov Blue `#1f3a5f` |
| Page title (standard) | `text-2xl font-bold text-[#1f3a5f]` | Gov Blue `#1f3a5f` |
| Page subtitle/description | `text-sm text-gray-600` | `text-gray-600` |

### 3.3 Section Level (h2/h3 — Within Pages)
| Element | Tailwind Classes | Color |
|---------|-----------------|-------|
| Form section title | `text-xl font-semibold text-[#1f3a5f]` | Gov Blue `#1f3a5f` |
| Detail section title (underlined) | `text-xl font-bold text-[#1f3a5f] mb-4 pb-2 border-b-2 border-gray-300` | Gov Blue `#1f3a5f` |
| Detail section title (gold underline) | `text-xl font-bold text-[#1f3a5f] mb-4 pb-2 border-b-2 border-[#f9a825]` | Gov Blue `#1f3a5f` |
| Card header title | `text-lg font-bold text-[#1f3a5f]` | Gov Blue `#1f3a5f` |
| Card header title (semibold) | `text-lg font-semibold text-[#1f3a5f]` | Gov Blue `#1f3a5f` |
| Gradient bar section title | `text-xl font-semibold text-white` | `text-white` (on bg-gradient from-[#1f3a5f] to-[#27548a]) |
| Sub-section title | `text-md font-semibold text-[#1f3a5f]` | Gov Blue `#1f3a5f` |
| Report sub-section header | `text-base font-semibold text-[#414141]` | Text Secondary `#414141` |

### 3.4 Field/Label Level
| Element | Tailwind Classes | Color |
|---------|-----------------|-------|
| Form input label | `text-[14px] font-medium text-gray-700` | `text-gray-700` |
| Required asterisk | `text-red-600 ml-1` (inside `<span>*</span>`) | `text-red-600` |
| Detail view label | `text-[14px] font-medium text-[#170f49]` | Text Primary `#170f49` |
| Detail view value | `text-[14px] text-[#414141]` | Text Secondary `#414141` |
| Highlighted value (large) | `text-xl font-bold text-[#1f3a5f]` | Gov Blue `#1f3a5f` |
| Currency/amount value | `text-base font-bold text-[#1f3a5f]` | Gov Blue `#1f3a5f` |
| Total amount label | `text-[15px] font-bold text-[#1f3a5f]` | Gov Blue `#1f3a5f` |

### 3.5 Body/Content Text
| Element | Tailwind Classes | Color |
|---------|-----------------|-------|
| Body text (standard) | `text-[14px] text-gray-700` | `text-gray-700` |
| Body text (alt) | `text-[14px] text-[#414141]` | `#414141` |
| Estimation row text | `text-[15px] font-medium text-gray-900` | `text-gray-900` |
| Estimation row value | `text-[15px] text-gray-700` | `text-gray-700` |
| Estimation row price | `text-[15px] font-semibold text-gray-900` | `text-gray-900` |
| Helper/muted text | `text-sm text-gray-600` | `text-gray-600` |
| Placeholder text | `text-gray-400` | `text-gray-400` |
| Error text | `text-[13px] text-red-600` | `text-red-600` |

### 3.6 Table Text
| Element | Tailwind Classes | Color |
|---------|-----------------|-------|
| Table header (th) | `text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase` | Text Primary `#170f49` |
| Table header (# serial) | `text-[14px] font-bold text-[#170f49] tracking-[0.56px] uppercase` | Text Primary `#170f49` |
| Table cell (standard) | `text-[14px] text-gray-700` | `text-gray-700` |
| Table cell (ID/highlight) | `text-[14px] font-medium text-[#1f3a5f]` | Gov Blue `#1f3a5f` |
| Table cell (serial #) | `text-[14px] font-medium text-gray-700` | `text-gray-700` |
| Estimation table header | `text-sm font-semibold text-white` | `text-white` (on bg-[#1f3a5f]) |

### 3.7 Sidebar Text
| Element | Tailwind Classes | Color |
|---------|-----------------|-------|
| Sidebar header title | `text-lg font-semibold text-[#1f3a5f]` | Gov Blue `#1f3a5f` |
| Sidebar header subtitle | `text-sm text-gray-600` | `text-gray-600` |
| Parent item (active) | `text-sm font-semibold text-white` | `text-white` (on bg-[#1f3a5f]) |
| Parent item (inactive) | `text-sm font-semibold text-[#1b212d]` | Text Body `#1b212d` |
| Child item (active) | `text-[13px] font-medium text-[#1f3a5f]` | Gov Blue `#1f3a5f` (on bg-[#e3f2fd]) |
| Child item (inactive) | `text-[13px] font-medium text-[#1b212d]` | Text Body `#1b212d` |

### 3.8 Buttons
| Element | Tailwind Classes | Color |
|---------|-----------------|-------|
| Primary button | `font-medium text-sm text-white` | `text-white` (on bg-[#1f3a5f]) |
| Large CTA button | `font-semibold text-[15px] text-white` | `text-white` (on bg-[#1f3a5f]) |
| Secondary button | `font-semibold text-sm text-[#1f3a5f]` | Gov Blue `#1f3a5f` (on bg-[#91c7ff]) |
| Accent button | `font-medium text-sm text-white` | `text-white` (on bg-[#009fbc]) |
| Outline button | `font-medium text-sm text-gray-700` | `text-gray-700` (on bg-white border-gray-300) |
| Danger button | `font-semibold text-sm text-white` | `text-white` (on bg-red-500) |
| Gold accent button | `font-semibold text-sm text-white` | `text-white` (on bg-[#f9a825]) |

### 3.9 Badges & Tags
| Element | Tailwind Classes | Color |
|---------|-----------------|-------|
| Status badge | `text-xs font-medium` | Varies by status (see Status Badge Colors in Section 2) |
| Queue badge | `text-xs font-medium` | Varies by role queue color |
| Type tag (Individual) | `text-xs font-medium text-teal-800` | `text-teal-800` (on bg-teal-100) |
| Type tag (Contractor) | `text-xs font-medium text-purple-800` | `text-purple-800` (on bg-purple-100) |

### 3.10 Breadcrumbs & Navigation
| Element | Tailwind Classes | Color |
|---------|-----------------|-------|
| Breadcrumb link | `text-sm text-[#0066cc] hover:underline` | Link Blue `#0066cc` |
| Breadcrumb current | `text-sm text-gray-500` | `text-gray-500` |
| Breadcrumb separator | `w-4 h-4 text-gray-400` (ChevronRight icon) | `text-gray-400` |

### 3.11 States
| Element | Tailwind Classes | Color |
|---------|-----------------|-------|
| Loading spinner text | `text-gray-600` | `text-gray-600` |
| Branded loading text | `text-[#1f3a5f] text-lg` | Gov Blue `#1f3a5f` |
| Empty state text | `text-gray-500` | `text-gray-500` |
| Success heading | `text-2xl font-bold text-[#1f3a5f]` | Gov Blue `#1f3a5f` |
| Success ID text | `text-sm text-blue-700 font-bold font-mono` | `text-blue-700` |
| Disabled text | `text-gray-500` | `text-gray-500` |

### 3.12 Semantic Color Rules Summary
| Color Token | Hex | Where Used |
|-------------|-----|------------|
| **Gov Blue** | `#1f3a5f` | ALL headings (h1-h3), section titles, card titles, sidebar header, highlighted table cells (IDs), currency amounts, success headings, sidebar active child text |
| **Text Primary** | `#170f49` | Table headers (th), detail view labels, modal titles |
| **Text Secondary** | `#414141` | Body text, detail view values, report sub-section headers |
| **Text Body** | `#1b212d` | Sidebar navigation items (inactive state) |
| **Gray 700** | `text-gray-700` | Form labels, table cells, body text (alias for #414141 context) |
| **Gray 600** | `text-gray-600` | Subtitles, descriptions, helper text, loading states |
| **Gray 500** | `text-gray-500` | Empty states, disabled text, breadcrumb current |
| **Gray 400** | `text-gray-400` | Placeholders, icons, breadcrumb separators |
| **Gray 900** | `text-gray-900` | Estimation row data values |
| **White** | `text-white` | On dark backgrounds (primary buttons, active sidebar parent, gradient bar headers, estimation table headers) |
| **Black** | `text-black` | Header branding bar only |
| **Red 600** | `text-red-600` | Error messages, required asterisk |
| **Link Blue** | `#0066cc` | Text links, breadcrumb links |

---

## 4. GOV UI COMPONENTS

Create these reusable components in `/src/app/components/ui/`:

### 4.1 GovButton (`gov-button.tsx`)
- Dependencies: `@radix-ui/react-slot`, `class-variance-authority`
- Base: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-['Poppins',sans-serif] font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2`
- 8 variants:
  - `primary`: `bg-[#1f3a5f] text-white hover:bg-[#2d4f7f] active:bg-[#15283f] focus:ring-[#1f3a5f]/30 shadow-sm`
  - `secondary`: `bg-[#91c7ff] text-[#1f3a5f] hover:bg-[#a8d4ff] active:bg-[#7ab8ff] focus:ring-[#91c7ff]/30 shadow-sm font-semibold`
  - `accent`: `bg-[#009fbc] text-white hover:bg-[#00b8d9] active:bg-[#008299] focus:ring-[#009fbc]/30 shadow-sm`
  - `outline`: `border-[1.5px] border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 focus:ring-gray-300/30`
  - `ghost`: `text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300/30`
  - `link`: `text-[#0066cc] underline-offset-4 hover:underline focus:ring-[#0066cc]/30 p-0 h-auto`
  - `danger`: `bg-[#ef4444] text-white hover:bg-[#dc2626] active:bg-[#b91c1c] focus:ring-[#ef4444]/30 shadow-sm`
  - `success`: `bg-[#10b981] text-white hover:bg-[#059669] active:bg-[#047857] focus:ring-[#10b981]/30 shadow-sm`
- 4 sizes: `sm` (h-8), `default` (h-10), `lg` (h-12), `xl` (h-14)
- Props: `variant`, `size`, `fullWidth` (boolean), `loading` (boolean with spinner SVG), `asChild`, `disabled`

### 4.2 GovInput (`gov-input.tsx`)
- Label: `block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]`
- Required asterisk: `<span className="text-red-600 ml-1">*</span>`
- Input: `w-full px-4 py-2.5 font-['Poppins',sans-serif] text-[14px] text-gray-900 bg-white border-[1.5px] border-gray-300 rounded-md placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 hover:border-gray-400`
- Error state: `border-red-500 focus:border-red-500 focus:ring-red-500/20`
- Error text: `mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]`
- Props: `label`, `required`, `error`, `helperText`, + all standard HTML input props

### 4.3 GovSelect (`gov-select.tsx`)
- Uses Radix Select (shadcn) underneath
- Same label/error pattern as GovInput
- Trigger: Same styling as GovInput input field
- Dropdown: `max-h-[300px] font-['Poppins',sans-serif]`
- Items: `font-['Poppins',sans-serif] text-[14px]`
- Props: `label`, `required`, `error`, `helperText`, `placeholder`, `options: {value, label}[]`, `value`, `onValueChange`, `disabled`

### 4.4 GovRadio (`gov-radio.tsx`)
- Layout: `flex gap-6` (horizontal)
- Radio input: `w-4 h-4 text-[#1f3a5f] border-gray-300 cursor-pointer focus:ring-2 focus:ring-[#1f3a5f]/20`
- Option label: `text-[14px] text-gray-700 font-['Poppins',sans-serif]`
- Props: `label`, `required`, `error`, `helperText`, `options: {value, label}[]`, `value`, `onChange`, `disabled`, `name`

---

## 5. PAGE-LEVEL DESIGN PATTERNS

### 5.1 Form Section (THE PRIMARY PATTERN)
This is the canonical form layout. Use this for ALL forms:
```jsx
<div>
  <h3 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">
    Section Title
  </h3>
  <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
    <div className="grid grid-cols-3 gap-x-8 gap-y-5">
      <GovInput label="Field 1" required value={...} onChange={...} />
      <GovSelect label="Field 2" required options={[...]} value={...} onValueChange={...} />
      <GovInput label="Field 3" value={...} onChange={...} />
    </div>
  </div>
</div>
```
Key rules:
- Section header: `text-xl font-semibold text-[#1f3a5f]` (plain text, NOT inside a colored bar)
- Field container: `bg-[#f8fafc] rounded-lg border border-gray-200 p-6`
- Field grid: `grid grid-cols-3 gap-x-8 gap-y-5`
- Multiple sections separated by: `space-y-8` on parent container
- Action buttons: Right-aligned at bottom: `flex justify-end gap-4 mt-6`

### 5.2 Dashboard Page
```jsx
<div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
  {/* Page Header */}
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">Title</h1>
      <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">Description</p>
    </div>
    <button className="px-4 py-2 bg-[#1f3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-['Poppins',sans-serif] text-sm font-medium">
      Refresh
    </button>
  </div>
  {/* Search/Filter Bar */}
  <GovSearchFilter ... />
  {/* Data Table */}
  <GovTable ... />
</div>
```

---

## 6. GOV TABLE COMPONENT (`/src/app/components/ui/gov-table.tsx`)

THIS IS THE SINGLE TABLE DESIGN USED ACROSS ALL ROLES AND ALL MODULES.
No other table style exists. Every table must use this component or match this exact styling.

### 6.1 Table Styling Specification (Formal Blue-Tinted)

```
WRAPPER:    bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden
SCROLL:     overflow-x-auto gov-table-scroll  (custom scrollbar class)
TABLE:      w-full min-w-[1200px]
THEAD:      bg-[#27548a]/10 backdrop-blur-[4px]
THEAD TR:   border-b border-[#170F49]
TH:         px-4 py-3 text-center text-[14px] font-semibold text-[#170f49]
            tracking-[0.56px] uppercase font-['Poppins',sans-serif]
TH (#):     Same as above but font-bold w-[50px]
TBODY:      divide-y divide-gray-200
TR:         hover:bg-gray-50 transition-colors
TD:         px-4 py-4 text-center text-[14px] text-gray-700 font-['Poppins',sans-serif]
TD (ID):    Same as above but font-medium text-[#1f3a5f]  (highlighted column)
ACTION BTN: inline-flex items-center gap-1.5 px-4 py-2 bg-[#1f3a5f] text-white
            rounded-lg font-['Poppins',sans-serif] font-medium text-sm
            hover:bg-[#2d4a6f] transition-colors mx-auto
```

### 6.2 Full Component Code

Create `/src/app/components/ui/gov-table.tsx` with:

```tsx
import * as React from "react";
import { cn } from "./utils";

// ─── Column Definition ──────────────────────────────────────────────────────
export interface GovTableColumn<T> {
  key: string;
  header: string;
  width?: string;           // e.g. "w-[180px]"
  align?: "left" | "center" | "right";
  highlight?: boolean;      // bold + brand color for ID columns
  render?: (row: T, index: number) => React.ReactNode;
  accessor?: keyof T;
}

// ─── Props ──────────────────────────────────────────────────────────────────
export interface GovTableProps<T> {
  columns: GovTableColumn<T>[];
  data: T[];
  rowKey?: (row: T, index: number) => string;
  showSerialNo?: boolean;
  onRowClick?: (row: T, index: number) => void;
  loading?: boolean;
  loadingText?: string;
  emptyMessage?: string;
  minWidth?: string;        // e.g. "1200px"
  className?: string;
  serialNoLabel?: string;
}

export function GovTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  showSerialNo = true,
  onRowClick,
  loading = false,
  loadingText = "Loading...",
  emptyMessage = "No records found",
  minWidth,
  className,
  serialNoLabel = "#",
}: GovTableProps<T>) {
  const wrapperClass = cn(
    "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
    className
  );

  const getThClass = (col?: GovTableColumn<T>, isSerial?: boolean) => {
    const align = col && col.align ? "text-" + col.align : "text-center";
    return cn(
      "px-4 py-3 font-['Poppins',sans-serif] text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase",
      isSerial ? "text-center font-bold" : align,
      col && col.width
    );
  };

  const getTdClass = (col?: GovTableColumn<T>, isSerial?: boolean) => {
    const align = col && col.align ? "text-" + col.align : isSerial ? "text-center" : "text-center";
    const isHighlight = col && col.highlight;
    return cn(
      "px-4 py-4 font-['Poppins',sans-serif] text-[14px]",
      align,
      isHighlight ? "font-medium text-[#1f3a5f]" : "text-gray-700"
    );
  };

  const getCellValue = (row: T, col: GovTableColumn<T>, index: number) => {
    if (col.render) return col.render(row, index);
    if (col.accessor) {
      const val = row[col.accessor];
      return val !== undefined && val !== null && val !== "" ? String(val) : "N/A";
    }
    const val = row[col.key as keyof T];
    return val !== undefined && val !== null && val !== "" ? String(val) : "N/A";
  };

  if (loading) {
    return (
      <div className={wrapperClass}>
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f]" />
          <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">{loadingText}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={wrapperClass}>
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500 font-['Poppins',sans-serif]">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className="overflow-x-auto gov-table-scroll">
        <table className="w-full" style={minWidth ? { minWidth } : undefined}>
          <thead className="bg-[#27548a]/10 backdrop-blur-[4px]">
            <tr className="border-b border-[#170F49]">
              {showSerialNo && (
                <th className={cn(getThClass(undefined, true), "w-[50px]")}>{serialNoLabel}</th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={getThClass(col)}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => {
              const key = rowKey ? rowKey(row, index) : String(index);
              return (
                <tr
                  key={key}
                  className={cn("hover:bg-gray-50 transition-colors", onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                >
                  {showSerialNo && (
                    <td className={getTdClass(undefined, true)}>
                      <span className="font-medium">{index + 1}</span>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={getTdClass(col)}>
                      {getCellValue(row, col, index)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  submitted:                    "bg-blue-100 text-blue-800 border-blue-300",
  "Received from Citizen":      "bg-blue-100 text-blue-800 border-blue-300",
  underReview:                  "bg-yellow-100 text-yellow-800 border-yellow-300",
  sentToFieldEngineer:          "bg-indigo-100 text-indigo-800 border-indigo-300",
  sentToRevenueOfficer:         "bg-purple-100 text-purple-800 border-purple-300",
  sentToCommissioner:           "bg-pink-100 text-pink-800 border-pink-300",
  approved:                     "bg-green-100 text-green-800 border-green-300",
  rejected:                     "bg-red-100 text-red-800 border-red-300",
  pendingPayment:               "bg-orange-100 text-orange-800 border-orange-300",
};

export function GovStatusBadge({ status, label, icon, className }: {
  status: string; label?: string; icon?: React.ReactNode; className?: string;
}) {
  const colorClass = STATUS_STYLES[status] || "bg-gray-100 text-gray-800 border-gray-200";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border",
      colorClass, className
    )}>
      {icon}{label || status}
    </span>
  );
}

// ─── Queue Badge ─────────────────────────────────────────────────────────────
const QUEUE_COLORS: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-green-100 text-green-800 border-green-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

export function GovQueueBadge({ label, color = "blue", className }: {
  label: string; color?: string; className?: string;
}) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Poppins',sans-serif] border",
      QUEUE_COLORS[color] || QUEUE_COLORS.blue, className
    )}>
      {label}
    </span>
  );
}

// ─── Action Button ───────────────────────────────────────────────────────────
export function GovTableActionButton({ label = "View", icon, onClick, className }: {
  label?: string; icon?: React.ReactNode; onClick: () => void; className?: string;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 bg-[#1f3a5f] text-white rounded-lg",
        "font-['Poppins',sans-serif] font-medium text-sm hover:bg-[#2d4a6f] transition-colors mx-auto",
        className
      )}
    >
      {icon}{label}
    </button>
  );
}

// ─── Search + Filter Bar ─────────────────────────────────────────────────────
export function GovSearchFilter({ searchValue, onSearchChange, searchPlaceholder = "Search...",
  searchIcon, filterValue, onFilterChange, filterOptions, filterIcon, className, children,
}: {
  searchValue: string; onSearchChange: (v: string) => void; searchPlaceholder?: string;
  searchIcon?: React.ReactNode; filterValue?: string; onFilterChange?: (v: string) => void;
  filterOptions?: { value: string; label: string }[]; filterIcon?: React.ReactNode;
  className?: string; children?: React.ReactNode;
}) {
  return (
    <div className={cn("bg-white rounded-lg shadow-md p-4 mb-6", className)}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            {searchIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{searchIcon}</div>}
            <input
              type="text" placeholder={searchPlaceholder} value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                "w-full pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px]",
                "focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all",
                searchIcon ? "pl-10" : "pl-4"
              )}
            />
          </div>
        </div>
        {filterOptions && onFilterChange && (
          <div className="md:w-64">
            <div className="relative">
              {filterIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{filterIcon}</div>}
              <select value={filterValue} onChange={(e) => onFilterChange(e.target.value)}
                className={cn(
                  "w-full pr-4 py-2.5 border border-gray-300 rounded-md font-['Poppins',sans-serif] text-[14px]",
                  "focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-[#1f3a5f] transition-all appearance-none bg-white",
                  filterIcon ? "pl-10" : "pl-4"
                )}
              >
                {filterOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
```

### 6.3 Usage Example
```tsx
import { GovTable, GovStatusBadge, GovQueueBadge, GovTableActionButton, GovSearchFilter } from "../ui/gov-table";
import { Eye, Search, Filter } from "lucide-react";

const columns = [
  { key: "applicationNo", header: "Application No", width: "w-[180px]", highlight: true },
  { key: "applicantName", header: "Applicant Name", width: "w-[180px]" },
  { key: "connectionType", header: "Connection Type", width: "w-[150px]" },
  {
    key: "status", header: "Status", width: "w-[160px]",
    render: (row) => <GovStatusBadge status={row.status} />,
  },
  {
    key: "queue", header: "Queue", width: "w-[120px]",
    render: (row) => <GovQueueBadge label="Revenue Officer" color="purple" />,
  },
  {
    key: "action", header: "Action", width: "w-[120px]",
    render: (row) => (
      <GovTableActionButton label="View" icon={<Eye className="w-4 h-4" />} onClick={() => handleView(row)} />
    ),
  },
];

<GovSearchFilter
  searchValue={search} onSearchChange={setSearch}
  searchPlaceholder="Search by Application ID, Name..."
  searchIcon={<Search className="w-5 h-5" />}
  filterValue={statusFilter} onFilterChange={setStatusFilter}
  filterOptions={[{ value: "all", label: "All Status" }, { value: "approved", label: "Approved" }]}
  filterIcon={<Filter className="w-5 h-5" />}
/>
<GovTable
  columns={columns}
  data={applications}
  rowKey={(row) => row.id}
  showSerialNo={true}
  loading={isLoading}
  emptyMessage="No applications found"
  minWidth="1200px"
  onRowClick={(row) => setSelected(row)}
/>
```

---

## 7. GOV SIDEBAR COMPONENT (`/src/app/components/ui/gov-sidebar.tsx`)

THIS IS THE SINGLE SIDEBAR DESIGN USED ACROSS ALL ROLES.
Every sidebar must use this component or match this exact pattern.
IF THE PROJECT ALREADY HAS A SIDEBAR/NAVBAR, REPLACE ITS VISUAL DESIGN WITH THIS.
Keep the existing navigation items, routes, and onClick handlers.

### 7.1 Sidebar Styling Specification

```
CONTAINER:      w-64 bg-white h-screen border-r border-gray-200 flex flex-col
HEADER:         px-6 py-5 border-b border-gray-200
HEADER TITLE:   text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]
HEADER SUBTITLE: text-sm text-gray-600 font-['Poppins',sans-serif] mt-1
NAV CONTAINER:  flex-1 overflow-y-auto py-4 px-3
PARENT ITEM:    h-[45px] w-full rounded-[10px] flex items-center justify-between px-4
                transition-colors
PARENT ACTIVE:  bg-[#1f3a5f] text-white
PARENT INACTIVE: text-[#1b212d] hover:bg-[#e3f2fd]
PARENT ICON:    w-5 h-5
PARENT TEXT:    text-sm font-semibold font-['Poppins',sans-serif]
CHEVRON:        w-4 h-4 transition-transform duration-200
                (rotated 180deg when expanded)
CHILDREN WRAP:  pl-3 mt-2 flex flex-col gap-1
CHILD ITEM:     h-[39.5px] w-full rounded-lg flex items-center px-3
                text-[13px] font-medium font-['Poppins',sans-serif] transition-colors
CHILD ACTIVE:   bg-[#e3f2fd] text-[#1f3a5f]
CHILD INACTIVE: text-[#1b212d] hover:bg-gray-50
```

### 7.2 Data-Driven Sidebar Architecture

The sidebar is DATA-DRIVEN. You define menu items as a config array, and the component renders
expandable/collapsible parent items with animated chevrons + child items.

```tsx
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface SidebarChildItem {
  label: string;
  path: string;
}

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;           // lucide-react icon element
  basePath: string;                 // used to determine active state
  children: SidebarChildItem[];
  defaultOpen?: boolean;
}

interface GovSidebarProps {
  title: string;                    // e.g. "Caseworker Panel"
  subtitle?: string;                // e.g. "Review & Process"
  menuItems: SidebarMenuItem[];
  activePath: string;               // current route path
  onNavigate: (path: string) => void;
  storagePrefix?: string;           // localStorage key prefix, e.g. "caseworkerSidebar"
  footer?: React.ReactNode;         // optional footer content (e.g. mobile link button)
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function GovSidebar({
  title, subtitle, menuItems, activePath, onNavigate, storagePrefix = "sidebar", footer
}: GovSidebarProps) {
  // Persist expand/collapse state per menu item in localStorage
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      const saved = localStorage.getItem(storagePrefix + "_" + item.id);
      initial[item.id] = saved !== null ? saved !== "false" : item.defaultOpen !== false;
    });
    return initial;
  });

  useEffect(() => {
    Object.entries(openSections).forEach(([id, isOpen]) => {
      localStorage.setItem(storagePrefix + "_" + id, isOpen.toString());
    });
  }, [openSections, storagePrefix]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mt-1">{subtitle}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isParentActive = activePath.startsWith(item.basePath);
            const isOpen = openSections[item.id];

            return (
              <div key={item.id}>
                {/* Parent Item — Expand/Collapse Toggle */}
                <button
                  onClick={() => toggleSection(item.id)}
                  className={
                    "h-[45px] w-full rounded-[10px] flex items-center justify-between px-4 transition-colors " +
                    (isParentActive
                      ? "bg-[#1f3a5f] text-white"
                      : "text-[#1b212d] hover:bg-[#e3f2fd]")
                  }
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm font-semibold font-['Poppins',sans-serif]">
                      {item.label}
                    </span>
                  </div>
                  <ChevronDown
                    className={
                      "w-4 h-4 transition-transform duration-200 " +
                      (isOpen ? "rotate-180" : "")
                    }
                  />
                </button>

                {/* Child Items — Shown when expanded */}
                {isOpen && (
                  <div className="pl-3 mt-2 flex flex-col gap-1">
                    {item.children.map((child) => (
                      <button
                        key={child.path}
                        onClick={() => onNavigate(child.path)}
                        className={
                          "h-[39.5px] w-full rounded-lg flex items-center px-3 text-[13px] font-medium font-['Poppins',sans-serif] transition-colors " +
                          (activePath === child.path
                            ? "bg-[#e3f2fd] text-[#1f3a5f]"
                            : "text-[#1b212d] hover:bg-gray-50")
                        }
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Optional Footer */}
      {footer && (
        <div className="border-t border-gray-200 p-4">{footer}</div>
      )}
    </div>
  );
}
```

### 7.3 Usage Example
```tsx
import GovSidebar from "../ui/gov-sidebar";
import { FileText, Wrench } from "lucide-react";

const caseworkerMenuItems = [
  {
    id: "plumberLicense",
    label: "Plumber License",
    icon: <Wrench className="w-5 h-5" />,
    basePath: "/jalanidhi/caseworker/plumber-license",
    children: [
      { label: "New Application", path: "/jalanidhi/caseworker/plumber-license/new-applications" },
      { label: "Renewal of License", path: "/jalanidhi/caseworker/plumber-license/renewal" },
    ],
  },
  {
    id: "tapConnection",
    label: "Tap Connection",
    icon: <FileText className="w-5 h-5" />,
    basePath: "/jalanidhi/caseworker/tap-connection",
    children: [
      { label: "New Connection Requests", path: "/jalanidhi/caseworker/tap-connection/new-requests" },
      { label: "Disconnection Requests", path: "/jalanidhi/caseworker/tap-connection/disconnection-requests" },
      { label: "Reconnection Requests", path: "/jalanidhi/caseworker/tap-connection/reconnection-requests" },
      { label: "Change of Connection Type", path: "/jalanidhi/caseworker/tap-connection/change-connection-type" },
    ],
  },
];

<GovSidebar
  title="Caseworker Panel"
  subtitle="Review & Process"
  menuItems={caseworkerMenuItems}
  activePath={activePath}
  onNavigate={handleNavigation}
  storagePrefix="caseworkerSidebar"
/>
```

### 7.4 Layout Integration (Sidebar + Content Area)
```tsx
<div className="min-h-screen flex flex-col bg-[#f5f5fa]">
  {/* Header — Fixed top */}
  <div className="w-full sticky top-0 z-50">
    <Header />
  </div>

  {/* Main Layout */}
  <div className="flex flex-1 relative">
    {/* Sidebar — Sticky, full height */}
    <div className="sticky top-0 h-screen">
      <GovSidebar
        title="Panel Title"
        subtitle="Subtitle"
        menuItems={menuItems}
        activePath={activePath}
        onNavigate={handleNavigation}
        storagePrefix="panelSidebar"
      />
    </div>

    {/* Content Area */}
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 px-[24px] py-[17.5px]">
        {/* breadcrumb content */}
      </div>
      {/* Page Content */}
      {renderContent()}
    </div>
  </div>
</div>
```

---

## 8. CUSTOM SCROLLBAR CSS

Add this to `/src/styles/index.css` AFTER the font/theme imports.
This replaces ALL system scrollbars with a branded navy-blue pill design.

```css
/* ============================================================================
   Jalanidhi Custom Scrollbar — Navy Blue Pill Design
   ============================================================================ */

/* Webkit browsers (Chrome, Safari, Edge) */
*::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}

*::-webkit-scrollbar-track {
  background: #e8ecf1;
  border-radius: 10px;
  margin: 4px;
}

*::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #1f3a5f 0%, #27548a 100%);
  border-radius: 10px;
  border: 2px solid #e8ecf1;
  min-width: 60px;
  min-height: 60px;
}

*::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, #15283f 0%, #1f3a5f 100%);
}

*::-webkit-scrollbar-thumb:active {
  background: #15283f;
}

*::-webkit-scrollbar-corner {
  background: transparent;
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #1f3a5f #e8ecf1;
}

/* Table-specific scroll container — slightly taller */
.gov-table-scroll::-webkit-scrollbar {
  height: 12px;
}

.gov-table-scroll::-webkit-scrollbar-track {
  background: #e8ecf1;
  border-radius: 10px;
  margin: 0 8px;
}

.gov-table-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #1f3a5f 0%, #27548a 100%);
  border-radius: 10px;
  border: 2px solid #e8ecf1;
}
```

Every `overflow-x-auto` wrapper around a table MUST also include the `gov-table-scroll` class:
```html
<div className="overflow-x-auto gov-table-scroll">
  <table>...</table>
</div>
```

---

## 9. DATE PICKER STYLES

Add these to `/src/styles/index.css` after the scrollbar CSS:
```css
.react-datepicker { font-family: 'Poppins', sans-serif !important; border: 1px solid #d3d8ff !important; border-radius: 8px !important; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1) !important; }
.react-datepicker__header { background-color: #1f3a5f !important; border-bottom: none !important; border-radius: 8px 8px 0 0 !important; }
.react-datepicker__current-month { color: white !important; font-weight: 600 !important; }
.react-datepicker__day-name { color: white !important; }
.react-datepicker__day--selected { background-color: #0078a0 !important; color: white !important; }
.react-datepicker__day--today { color: #0078a0 !important; border: 1px solid #0078a0 !important; }
.react-datepicker__day:hover { background-color: #e8f4f8 !important; color: #0078a0 !important; }
.react-datepicker__navigation:hover *::before { border-color: #f9a825 !important; }
```

---

## 10. OTHER UI PATTERNS

### 10.1 Status Badge (Standalone)
```jsx
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Poppins',sans-serif] font-medium border bg-green-100 text-green-800 border-green-300">
  <CheckCircle className="w-3.5 h-3.5" />
  Approved
</span>
```

### 10.2 Modal/Popup
```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]" onClick={onClose} />
  <div className="relative bg-white rounded-[8px] shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)] w-[470px] px-[24px] py-[32px] flex flex-col gap-[24px]">
    <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_8px_0px_rgba(0,0,0,0.25)]" />
    {/* Content */}
  </div>
</div>
```
Modal buttons: Cancel = cyan outline pill (`rounded-[24px] border-[#0078a0] text-[#0078a0]`), Submit = cyan filled pill (`bg-[#0078a0] text-white rounded-[24px]`)

### 10.3 Read-Only Field (Detail Views)
```jsx
<div className="flex flex-col gap-[6px] min-w-0">
  <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#170f49]">Label</p>
  <p className="font-['Poppins',sans-serif] text-[14px] text-[#414141]">Value</p>
</div>
```

### 10.4 Loading Spinner
```jsx
<div className="flex items-center justify-center h-[calc(100vh-200px)]">
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f] mx-auto"></div>
    <p className="mt-4 text-gray-600 font-['Poppins',sans-serif]">Loading...</p>
  </div>
</div>
```

### 10.5 Success Screen
```jsx
<div className="p-10 flex flex-col items-center text-center">
  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
    <CheckCircle2 className="w-10 h-10 text-green-600" />
  </div>
  <h2 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3">Success!</h2>
  <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 mb-6">
    <p className="text-sm text-blue-700 font-['Poppins',sans-serif]">
      ID: <span className="font-bold font-mono text-[#1f3a5f]">{id}</span>
    </p>
  </div>
</div>
```

### 10.6 File Upload
- Dropzone: `border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1f3a5f] cursor-pointer`
- Uploaded preview: `flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3`

### 10.7 Declaration Checkbox
```jsx
<div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
  <label className="flex items-start gap-3 cursor-pointer">
    <input type="checkbox" className="w-4 h-4 text-[#1f3a5f] border-gray-300 rounded focus:ring-2 focus:ring-[#1f3a5f]/20 mt-1" />
    <span className="text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed">Declaration text...</span>
  </label>
</div>
```

---

## 11. CODING CONVENTIONS

### 11.1 Null Safety (CRITICAL)
- **Client-side (React)**: Use explicit `&&` null checks with `'N/A'` fallbacks. NEVER use optional chaining (`?.`).
  - CORRECT: `app && app.details && app.details.name ? app.details.name : 'N/A'`
  - WRONG: `app?.details?.name ?? 'N/A'`
- **Server-side (Deno)**: Optional chaining (`?.`) is fine.

### 11.2 State Persistence
All UI state must be persisted to localStorage:
```jsx
const [value, setValue] = useState(() => {
  const saved = localStorage.getItem('componentName_key');
  return saved ? JSON.parse(saved) : defaultValue;
});
useEffect(() => {
  localStorage.setItem('componentName_key', JSON.stringify(value));
}, [value]);
```

### 11.3 API Pattern
```jsx
import { projectId, publicAnonKey } from '/utils/supabase/info';
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-698be164/route`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
  }
);
```
Always log errors with `[COMPONENT_NAME]` prefix.

### 11.4 Date Formatting
```jsx
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
```

---

## 12. REQUIRED PACKAGES

Ensure these are installed:
- `lucide-react` (icons)
- `class-variance-authority` (GovButton variants)
- `clsx` + `tailwind-merge` (cn utility)
- `@radix-ui/react-slot` (GovButton asChild)
- `@radix-ui/react-select` (GovSelect)
- `react-datepicker` + `@types/react-datepicker` (date inputs)

---

## 13. SHADOWS REFERENCE

| Usage | Shadow |
|-------|--------|
| Main card | `shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)]` |
| Dashboard card | `shadow-md` |
| Light card | `shadow-sm` |
| Modal | `shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)]` |
| Modal inner | `shadow-[inset_0px_0px_8px_0px_rgba(0,0,0,0.25)]` |
| Form input | `shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)]` |
| Button | `shadow-[0px_2.45px_7.841px_0px_rgba(8,15,52,0.06)]` |

---

## 14. REFACTORING RULES (FOR EXISTING PROJECTS)

When this prompt is applied to a project that ALREADY has UI components, follow these rules:

### 14.1 Sidebar/Navbar Replacement
If the project already has a sidebar, navbar, or navigation component:
1. IDENTIFY the existing navigation component(s) and their menu items/routes
2. EXTRACT the list of {label, path, icon} items from the existing component
3. REPLACE the visual markup with the GovSidebar pattern (Section 7)
4. PRESERVE all existing `onNavigate`/`onClick` handlers, route paths, and active state logic
5. ADD localStorage persistence for expand/collapse states
6. DO NOT change the route strings or navigation handler functions

### 14.2 Table Replacement
If the project already has data tables:
1. IDENTIFY all `<table>` elements or table components
2. REPLACE their header/body styling with the formal blue-tinted spec (Section 6.1)
3. ADD the `gov-table-scroll` class to the `overflow-x-auto` wrapper
4. PRESERVE all existing column definitions, data sources, render functions, and onClick handlers
5. DO NOT change the data fetching logic or row action handlers

### 14.3 Scrollbar Replacement
1. ADD the custom scrollbar CSS from Section 8 to `/src/styles/index.css`
2. This applies GLOBALLY — no need to add classes to every scrollable element
3. ADD `gov-table-scroll` class specifically to table overflow wrappers

### 14.4 Safety Guarantee
These changes are VISUAL ONLY. They affect:
- CSS classes on existing elements
- Wrapper div class names
- Font family declarations
- Color tokens

They do NOT affect:
- State management (useState, useEffect)
- API calls (fetch, response handling)
- Event handlers (onClick, onChange)
- Navigation logic
- Data structures or types
- Business logic or validation

 * ============================================================================
 * END OF PROMPT DOCUMENT
 * ============================================================================
 */

// This file is documentation only. It exports nothing and is not imported anywhere.
// It exists solely as a reference you can copy-paste into other Figma Make projects.
export {};