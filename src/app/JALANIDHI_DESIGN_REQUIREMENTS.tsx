/**
 * ============================================================================
 * JALANIDHI DESIGN REQUIREMENTS - COMPLETE SPECIFICATION REFERENCE (v1)
 * ============================================================================
 *
 * This file is a NON-RUNTIME reference document that captures every design
 * decision, color, font, spacing rule, component, navigation element, and
 * coding convention used across the Jalanidhi (KMDS) portal.
 *
 * PURPOSE:
 * --------
 * Paste the relevant sections into a new Figma Make session's "Background"
 * field so the AI can reproduce the exact same look, feel, and architecture
 * in a fresh project — or use it as a checklist when extending this one.
 *
 * ============================================================================
 *
 *
 * ============================================================================
 * TABLE OF CONTENTS
 * ============================================================================
 *
 *   1.  COLOR SYSTEM (Primary, Secondary, Accent, Neutral, Semantic, Roles)
 *   2.  FONT SYSTEM (Family, Weights, Size Scale, Hierarchy)
 *   3.  SPACING & GRID RULES (8pt Grid, Page Padding, Form Grids)
 *   4.  BORDER RADIUS SYSTEM (Rounded styles per element)
 *   5.  SHADOW SYSTEM (Elevation levels)
 *   6.  COMPONENT INVENTORY
 *       6A.  Form Inputs (GovInput, GovSelect, GovRadio, GovDatePicker, GovMultiSelect)
 *       6B.  Buttons (GovButton - 8 variants, 4 sizes)
 *       6C.  Tables (GovTable - 2 variants + helpers)
 *       6D.  Badges (GovStatusBadge, GovQueueBadge, Inline Badges)
 *       6E.  Modals / Popups
 *       6F.  File Upload / Dropzone
 *       6G.  Declaration Checkbox
 *       6H.  Loading Spinner / Empty State / Success Screen
 *       6I.  Read-Only Detail Fields
 *       6J.  Remarks Timeline (RemarksTimeline)
 *   7.  NAVIGATION ELEMENTS
 *       7A.  Sidebar (GovSidebar pattern)
 *       7B.  Top Header Bar
 *       7C.  Breadcrumbs
 *       7D.  Tabs
 *   8.  PAGE-LEVEL LAYOUT PATTERNS
 *       8A.  App Shell (Header + Sidebar + Content + Footer)
 *       8B.  Form Page Pattern
 *       8C.  Dashboard/List Page Pattern
 *       8D.  Detail/View Page Pattern
 *   9.  CODING CONVENTIONS
 *       9A.  Null Safety (&&, 'N/A' fallbacks, no ?.)
 *       9B.  State Persistence (localStorage pattern)
 *       9C.  API Fetch Pattern (projectId, publicAnonKey)
 *       9D.  Error Logging
 *       9E.  Date Formatting
 *       9F.  GovSelect Fallback Rule (__none__)
 *   10. REQUIRED PACKAGES
 *   11. CUSTOM CSS (Scrollbar, DatePicker)
 *   12. MULTI-ACTOR ROLE ARCHITECTURE
 *   13. CRITICAL RULES SUMMARY
 *
 * ============================================================================
 *
 *
 * ============================================================================
 * 1. COLOR SYSTEM
 * ============================================================================
 *
 * 1.1 PRIMARY BRAND COLORS
 * ─────────────────────────────────────────────────────────────────────────────
 * | Token              | Hex       | Usage                                     |
 * |--------------------|-----------|-----------------------------------------  |
 * | Gov Blue (Primary) | #1f3a5f   | Page headings, sidebar active, primary    |
 * |                    |           | buttons, section titles, highlighted IDs,  |
 * |                    |           | scrollbar thumb gradient start             |
 * | Gov Blue Dark      | #15283f   | Button active/pressed, scrollbar hover    |
 * | Gov Blue Hover     | #2d4f7f   | Button hover state                        |
 * | Gov Blue Gradient  | #27548a   | Table header bg tint, gradient card end,  |
 * |                    |           | scrollbar thumb gradient end               |
 * | Gov Gold (Accent)  | #f9a825   | Date picker nav hover, gold highlights,   |
 * |                    |           | accent button bg, gold underline accents   |
 * | Gov Gold Dark      | #d4a017   | Gold button border                        |
 * | Gov Gold Hover     | #e6991f   | Gold button hover state                   |
 *
 *
 * 1.2 FUNCTIONAL ACCENT COLORS
 * ─────────────────────────────────────────────────────────────────────────────
 * | Token               | Hex       | Usage                                    |
 * |---------------------|-----------|----------------------------------------  |
 * | Accent Cyan         | #0078a0   | Date picker selected day, modal buttons, |
 * |                     |           | action links                              |
 * | Accent Cyan Hover   | #006b8f   | Cyan button hover                        |
 * | Accent Cyan Bright  | #009fbc   | Accent button variant bg                  |
 * | Link Blue           | #0066cc   | Text links, breadcrumb links              |
 * | Light Blue          | #91c7ff   | Secondary button bg, header accent        |
 *
 *
 * 1.3 TEXT COLORS
 * ─────────────────────────────────────────────────────────────────────────────
 * | Token            | Hex/Class      | Usage                                  |
 * |------------------|----------------|--------------------------------------  |
 * | Text Primary     | #170f49        | Table headers (th), detail labels,     |
 * |                  |                | modal titles, date picker day text      |
 * | Text Secondary   | #414141        | Body text, detail values, table cells   |
 * | Text Body        | #1b212d        | Sidebar nav items (inactive)            |
 * | Gray 900         | text-gray-900  | Input text, estimation row values       |
 * | Gray 700         | text-gray-700  | Form labels, table cells, body text     |
 * | Gray 600         | text-gray-600  | Page subtitles, helper text, loading    |
 * | Gray 500         | text-gray-500  | Empty states, disabled text,            |
 * |                  |                | breadcrumb current page                 |
 * | Gray 400         | text-gray-400  | Placeholders, icons, separators         |
 * | White            | text-white     | On dark backgrounds (buttons, sidebar,  |
 * |                  |                | gradient headers)                        |
 * | Black            | text-black     | Header branding bar ONLY                |
 * | Red 600          | text-red-600   | Error messages, required asterisks      |
 *
 *
 * 1.4 BACKGROUND COLORS
 * ─────────────────────────────────────────────────────────────────────────────
 * | Token             | Value                               | Usage            |
 * |-------------------|-------------------------------------|----------------- |
 * | Page Background   | bg-[#f5f5fa]                        | Full page bg     |
 * | Section Background| bg-[#f8fafc]                        | Form field boxes |
 * | Card Background   | bg-white                            | Cards, sidebar,  |
 * |                   |                                     | table wrappers   |
 * | Table Header BG   | bg-[#27548a]/10 backdrop-blur-[4px] | Formal table     |
 * |                   |                                     | header (blue     |
 * |                   |                                     | tinted)          |
 * | Table Header BG   | bg-[#f8f9fa]                        | Standard table   |
 * | (Standard)        |                                     | header (gray)    |
 * | Scrollbar Track   | #e8ecf1                             | All scrollbars   |
 *
 *
 * 1.5 SIDEBAR STATE COLORS
 * ─────────────────────────────────────────────────────────────────────────────
 * | State              | Classes                                               |
 * |--------------------|----------------------------------------------------  |
 * | Parent Active      | bg-[#1f3a5f] text-white                               |
 * | Parent Hover       | hover:bg-[#e3f2fd]                                    |
 * | Child Active       | bg-[#e3f2fd] text-[#1f3a5f]                           |
 * | Child Hover        | hover:bg-gray-50                                      |
 *
 *
 * 1.6 STATUS BADGE COLORS (Application Workflow)
 * ─────────────────────────────────────────────────────────────────────────────
 * | Status                    | Badge Classes                                  |
 * |---------------------------|----------------------------------------------- |
 * | Submitted / Received      | bg-blue-100 text-blue-800 border-blue-300      |
 * | Under Review              | bg-yellow-100 text-yellow-800 border-yellow-300|
 * | Sent to Field Engineer    | bg-indigo-100 text-indigo-800 border-indigo-300|
 * | Sent to Revenue Officer   | bg-purple-100 text-purple-800 border-purple-300|
 * | Sent to Commissioner      | bg-pink-100 text-pink-800 border-pink-300      |
 * | Approved                  | bg-green-100 text-green-800 border-green-300   |
 * | Rejected                  | bg-red-100 text-red-800 border-red-300         |
 * | Pending Payment           | bg-orange-100 text-orange-800 border-orange-300|
 * | Active (generic)          | bg-green-100 text-green-700                    |
 * | Inactive (generic)        | bg-gray-100 text-gray-600                      |
 * | Not Assigned              | bg-orange-100 text-orange-700                  |
 * | Assigned                  | bg-green-100 text-green-700                    |
 * | Forwarded to FE           | bg-blue-100 text-blue-700                      |
 * | Approved by FE            | bg-green-100 text-green-700                    |
 * | Rejected by FE            | bg-red-100 text-red-700                        |
 *
 *
 * 1.7 REMARKS TIMELINE ROLE COLORS
 * ─────────────────────────────────────────────────────────────────────────────
 * | Role             | Dot           | Background   | Border          | Text          |
 * |------------------|---------------|------------- |-----------------|-------------- |
 * | Citizen          | bg-blue-500   | bg-blue-50   | border-blue-200 | text-blue-800 |
 * | Plumber          | bg-teal-500   | bg-teal-50   | border-teal-200 | text-teal-800 |
 * | Caseworker       | bg-sky-600    | bg-sky-50    | border-sky-200  | text-sky-800  |
 * | Revenue Officer  | bg-amber-500  | bg-amber-50  | border-amber-200| text-amber-800|
 * | Field Engineer   | bg-indigo-500 | bg-indigo-50 | border-indigo-200| text-indigo-800|
 * | Commissioner     | bg-[#1f3a5f]  | bg-gray-50   | border-gray-200 | text-[#1f3a5f]|
 *
 *
 * ============================================================================
 * 2. FONT SYSTEM
 * ============================================================================
 *
 * 2.1 FONT FAMILY
 * ─────────────────────────────────────────────────────────────────────────────
 * Primary:  Poppins (Google Fonts)
 * Import:   @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
 * Tailwind: font-['Poppins',sans-serif]
 *
 * RULE: Every single text element MUST include font-['Poppins',sans-serif].
 *       No element may omit this. This is the #1 consistency rule.
 *
 * Header-only exception: Outfit:Bold used for font size controls (A-/A+)
 *
 *
 * 2.2 FONT WEIGHTS USED
 * ─────────────────────────────────────────────────────────────────────────────
 * | Weight  | Tailwind Class  | Usage                                         |
 * |---------|-----------------|---------------------------------------------- |
 * | 300     | font-light      | Rarely used (reserved)                        |
 * | 400     | font-normal     | Government name in header branding            |
 * | 500     | font-medium     | Form labels, body text, table cells, sidebar  |
 * |         |                 | child items, button text, date picker days     |
 * | 600     | font-semibold   | Section titles, sidebar parent items, table   |
 * |         |                 | headers, page subtitles, bold buttons,         |
 * |         |                 | department name in header, badges              |
 * | 700     | font-bold       | Page titles (h1), serial # column headers,    |
 * |         |                 | application IDs, amount values, success text   |
 *
 *
 * 2.3 FONT SIZE SCALE
 * ─────────────────────────────────────────────────────────────────────────────
 * | Size     | Tailwind Class   | Usage                                       |
 * |----------|------------------|-------------------------------------------- |
 * | 11px     | text-[11px]      | Tab count badges                            |
 * | 12px     | text-[12px]      | Status badges (inline), date picker days,    |
 * |          |                  | action button labels in table cells           |
 * | 13px     | text-[13px]      | Error messages, sidebar child items,          |
 * |          |                  | standard table th, GovButton sm, field labels |
 * |          |                  | (read-only detail views)                      |
 * | 14px     | text-[14px]      | Form input labels, form input text, table     |
 * |          |                  | cells, body text, detail labels/values,        |
 * |          |                  | formal table th, GovButton default, sidebar    |
 * |          |                  | header subtitle, breadcrumbs                  |
 * | 15px     | text-[15px]      | Estimation row text, total labels              |
 * | 16px     | text-[16px]      | Government name header, GovButton lg/xl       |
 * | sm       | text-sm (14px)   | Sidebar parent items, button text, helper text|
 * | base     | text-base (16px) | Report sub-section headers, amount values     |
 * | md       | text-md          | Sub-section titles                            |
 * | lg       | text-lg (18px)   | Sidebar header title, card header titles       |
 * | xl       | text-xl (20px)   | Form section titles, detail section titles     |
 * | 2xl      | text-2xl (24px)  | Page titles (standard h1), success headings    |
 * | 3xl      | text-3xl (30px)  | Page titles (large h1, overview pages)         |
 * | 20px     | text-[20px]      | Department name in header branding             |
 *
 *
 * 2.4 COMPLETE TYPOGRAPHY HIERARCHY
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * PAGE HEADINGS (h1):
 *   Large:    text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]
 *   Standard: text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]
 *   Subtitle: text-sm text-gray-600 font-['Poppins',sans-serif] mt-1
 *
 * SECTION HEADINGS (h2/h3):
 *   Form section:       text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-3
 *   Detail section:     text-xl font-bold text-[#1f3a5f] mb-4 pb-2 border-b-2 border-gray-300
 *   Gold underline:     text-xl font-bold text-[#1f3a5f] mb-4 pb-2 border-b-2 border-[#f9a825]
 *   Card header:        text-lg font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]
 *   Sub-section:        text-md font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]
 *   Gradient bar:       text-xl font-semibold text-white (on bg-gradient from-[#1f3a5f] to-[#27548a])
 *
 * LABELS & VALUES:
 *   Form input label:   text-[14px] font-medium text-gray-700 mb-2
 *   Detail view label:  text-[14px] font-medium text-[#170f49]
 *   Detail view value:  text-[14px] text-[#414141]
 *   Read-only label:    text-[13px] font-medium text-gray-500 mb-1.5
 *   Required asterisk:  <span className="text-red-600 ml-1">*</span>
 *
 * TABLE TEXT:
 *   Formal th:          text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase
 *   Standard th:        text-[13px] font-semibold text-[#414141]
 *   Table cell:         text-[14px] text-gray-700
 *   Highlighted cell:   text-[14px] font-medium text-[#1f3a5f]
 *
 * SIDEBAR TEXT:
 *   Header title:       text-lg font-semibold text-[#1f3a5f]
 *   Header subtitle:    text-sm text-gray-600 mt-1
 *   Parent item:        text-sm font-semibold
 *   Child item:         text-[13px] font-medium
 *
 *
 * ============================================================================
 * 3. SPACING & GRID RULES
 * ============================================================================
 *
 * 3.1 BASE GRID: 4px / 8px
 * ─────────────────────────────────────────────────────────────────────────────
 * All spacing values are multiples of 4px. The most common increment is 8px.
 *
 * 3.2 PAGE-LEVEL SPACING
 * ─────────────────────────────────────────────────────────────────────────────
 * | Element              | Spacing                                            |
 * |----------------------|--------------------------------------------------- |
 * | Page outer padding   | px-8 py-6 (32px horizontal, 24px vertical)        |
 * | Page background      | min-h-screen bg-[#f5f5fa]                          |
 * | Page title to content| mb-6 (24px)                                        |
 * | Title to subtitle    | mt-1 (4px) or mb-1 (4px)                           |
 * | Success message bar  | p-4 mb-6                                           |
 * | Search bar to table  | mb-5 (20px)                                        |
 *
 * 3.3 FORM LAYOUT GRID (THE PRIMARY PATTERN)
 * ─────────────────────────────────────────────────────────────────────────────
 * Grid:                 grid grid-cols-3 gap-x-8 gap-y-5
 *                       (3 columns, 32px column gap, 20px row gap)
 * Section padding:      p-6 (24px all around)
 * Section to section:   space-y-8 on parent, or mb-6 between sections
 * Action button area:   flex justify-end gap-4 mt-6
 *
 * 3.4 FORM FIELD INTERNAL SPACING
 * ─────────────────────────────────────────────────────────────────────────────
 * | Element              | Spacing                                            |
 * |----------------------|--------------------------------------------------- |
 * | Label to input       | mb-2 (8px)                                         |
 * | Label to radio group | mb-3 (12px)                                        |
 * | Input internal pad   | px-4 py-2.5 (16px horiz, 10px vert)               |
 * | Error text margin    | mt-1.5 (6px)                                       |
 * | Helper text margin   | mt-1.5 (6px)                                       |
 *
 * 3.5 CARD & CONTAINER SPACING
 * ─────────────────────────────────────────────────────────────────────────────
 * | Element              | Spacing                                            |
 * |----------------------|--------------------------------------------------- |
 * | White card padding   | p-8 (32px)                                         |
 * | Section container    | p-6 (24px)                                         |
 * | Section header to box| mb-3 (12px)                                        |
 * | Between sections     | mb-6 (24px)                                        |
 * | Table cell padding   | px-4 py-4 (16px horiz, 16px vert)                 |
 * | Table header padding | px-4 py-3 (16px horiz, 12px vert)                 |
 *
 * 3.6 SIDEBAR SPACING
 * ─────────────────────────────────────────────────────────────────────────────
 * | Element              | Spacing                                            |
 * |----------------------|--------------------------------------------------- |
 * | Sidebar width        | w-64 (256px)                                       |
 * | Header padding       | px-6 py-5 (24px horiz, 20px vert)                 |
 * | Nav container padding| py-4 px-3 (16px vert, 12px horiz)                 |
 * | Parent item height   | h-[45px]                                           |
 * | Parent item padding  | px-4 (16px)                                        |
 * | Icon to text gap     | gap-3 (12px)                                       |
 * | Children wrapper     | pl-3 mt-2 (12px left, 8px top)                    |
 * | Child item height    | h-[39.5px]                                         |
 * | Child item padding   | px-3 (12px)                                        |
 * | Items gap            | gap-1 (4px)                                        |
 * | Footer padding       | p-4 (16px)                                         |
 *
 * 3.7 BREADCRUMB SPACING
 * ─────────────────────────────────────────────────────────────────────────────
 * Container:            bg-white border-b border-gray-200 px-[24px] py-[17.5px]
 * Item gap:             gap-2 (8px) between items
 * Separator icon size:  w-4 h-4
 *
 * 3.8 TAB SPACING
 * ─────────────────────────────────────────────────────────────────────────────
 * Tab container:         flex border-b border-gray-200 mb-6
 * Tab button padding:    px-5 py-3 (20px horiz, 12px vert)
 * Tab count badge:       ml-2 px-2 py-0.5
 *
 * 3.9 TABLE ACTION BUTTON SPACING (Stacked in cell)
 * ─────────────────────────────────────────────────────────────────────────────
 * Container:            flex flex-col items-center gap-1.5 (6px gap)
 * Button padding:       px-4 py-1.5 (gold/gray buttons)
 *                    OR px-4 py-2 (GovTableActionButton)
 *
 *
 * ============================================================================
 * 4. BORDER RADIUS SYSTEM
 * ============================================================================
 *
 * | Element                    | Radius                 | Tailwind Class     |
 * |----------------------------|------------------------|--------------------|
 * | Form inputs                | 6px (medium)           | rounded-md         |
 * | Buttons (standard)         | 6px (medium)           | rounded-md         |
 * | Action buttons (table)     | 8px (large)            | rounded-lg         |
 * | Cards / containers         | 8px (large)            | rounded-lg         |
 * | Form section containers    | 8px (large)            | rounded-lg         |
 * | Table wrapper              | 8px (large)            | rounded-lg         |
 * | Sidebar parent item        | 10px                   | rounded-[10px]     |
 * | Sidebar child item         | 8px (large)            | rounded-lg         |
 * | Status badges              | 9999px (full/pill)     | rounded-full       |
 * | Queue badges               | 9999px (full/pill)     | rounded-full       |
 * | Tab count badges           | 9999px (full/pill)     | rounded-full       |
 * | Modals                     | 8px                    | rounded-[8px]      |
 * | Modal CTA buttons (cyan)   | 24px (pill)            | rounded-[24px]     |
 * | Mobile app button          | 12px                   | rounded-[12px]     |
 * | Date picker calendar       | 8px                    | border-radius: 8px |
 * | Date picker day cells      | 4px                    | border-radius: 4px |
 * | Scrollbar thumb            | 10px                   | border-radius: 10px|
 * | Scrollbar track            | 10px                   | border-radius: 10px|
 *
 * STYLE PHILOSOPHY:
 *   - Form elements and buttons: "rounded-md" (6px) for a clean, government feel
 *   - Containers and cards: "rounded-lg" (8px) for soft edges
 *   - Badges and pills: "rounded-full" for tag-like appearance
 *   - NO sharp corners (rounded-none) anywhere in the system
 *   - NO overly rounded (rounded-2xl/3xl) for form elements
 *
 *
 * ============================================================================
 * 5. SHADOW SYSTEM
 * ============================================================================
 *
 * | Level      | Shadow Value                                        | Usage              |
 * |------------|-----------------------------------------------------|--------------------|
 * | None       | (no shadow)                                         | Form section boxes |
 * | XS (sm)    | shadow-sm                                           | Formal table wrap, |
 * |            |                                                     | primary buttons    |
 * | SM (md)    | shadow-md                                           | Standard table,    |
 * |            |                                                     | dashboard cards,   |
 * |            |                                                     | search/filter bar  |
 * | MD         | shadow-[2px_2px_15px_0px_rgba(0,0,0,0.15)]         | Main detail cards  |
 * | Modal      | shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)]     | Modal outer        |
 * | Modal Inner| shadow-[inset_0px_0px_8px_0px_rgba(0,0,0,0.25)]    | Modal glow         |
 * | Input      | shadow-[0px_0.98px_2.94px_0px_rgba(19,18,66,0.07)] | Figma input fields |
 * | Button     | shadow-[0px_2.45px_7.841px_0px_rgba(8,15,52,0.06)] | Figma buttons      |
 * | Mobile CTA | shadow-md + hover:shadow-lg                         | Mobile launch btn  |
 *
 *
 * ============================================================================
 * 6. COMPONENT INVENTORY
 * ============================================================================
 *
 * All components live in /src/app/components/ui/ (reusable UI) or
 * /src/app/components/jalanidhi/ (domain-specific).
 *
 *
 * ─── 6A. FORM INPUT COMPONENTS ──────────────────────────────────────────────
 *
 * GovInput (/src/app/components/ui/gov-input.tsx)
 *   Type: Forwarded ref, wraps <input>
 *   Props: label?, required?, error?, helperText?, + all HTMLInputAttributes
 *   Label: block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]
 *   Input: w-full px-4 py-2.5 text-[14px] text-gray-900 bg-white
 *          border-[1.5px] border-gray-300 rounded-md
 *          focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f]
 *          hover:border-gray-400
 *          disabled:bg-gray-50 disabled:text-gray-500
 *   Error: border-red-500 + mt-1.5 text-[13px] text-red-600
 *
 * GovSelect (/src/app/components/ui/gov-select.tsx)
 *   Type: Forwarded ref, wraps Radix Select
 *   Props: label?, required?, error?, helperText?, placeholder?,
 *          options: {value, label}[], value?, onValueChange?, disabled?
 *   Trigger: Same visual styling as GovInput
 *   Dropdown: max-h-[300px] font-['Poppins',sans-serif]
 *   Items: font-['Poppins',sans-serif] text-[14px]
 *   RULE: When no data available, fallback options must use value: '__none__' (not '')
 *
 * GovRadio (/src/app/components/ui/gov-radio.tsx)
 *   Type: Forwarded ref, wraps native radio inputs
 *   Props: label?, required?, error?, options: {value, label}[],
 *          value?, onChange?, disabled?, name (required)
 *   Layout: flex gap-6 (horizontal radio group)
 *   Radio:  w-4 h-4 text-[#1f3a5f] border-gray-300
 *           focus:ring-2 focus:ring-[#1f3a5f]/20
 *   Label:  text-[14px] text-gray-700 font-['Poppins',sans-serif]
 *
 * GovDatePicker (/src/app/components/ui/gov-date-picker.tsx)
 *   Type: Custom calendar popup (no external date library dependency)
 *   Props: value (YYYY-MM-DD), onChange, placeholder?, error?, disabled?
 *   Display: DD/MM/YYYY format in input
 *   Calendar header: bg-[#1f3a5f] text-white, nav arrows hover turn gold
 *   Selected day: bg-[#0078a0] text-white
 *   Today: border-[#0078a0] text-[#0078a0]
 *   Hover day: bg-[#e8f4f8] text-[#0078a0]
 *
 * GovMultiSelect (/src/app/components/ui/gov-multi-select.tsx)
 *   Type: Custom multi-select dropdown with chips
 *   Props: label?, required?, error?, placeholder?,
 *          options: {value, label}[], value: string[], onChange,
 *          disabled?
 *   Chips: Removable tags inside the trigger
 *   Dropdown: Checkmark-style multi-select list
 *   Icons: ChevronDown (trigger), X (chip remove), Check (selected item)
 *
 *
 * ─── 6B. BUTTONS (GovButton) ────────────────────────────────────────────────
 *
 * File: /src/app/components/ui/gov-button.tsx
 * Dependencies: @radix-ui/react-slot, class-variance-authority
 *
 * Base classes:
 *   inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
 *   font-['Poppins',sans-serif] font-medium transition-all duration-200
 *   disabled:pointer-events-none disabled:opacity-50
 *   focus:outline-none focus:ring-2 focus:ring-offset-2
 *
 * 8 VARIANTS:
 *   primary:   bg-[#1f3a5f] text-white hover:bg-[#2d4f7f] active:bg-[#15283f]
 *   secondary: bg-[#91c7ff] text-[#1f3a5f] hover:bg-[#a8d4ff] font-semibold
 *   accent:    bg-[#009fbc] text-white hover:bg-[#00b8d9]
 *   outline:   border-[1.5px] border-gray-300 bg-white text-gray-700 hover:bg-gray-50
 *   ghost:     text-gray-700 hover:bg-gray-100
 *   link:      text-[#0066cc] hover:underline p-0 h-auto
 *   danger:    bg-[#ef4444] text-white hover:bg-[#dc2626]
 *   success:   bg-[#10b981] text-white hover:bg-[#059669]
 *
 * 4 SIZES:
 *   sm:      h-8 px-3 py-1.5 text-[13px]
 *   default: h-10 px-5 py-2.5 text-[14px]
 *   lg:      h-12 px-6 py-3 text-[16px]
 *   xl:      h-14 px-8 py-3.5 text-[16px]
 *
 * Additional Props: fullWidth (boolean), loading (boolean with spinner), asChild
 *
 * GOLD ACTION BUTTONS (used in table cells, not GovButton):
 *   Assign: px-4 py-1.5 text-[12px] font-semibold rounded
 *           border border-[#d4a017] bg-[#f9a825] text-[#1f3a5f]
 *           hover:bg-[#e6991f]
 *   Edit:   px-4 py-1.5 text-[12px] font-semibold rounded
 *           border border-gray-300 bg-gray-100 text-gray-700
 *           hover:bg-gray-200
 *
 *
 * ─── 6C. TABLES (GovTable) ─────────────────────────────────────────────────
 *
 * File: /src/app/components/ui/gov-table.tsx
 *
 * 2 VISUAL VARIANTS:
 *   "formal"   — Blue-tinted header, centered text, uppercase headers, 14px
 *                Used by: Commissioner, Field Engineer, Revenue Officer, Admin
 *   "standard" — Gray header, left-aligned text, normal-case headers, 13px
 *                Used by: Caseworker-style pages
 *
 * GovTable<T>:
 *   Props: columns, data, rowKey?, variant?, showSerialNo?, onRowClick?,
 *          loading?, loadingText?, emptyMessage?, minWidth?, className?,
 *          serialNoLabel?
 *
 * Formal variant styling:
 *   Wrapper:   bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden
 *   Thead:     bg-[#27548a]/10 backdrop-blur-[4px]
 *   Thead row: border-b border-[#170F49]
 *   Th:        px-4 py-3 text-[14px] font-semibold text-[#170f49]
 *              tracking-[0.56px] uppercase
 *   Tbody:     divide-y divide-gray-200
 *   Tr:        hover:bg-gray-50 transition-colors
 *   Td:        px-4 py-4 text-[14px] text-gray-700
 *   Td (ID):   font-medium text-[#1f3a5f]
 *
 * Standard variant styling:
 *   Wrapper:   bg-white rounded-lg shadow-md overflow-hidden
 *   Thead:     bg-[#f8f9fa] border-b border-gray-300
 *   Th:        px-4 py-3 text-[13px] font-semibold text-[#414141]
 *   Tbody row: border-b border-gray-200 hover:bg-gray-50
 *   Td:        px-4 py-4 text-[14px] text-[#414141]
 *
 * Helper components (exported from same file):
 *   GovStatusBadge:       Status-colored pill badge with icon support
 *   GovQueueBadge:        Role queue colored pill badge
 *   GovTableActionButton: Action button inside table cells (View/Review/etc.)
 *   GovSearchFilter:      Search input + filter dropdown bar above tables
 *
 * GovTableActionButton:
 *   Props: label?, icon?, onClick, variant? ("standard"|"formal"), className?
 *   Styling: bg-[#1f3a5f] text-white rounded-lg (formal) or rounded-md (standard)
 *            px-4 py-2 text-sm font-medium hover:bg-[#2d4a6f]
 *
 *
 * ─── 6D. BADGES ─────────────────────────────────────────────────────────────
 *
 * GovStatusBadge:
 *   Base: inline-flex items-center gap-1.5 px-3 py-1 rounded-full
 *         text-xs font-medium font-['Poppins',sans-serif] border
 *   Colors: Mapped from status key (see Section 1.6)
 *   Props: status, label?, icon?, className?
 *
 * GovQueueBadge:
 *   Base: inline-flex items-center px-2.5 py-1 rounded-full
 *         text-xs font-medium font-['Poppins',sans-serif] border
 *   Colors: blue, green, purple, orange, indigo
 *   Props: label, color?, className?
 *
 * Inline Status Badges (used directly in table renders):
 *   Base: inline-block px-2.5 py-1 rounded-full text-[12px] font-medium
 *   Variants: Active (green-100/green-700), Inactive (gray-100/gray-600),
 *             Not Assigned (orange-100/orange-700), etc.
 *
 * Tab Count Badge:
 *   Active:   bg-[#1f3a5f] text-white
 *   Inactive: bg-gray-200 text-gray-600
 *   Base: ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold
 *
 *
 * ─── 6E. MODALS / POPUPS ───────────────────────────────────────────────────
 *
 * Overlay:    fixed inset-0 z-50 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]
 * Container:  bg-white rounded-[8px] w-[470px] px-[24px] py-[32px]
 *             shadow-[2px_2px_15px_0px_rgba(0,120,160,0.15)]
 * Inner glow: absolute inset-0 pointer-events-none rounded-[inherit]
 *             shadow-[inset_0px_0px_8px_0px_rgba(0,0,0,0.25)]
 * Cancel btn: rounded-[24px] border-[#0078a0] text-[#0078a0] (pill outline)
 * Submit btn: rounded-[24px] bg-[#0078a0] text-white (pill filled)
 * Gap:        flex flex-col gap-[24px]
 *
 *
 * ─── 6F. FILE UPLOAD / DROPZONE ─────────────────────────────────────────────
 *
 * Dropzone:  border-2 border-dashed border-gray-300 rounded-lg p-6
 *            text-center hover:border-[#1f3a5f] cursor-pointer
 * Uploaded:  flex items-center gap-3 bg-green-50 border border-green-200
 *            rounded-lg p-3
 *
 *
 * ─── 6G. DECLARATION CHECKBOX ───────────────────────────────────────────────
 *
 * Container: bg-[#f8fafc] rounded-lg border border-gray-200 p-6
 * Checkbox:  w-4 h-4 text-[#1f3a5f] border-gray-300 rounded
 *            focus:ring-2 focus:ring-[#1f3a5f]/20 mt-1
 * Text:      text-[14px] text-gray-700 font-['Poppins',sans-serif] leading-relaxed
 *
 *
 * ─── 6H. LOADING / EMPTY / SUCCESS STATES ──────────────────────────────────
 *
 * Loading Spinner:
 *   animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f]
 *   Text: mt-4 text-gray-600 font-['Poppins',sans-serif]
 *
 * Inline Loading (Lucide):
 *   <Loader2 className="w-6 h-6 text-[#1f3a5f] animate-spin" />
 *
 * Empty State:
 *   px-6 py-12 text-center text-gray-500 font-['Poppins',sans-serif]
 *
 * Success Screen:
 *   Icon:  w-20 h-20 rounded-full bg-green-100 + CheckCircle2 w-10 h-10 text-green-600
 *   Title: text-2xl font-bold text-[#1f3a5f]
 *   ID:    bg-blue-50 border-blue-200 rounded-lg px-6 py-4
 *          text-sm text-blue-700, ID value: font-bold font-mono text-[#1f3a5f]
 *
 *
 * ─── 6I. READ-ONLY DETAIL FIELDS ───────────────────────────────────────────
 *
 * Figma-imported pattern:
 *   <div className="flex flex-col gap-[6px] min-w-0">
 *     <p className="font-medium text-[14px] text-[#170f49]">Label</p>
 *     <p className="text-[14px] text-[#414141]">Value</p>
 *   </div>
 *
 * Form-style read-only (used in Assign Ward views):
 *   <div>
 *     <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Label</label>
 *     <p className="text-[14px] text-gray-900 font-medium">Value</p>
 *   </div>
 *
 *
 * ─── 6J. REMARKS TIMELINE ──────────────────────────────────────────────────
 *
 * File: /src/app/components/jalanidhi/RemarksTimeline.tsx
 * Props: remarks: RemarkEntry[], title?, className?
 * RemarkEntry: { role, comment, timestamp?, variant? ('default'|'approved'|'rejected'|'sent_back') }
 *
 * Layout: Vertical timeline with colored dots, role badges, and comment cards
 * Role colors: Per-role color scheme (see Section 1.7)
 * Variant overrides: approved (green), rejected (red), sent_back (amber)
 *
 *
 * ============================================================================
 * 7. NAVIGATION ELEMENTS
 * ============================================================================
 *
 * ─── 7A. SIDEBAR (GovSidebar Pattern) ──────────────────────────────────────
 *
 * Architecture: Data-driven. Define menu items as config array. Component
 *               renders expandable/collapsible parents with animated chevrons
 *               + child navigation items.
 *
 * File: Each role has its own sidebar component:
 *   /src/app/components/jalanidhi/CaseworkerSidebar.tsx
 *   /src/app/components/jalanidhi/FieldEngineerSidebar.tsx
 *   /src/app/components/jalanidhi/RevenueOfficerSidebar.tsx
 *   CommissionerPage and ULBAdminPage have self-contained sidebars
 *
 * Container:     w-64 bg-white h-screen border-r border-gray-200 flex flex-col
 * Header:        px-6 py-5 border-b border-gray-200
 * Nav wrapper:   flex-1 overflow-y-auto py-4 px-3
 * Parent item:   h-[45px] w-full rounded-[10px] flex items-center justify-between px-4
 *                Active: bg-[#1f3a5f] text-white
 *                Inactive: text-[#1b212d] hover:bg-[#e3f2fd]
 * Chevron:       w-4 h-4 transition-transform duration-200 (rotate-180 when open)
 * Children wrap: pl-3 mt-2 flex flex-col gap-1
 * Child item:    h-[39.5px] w-full rounded-lg flex items-center px-3
 *                text-[13px] font-medium font-['Poppins',sans-serif]
 *                Active: bg-[#e3f2fd] text-[#1f3a5f]
 *                Inactive: text-[#1b212d] hover:bg-gray-50
 * Footer:        border-t border-gray-200 p-4 (optional mobile launch button)
 *
 * State Persistence: All expand/collapse states saved to localStorage
 *   Key pattern: `${storagePrefix}_${sectionId}`
 *
 * Icons used: FileText, Wrench, ChevronDown, Gauge, Smartphone (lucide-react)
 *
 * ROLE SIDEBAR MENUS:
 *   Caseworker:      Plumber License, Tap Connection, Meter Management
 *   Field Engineer:  Plumber License, Tap Connection, Meter Management
 *   Revenue Officer: Tap Connection
 *   Commissioner:    Self-contained (CommissionerPage.tsx)
 *   ULB Admin:       Overview, User Management, Configurations (expandable)
 *
 *
 * ─── 7B. TOP HEADER BAR ────────────────────────────────────────────────────
 *
 * File: /src/imports/Header.tsx (Figma-imported)
 *
 * Features:
 *   - Government of Karnataka branding (logo + text)
 *   - Department of Municipal Administration title
 *   - Font size controls (A-/A+ with animated slider)
 *   - User info display (from localStorage 'userData')
 *   - Logout button
 *
 * Background: Dark blue gradient (Figma-imported, matches gov brand)
 * Position:   sticky top-0 z-50
 * Text:       Government name: text-[16px] font-normal text-black
 *             Department name: text-[20px] font-semibold text-black
 *
 *
 * ─── 7C. BREADCRUMBS ───────────────────────────────────────────────────────
 *
 * Container:  bg-white border-b border-gray-200 px-[24px] py-[17.5px]
 * Layout:     flex items-center gap-2 text-sm
 * Home icon:  Home (lucide-react) w-4 h-4 + text
 * Link:       text-gray-600 hover:text-[#1f3a5f] font-['Poppins',sans-serif]
 * Current:    text-[#1f3a5f] font-semibold font-['Poppins',sans-serif]
 * Separator:  <ChevronRight className="w-4 h-4 text-gray-400" />
 *
 * Shown for: All /jalanidhi/* paths except mobile apps, commissioner, and ULB admin
 *
 *
 * ─── 7D. TABS ──────────────────────────────────────────────────────────────
 *
 * Used in: AssignWardToBillCollectors (List / Applications Sent for Approval)
 *
 * Container:  flex border-b border-gray-200 mb-6
 * Tab button:
 *   Active:   px-5 py-3 text-[14px] font-medium font-['Poppins',sans-serif]
 *             border-b-2 border-[#1f3a5f] text-[#1f3a5f]
 *   Inactive: border-transparent text-gray-500 hover:text-gray-700
 *             hover:border-gray-300
 * Count badge:
 *   Active:   ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold
 *             bg-[#1f3a5f] text-white
 *   Inactive: bg-gray-200 text-gray-600
 *
 *
 * ============================================================================
 * 8. PAGE-LEVEL LAYOUT PATTERNS
 * ============================================================================
 *
 * ─── 8A. APP SHELL ─────────────────────────────────────────────────────────
 *
 * <div className="min-h-screen flex flex-col bg-[#f5f5fa]">
 *   <!-- Header (sticky top, z-50) -->
 *   <div className="w-full sticky top-0 z-50"><Header /></div>
 *
 *   <!-- Main Layout -->
 *   <div className="flex flex-1 relative">
 *     <!-- Sidebar (sticky, full height) -->
 *     <div className="sticky top-0 h-screen"><Sidebar /></div>
 *
 *     <!-- Content Area -->
 *     <div className="flex-1 overflow-auto bg-gray-50">
 *       <!-- Breadcrumbs -->
 *       <div className="bg-white border-b border-gray-200 px-[24px] py-[17.5px]">...</div>
 *       <!-- Page Content -->
 *       {renderContent()}
 *     </div>
 *   </div>
 *
 *   <!-- Footer -->
 *   <div className="w-full"><Footer /></div>
 * </div>
 *
 *
 * ─── 8B. FORM PAGE PATTERN ─────────────────────────────────────────────────
 *
 * <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
 *   <!-- Back Button -->
 *   <button className="flex items-center gap-1.5 text-[14px] text-[#1f3a5f]
 *     font-medium font-['Poppins',sans-serif] mb-3 hover:underline">
 *     <ChevronLeft className="w-4 h-4" /> Back to List
 *   </button>
 *
 *   <!-- Page Title -->
 *   <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">Title</h1>
 *   <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">Description</p>
 *
 *   <!-- White Card -->
 *   <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
 *     <div className="p-8">
 *       <!-- Section 1 -->
 *       <h2 className="text-xl font-semibold text-[#1f3a5f] mb-3">Section Title</h2>
 *       <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-6">
 *         <div className="grid grid-cols-3 gap-x-8 gap-y-5">
 *           <GovInput ... />
 *           <GovSelect ... />
 *         </div>
 *       </div>
 *
 *       <!-- Section 2 -->
 *       <h2 className="text-xl font-semibold text-[#1f3a5f] mb-3">Section Title</h2>
 *       <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
 *         <div className="grid grid-cols-3 gap-x-8 gap-y-5">...</div>
 *       </div>
 *
 *       <!-- Action Buttons -->
 *       <div className="flex justify-end gap-4 mt-6">
 *         <GovButton variant="outline">Cancel</GovButton>
 *         <GovButton variant="primary" loading={saving}>Submit</GovButton>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 *
 * ─── 8C. DASHBOARD / LIST PAGE PATTERN ──────────────────────────────────────
 *
 * <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
 *   <!-- Page Header -->
 *   <div className="mb-6">
 *     <h1 className="text-2xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif] mb-1">Title</h1>
 *     <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">Description</p>
 *   </div>
 *
 *   <!-- Success Message (conditional) -->
 *   <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
 *     <CheckCircle className="w-5 h-5 text-green-600" />
 *     <p className="text-sm text-green-800 font-medium">{message}</p>
 *   </div>
 *
 *   <!-- Optional Tabs -->
 *   <div className="flex border-b border-gray-200 mb-6">...</div>
 *
 *   <!-- Search Bar -->
 *   <div className="mb-5">
 *     <div className="relative w-[320px]">
 *       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
 *       <input className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md ..." />
 *     </div>
 *   </div>
 *
 *   <!-- Data Table -->
 *   <GovTable columns={...} data={...} variant="formal" showSerialNo={true} />
 * </div>
 *
 *
 * ─── 8D. DETAIL / VIEW PAGE PATTERN ─────────────────────────────────────────
 *
 * Same as Form Page Pattern (8B) but with read-only fields instead of inputs:
 *   - Labels: text-[13px] font-medium text-gray-500 mb-1.5
 *   - Values: text-[14px] text-gray-900 font-medium (or font-['Poppins',sans-serif])
 *   - Status fields: Use inline badge <span> elements
 *   - Action buttons: "Back to List" (outline) + "Edit Assignment" (primary)
 *
 *
 * ============================================================================
 * 9. CODING CONVENTIONS
 * ============================================================================
 *
 * 9A. NULL SAFETY (CRITICAL)
 * ─────────────────────────────────────────────────────────────────────────────
 * CLIENT-SIDE (React .tsx files):
 *   - Use explicit && null checks with 'N/A' fallbacks
 *   - NEVER use optional chaining (?.)
 *   - CORRECT: app && app.details && app.details.name ? app.details.name : 'N/A'
 *   - WRONG:   app?.details?.name ?? 'N/A'
 *
 * SERVER-SIDE (Deno /supabase/functions/server/*.tsx):
 *   - Optional chaining (?.) is fine
 *   - Example: const name = body?.assignment?.billCollectorName;
 *
 *
 * 9B. STATE PERSISTENCE (localStorage Pattern)
 * ─────────────────────────────────────────────────────────────────────────────
 * All UI state that should survive page refreshes:
 *
 *   const [value, setValue] = useState(() => {
 *     const saved = localStorage.getItem('componentName_key');
 *     return saved ? JSON.parse(saved) : defaultValue;
 *   });
 *   useEffect(() => {
 *     localStorage.setItem('componentName_key', JSON.stringify(value));
 *   }, [value]);
 *
 * Used for: activePath, userRole, userData, sidebar expand/collapse states,
 *           active tab selections, form progress
 *
 *
 * 9C. API FETCH PATTERN
 * ─────────────────────────────────────────────────────────────────────────────
 * import { projectId, publicAnonKey } from '/utils/supabase/info';
 *
 * const response = await fetch(
 *   `https://${projectId}.supabase.co/functions/v1/make-server-698be164/route`,
 *   {
 *     method: 'GET',  // or 'POST'
 *     headers: {
 *       'Authorization': `Bearer ${publicAnonKey}`,
 *       'Content-Type': 'application/json',
 *     },
 *     body: JSON.stringify(payload),  // for POST
 *   }
 * );
 * const data = await response.json();
 *
 *
 * 9D. ERROR LOGGING
 * ─────────────────────────────────────────────────────────────────────────────
 * Always prefix with component/context name:
 *   console.error('[WARD ASSIGN] Error fetching:', error);
 *   console.error('[BILL COLLECTOR] Error saving:', error);
 *   console.log(`[METER] Created ward assignment ${newId}`);
 *
 *
 * 9E. DATE FORMATTING
 * ─────────────────────────────────────────────────────────────────────────────
 * Display format: DD/MM/YYYY (Indian standard)
 *
 * function formatDateDisplay(dateStr: string): string {
 *   if (!dateStr) return 'N/A';
 *   try {
 *     const d = new Date(dateStr);
 *     const day = String(d.getDate()).padStart(2, '0');
 *     const month = String(d.getMonth() + 1).padStart(2, '0');
 *     const year = d.getFullYear();
 *     return day + '/' + month + '/' + year;
 *   } catch { return dateStr; }
 * }
 *
 * Alternative (used in some views):
 *   date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
 *   // Output: "14 Feb 2026"
 *
 *
 * 9F. GOVSELECT FALLBACK RULE
 * ─────────────────────────────────────────────────────────────────────────────
 * When a GovSelect has no real options (e.g., dependent dropdown with nothing loaded),
 * use value: '__none__' instead of empty string '' for the fallback option:
 *
 *   const options = data.length > 0 ? data : [{ value: '__none__', label: 'No options available' }];
 *
 *
 * ============================================================================
 * 10. REQUIRED PACKAGES
 * ============================================================================
 *
 * Core:
 *   - react, react-dom
 *   - tailwindcss (v4)
 *
 * Gov Components:
 *   - lucide-react (icons - used everywhere)
 *   - class-variance-authority (GovButton CVA variants)
 *   - clsx + tailwind-merge (cn utility at /src/app/components/ui/utils.ts)
 *   - @radix-ui/react-slot (GovButton asChild)
 *   - @radix-ui/react-select (GovSelect underlying)
 *
 * Date Handling:
 *   - react-datepicker + @types/react-datepicker (legacy, for some pages)
 *   - Custom GovDatePicker (preferred, no external dep)
 *
 * Backend:
 *   - Supabase JS client (createClient)
 *   - Hono (server framework on Deno edge functions)
 *
 *
 * ============================================================================
 * 11. CUSTOM CSS (Global Styles)
 * ============================================================================
 *
 * File: /src/styles/index.css
 *
 * 11.1 FONT IMPORT
 *   File: /src/styles/fonts.css
 *   @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
 *
 * 11.2 CUSTOM SCROLLBAR (Navy Blue Pill Design)
 *   Applied globally to ALL scrollable elements.
 *
 *   Track:       #e8ecf1, border-radius: 10px
 *   Thumb:       linear-gradient(90deg, #1f3a5f, #27548a), border-radius: 10px
 *   Thumb hover: linear-gradient(90deg, #15283f, #1f3a5f)
 *   Thumb active:#15283f
 *   Width/Height:10px (global), 12px (table-specific .gov-table-scroll)
 *   Firefox:     scrollbar-width: thin; scrollbar-color: #1f3a5f #e8ecf1;
 *
 * 11.3 DATE PICKER STYLES
 *   Calendar border: 1px solid #d3d8ff, border-radius: 8px
 *   Header bg:       #1f3a5f (dark blue)
 *   Month text:      white, font-weight: 600, 14px
 *   Day names:       white, 12px, font-weight: 500
 *   Day text:        #170f49, 12px, font-weight: 500
 *   Day hover:       bg #e8f4f8, color #0078a0
 *   Day selected:    bg #0078a0, color white
 *   Day today:       border #0078a0, color #0078a0
 *   Nav hover:       arrow color turns #f9a825 (gold)
 *
 *
 * ============================================================================
 * 12. MULTI-ACTOR ROLE ARCHITECTURE
 * ============================================================================
 *
 * The application supports 6 primary actor roles + 1 admin role:
 *
 * | Role             | Route Prefix                        | Sidebar           |
 * |------------------|-------------------------------------|-------------------|
 * | Citizen          | /jalanidhi/tap/*, /jalanidhi/plumber | JalanihiSidebar   |
 * | Plumber          | /jalanidhi/plumber/*                | JalanihiSidebar   |
 * | Caseworker       | /jalanidhi/caseworker/*             | CaseworkerSidebar |
 * | Field Engineer   | /jalanidhi/field-engineer/*         | FE Sidebar        |
 * | Revenue Officer  | /jalanidhi/revenue-officer/*        | RO Sidebar        |
 * | Commissioner     | /jalanidhi/commissioner/*           | Self-contained    |
 * | ULB Admin        | /jalanidhi/ulb-admin/*              | Self-contained    |
 *
 * WORKFLOW MODULES:
 *   1. New Tap Connection:  Citizen -> Caseworker -> FE -> RO -> Commissioner -> Payment
 *   2. Tap Disconnection:   Citizen -> Caseworker -> FE -> Commissioner
 *   3. Tap Reconnection:    Citizen -> Caseworker -> FE -> RO -> Commissioner -> Payment
 *   4. Plumber License:     Plumber -> Caseworker -> FE -> RO -> Commissioner -> Payment
 *   5. Plumber Renewal:     Plumber -> Caseworker -> FE -> RO -> Commissioner -> Payment
 *   6. Meter Management:    Caseworker (Bill Collectors + Ward Assignment) -> FE Approval
 *
 * LOGIN ROUTING:
 *   - Citizen/Plumber -> / (CitizenServices)
 *   - Caseworker -> /jalanidhi/caseworker/dashboard
 *   - Field Engineer -> /jalanidhi/field-engineer/tap-connection/new-requests
 *   - Revenue Officer -> /jalanidhi/revenue-officer/tap-connection/new-requests
 *   - Commissioner -> /jalanidhi/commissioner/tap-connection
 *   - ULB Admin -> /jalanidhi/ulb-admin/overview
 *
 * DATA PERSISTENCE:
 *   All data stored via KV store (Supabase Postgres):
 *   - Applications: kv key patterns per module
 *   - Bill Collectors: meter_management:bill_collectors
 *   - Ward Assignments: meter_management:ward_assignments
 *   - Tariff Rates: tariff_rate_configs
 *   - Server: Hono on Supabase Edge Functions at /make-server-698be164/*
 *
 *
 * ============================================================================
 * 13. CRITICAL RULES SUMMARY
 * ============================================================================
 *
 * 1.  FONT: Every text element MUST include font-['Poppins',sans-serif].
 *
 * 2.  NULL SAFETY: No optional chaining (?.) in client-side React code.
 *     Use explicit && checks with 'N/A' fallbacks.
 *
 * 3.  FORM PATTERN: Always use the canonical layout:
 *     - Section header: text-xl font-semibold text-[#1f3a5f] (plain text, NOT in a gradient bar)
 *     - Field container: bg-[#f8fafc] rounded-lg border border-gray-200 p-6
 *     - Grid: grid grid-cols-3 gap-x-8 gap-y-5
 *     - Buttons: flex justify-end gap-4 mt-6
 *
 * 4.  FIGMA RULE: When a Figma screenshot is attached, it is ONLY for referencing
 *     content, column structure, or input fields. It must NEVER override the
 *     established component styling (no blue gradient card headers from Figma).
 *
 * 5.  TABLE DESIGN: Use GovTable component with "formal" variant for all roles.
 *     Blue-tinted header bg-[#27548a]/10, uppercase headers, centered text.
 *
 * 6.  SIDEBAR DESIGN: w-64, white bg, border-r, expandable sections with
 *     localStorage-persisted open/close states. Active = bg-[#1f3a5f] text-white.
 *
 * 7.  GOVSELECT FALLBACK: Use value: '__none__' for empty/no-data fallback options.
 *
 * 8.  STATE PERSISTENCE: All meaningful UI state persisted in localStorage.
 *
 * 9.  ERROR LOGGING: Always include context prefix: [COMPONENT_NAME] Error message.
 *
 * 10. COLORS: Primary #1f3a5f, Gold #f9a825, Cyan #0078a0, Page bg #f5f5fa.
 *     Never use colors outside this system without explicit user request.
 *
 * 11. BORDER RADIUS: rounded-md for inputs/buttons, rounded-lg for cards/containers,
 *     rounded-full for badges/pills. No sharp corners.
 *
 * 12. BACKEND SECURITY: SUPABASE_SERVICE_ROLE_KEY must never leak to the frontend.
 *     Frontend uses publicAnonKey for Authorization headers.
 *
 * ============================================================================
 * END OF DESIGN REQUIREMENTS DOCUMENT
 * ============================================================================
 */

// This file is documentation only. It exports nothing and is not imported anywhere.
// It exists solely as a comprehensive design reference for the Jalanidhi project.
export {};
