# Karnataka Government Portal - Design System Style Guide

## 🎨 Color Palette (Based on Header Design)

### Primary Colors (From Header)
These colors are extracted directly from the government portal header and form the foundation of our design system.

#### Primary - Dark Blue
- **Hex**: `#1f3a5f`
- **Usage**: Primary buttons, header background, main brand color, toggle switches
- **Contrast**: White text (WCAG AAA compliant)

#### Secondary - Light Blue
- **Hex**: `#91c7ff`
- **Usage**: Secondary buttons, accents, hover states, interactive elements
- **Contrast**: Dark text for accessibility

#### Accent - Cyan
- **Hex**: `#009fbc`
- **Usage**: Borders, focus rings, highlights, call-to-action elements
- **Contrast**: White text

### Semantic Colors

#### Success - Green
- **Hex**: `#10b981`
- **Usage**: Success messages, confirmations, positive actions

#### Warning - Amber
- **Hex**: `#f59e0b`
- **Usage**: Warnings, caution messages, important notices

#### Error/Danger - Red
- **Hex**: `#ef4444`
- **Usage**: Error messages, destructive actions, validation errors

#### Info - Blue
- **Hex**: `#0066cc`
- **Usage**: Information messages, links, help text

### Neutral Colors

#### Grays
```
Gray 900: #1a1a1a - Primary text
Gray 800: #2d2d2d - Secondary headings
Gray 700: #404040 - Body text
Gray 600: #666666 - Secondary text
Gray 500: #9ca3af - Placeholder text
Gray 400: #d1d5db - Borders
Gray 300: #e5e7eb - Light borders
Gray 200: #f3f4f6 - Subtle backgrounds
Gray 100: #f9fafb - Light backgrounds
Gray 50:  #fafafa - Page backgrounds
```

#### Backgrounds
- **Page Background**: `#f5f5f5`
- **Card Background**: `#ffffff`
- **Input Background**: `#ffffff`
- **Header Background**: `#1f3a5f`
- **Header Accent Bar**: `#1f3a5f`

---

## 🔤 Typography

### Font Families
**Primary**: Poppins, sans-serif
- All UI elements, forms, buttons, body text
- Google Fonts: `https://fonts.google.com/specimen/Poppins`

**Monospace**: 'Courier New', Courier, monospace
- Code, captcha, technical content

### Font Scale
```css
Display:    32px / 2rem    - font-bold
H1:         28px / 1.75rem - font-semibold
H2:         24px / 1.5rem  - font-semibold
H3:         20px / 1.25rem - font-semibold
H4:         18px / 1.125rem - font-medium
Body L:     16px / 1rem    - font-normal
Body:       14px / 0.875rem - font-normal (Default)
Body S:     13px / 0.8125rem - font-normal
Caption:    12px / 0.75rem - font-normal
Tiny:       11px / 0.6875rem - font-normal
```

### Font Weights
- **Regular**: 400 - Body text, descriptions
- **Medium**: 500 - Labels, emphasized text
- **SemiBold**: 600 - Headings, section titles
- **Bold**: 700 - Strong emphasis, important headings

### Line Heights
- **Tight**: 1.2 - Headings, display text
- **Normal**: 1.5 - Body text (default)
- **Relaxed**: 1.75 - Long-form content, paragraphs

---

## 🔘 Button System

### Button Variants

#### 1. Primary Button (Dark Blue)
**Color**: `#1f3a5f`
**Use Case**: Main actions, primary CTAs
**Examples**: Login, Submit, Save, Continue

```tsx
<GovButton variant="primary">Login</GovButton>
```

**States**:
- Default: `bg-[#1f3a5f]` text-white
- Hover: `bg-[#2d4f7f]`
- Active: `bg-[#15283f]`
- Focus: Ring `#1f3a5f/30`
- Disabled: 50% opacity

---

#### 2. Secondary Button (Light Blue)
**Color**: `#91c7ff`
**Use Case**: Important secondary actions
**Examples**: Download, Export, Register

```tsx
<GovButton variant="secondary">Register</GovButton>
```

**States**:
- Default: `bg-[#91c7ff]` text-[#1f3a5f]
- Hover: `bg-[#a8d4ff]`
- Active: `bg-[#7ab8ff]`
- Focus: Ring `#91c7ff/30`

---

#### 3. Accent Button (Cyan)
**Color**: `#009fbc`
**Use Case**: Call-to-action, highlighted actions
**Examples**: Send OTP, Verify, Get Started

```tsx
<GovButton variant="accent">Send OTP</GovButton>
```

**States**:
- Default: `bg-[#009fbc]` text-white
- Hover: `bg-[#00b8d9]`
- Active: `bg-[#008299]`
- Focus: Ring `#009fbc/30`

---

#### 4. Outline Button
**Use Case**: Secondary actions, cancel
**Examples**: Cancel, Back, Close

```tsx
<GovButton variant="outline">Cancel</GovButton>
```

**States**:
- Default: Border gray-300, bg-white
- Hover: bg-gray-50, border-gray-400
- Active: bg-gray-100

---

#### 5. Ghost Button
**Use Case**: Tertiary actions, subtle interactions
**Examples**: Resend OTP, Refresh Captcha

```tsx
<GovButton variant="ghost">Resend OTP</GovButton>
```

**States**:
- Default: Transparent background
- Hover: bg-gray-100
- Active: bg-gray-200

---

#### 6. Link Button
**Use Case**: Text links, navigation
**Examples**: Forgot Password?, Help

```tsx
<GovButton variant="link">Forgot Password?</GovButton>
```

**States**:
- Default: text-[#0066cc]
- Hover: Underline

---

#### 7. Danger Button (Red)
**Use Case**: Destructive actions
**Examples**: Delete, Remove, Logout

```tsx
<GovButton variant="danger">Delete</GovButton>
```

**States**:
- Default: `bg-[#ef4444]` text-white
- Hover: `bg-[#dc2626]`
- Active: `bg-[#b91c1c]`

---

#### 8. Success Button (Green)
**Use Case**: Positive confirmations
**Examples**: Approve, Confirm, Accept

```tsx
<GovButton variant="success">Approve</GovButton>
```

**States**:
- Default: `bg-[#10b981]` text-white
- Hover: `bg-[#059669]`

---

### Button Sizes

```tsx
<GovButton size="sm">Small</GovButton>      // h-8, px-3, text-13px
<GovButton size="default">Default</GovButton> // h-10, px-5, text-14px
<GovButton size="lg">Large</GovButton>      // h-12, px-6, text-16px
<GovButton size="xl">Extra Large</GovButton> // h-14, px-8, text-16px
```

**Mobile Touch Targets**: Minimum 44px height on mobile devices

---

## 📝 Input Fields

### Standard Input
**Height**: 42px (h-[42px])
**Padding**: 16px horizontal (px-4)
**Border**: 1.5px solid gray-300
**Border Radius**: 6px (rounded-md)
**Font Size**: 14px

```tsx
<GovInput 
  label="Mobile Number"
  type="tel"
  placeholder="Enter 10-digit number"
  required
/>
```

### Input States

#### Default
- Border: `#d1d5db` (gray-300)
- Background: White
- Text: `#1a1a1a` (gray-900)

#### Hover
- Border: `#9ca3af` (gray-400)

#### Focus
- Border: `#1f3a5f` (primary)
- Ring: 2px `#1f3a5f/20`

#### Error
- Border: `#ef4444` (red)
- Ring: 2px `#ef4444/20`
- Error text: `#ef4444`

#### Disabled
- Background: `#f9fafb` (gray-50)
- Border: `#e5e7eb` (gray-300)
- Text: `#9ca3af` (gray-500)
- Cursor: not-allowed

### Input Variants
- Text
- Email
- Password
- Tel (Mobile)
- Number
- Date
- Textarea

---

## 🎴 Cards & Containers

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**Specs**:
- Background: White
- Border: 1px solid gray-200
- Border Radius: 12px (rounded-xl)
- Shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Padding: 32px (p-8)

---

## 📐 Spacing System

Based on 4px grid (Tailwind scale):

```
0.5  →  2px   - Micro spacing
1    →  4px   - xs
2    →  8px   - sm
3    →  12px  - md
4    →  16px  - Base spacing
5    →  20px  - lg
6    →  24px  - xl (Form field spacing)
8    →  32px  - 2xl (Section spacing)
10   →  40px  - 3xl
12   →  48px  - 4xl
16   →  64px  - 5xl
```

### Form Spacing
- Between fields: `space-y-6` (24px)
- Label to input: `mb-2` (8px)
- Input to helper: `mt-1.5` (6px)
- Button margin top: `mt-6` (24px)

---

## 🔄 Interactive States

### Focus States
All interactive elements must have visible focus indicators:
- **Ring Width**: 2px
- **Ring Color**: Primary color with 20-30% opacity
- **Offset**: 2px from element edge

### Hover States
- **Buttons**: Background color change
- **Links**: Underline + color change
- **Inputs**: Border color change
- **Cards**: Subtle shadow increase (optional)

### Active/Pressed States
- **Buttons**: Darker background, optional scale(0.98)
- **Inputs**: Border emphasis

### Disabled States
- **Opacity**: 50%
- **Cursor**: not-allowed
- **Background**: gray-50 (for inputs)

---

## 📱 Responsive Design

### Breakpoints
```css
Mobile:  < 640px   (sm)
Tablet:  640px - 1024px (md/lg)
Desktop: > 1024px  (xl)
```

### Mobile Considerations
- Touch targets: Minimum 44px × 44px
- Buttons: Full width on mobile
- Form fields: Stack vertically
- Padding: Increased for easier touch
- Font size: Minimum 16px to prevent zoom

---

## ♿ Accessibility

### Color Contrast (WCAG AA)
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Keyboard Navigation
- All interactive elements tab-navigable
- Visible focus indicators required
- Logical tab order

### Screen Readers
- Proper ARIA labels
- Semantic HTML
- Alt text for images
- Role attributes where needed

### Form Accessibility
- Labels associated with inputs
- Error messages linked via aria-describedby
- Required fields indicated
- Helpful error messages

---

## 🎯 Component Usage Matrix

| Component | Variant | Use Case | Example |
|-----------|---------|----------|---------|
| Button | Primary | Main action | Login, Submit |
| Button | Secondary | Important secondary | Register, Download |
| Button | Accent | Call-to-action | Send OTP, Verify |
| Button | Outline | Cancel/Back | Cancel, Close |
| Button | Ghost | Tertiary | Resend, Refresh |
| Button | Link | Navigation | Forgot Password? |
| Button | Danger | Destructive | Delete, Remove |
| Button | Success | Confirmation | Approve, Accept |
| Input | Text | General input | Name, Address |
| Input | Tel | Phone numbers | Mobile Number |
| Input | Email | Email address | Email ID |
| Input | Password | Secure input | Password |

---

## 📋 Form Patterns

### Login Form Pattern
```tsx
<form className="space-y-6">
  <GovInput label="Login ID" required />
  <GovInput label="Password" type="password" required />
  <GovButton variant="primary" fullWidth size="lg">
    LOGIN
  </GovButton>
  <div className="flex justify-between">
    <GovButton variant="link" size="sm">Forgot Password?</GovButton>
    <GovButton variant="link" size="sm">Need Help?</GovButton>
  </div>
</form>
```

### OTP Verification Pattern
```tsx
<div className="space-y-4">
  <GovInput 
    label="Mobile Number" 
    type="tel" 
    maxLength={10}
    required 
  />
  <GovButton variant="accent">Send OTP</GovButton>
  
  <GovInput 
    label="Enter OTP" 
    type="text" 
    maxLength={6}
    helperText="OTP valid for 10 minutes"
  />
  <GovButton variant="link" size="sm">Resend OTP</GovButton>
</div>
```

---

## 🎨 Government Portal Specific

### Trust Indicators
- Government logo prominently displayed
- Official color scheme maintained
- Security badges for sensitive operations
- Department branding consistent

### Header Design (Reference)
- Background: `#1f3a5f`
- Accessibility controls included
- Language toggle (Kannada/English)
- Font size controls
- High contrast mode

### Footer
- Consistent across all pages
- Copyright and legal information
- Contact information
- Quick links

---

## 📊 Design Tokens

### Border Radius
```css
sm:  4px   (rounded)
md:  6px   (rounded-md)
lg:  8px   (rounded-lg)
xl:  12px  (rounded-xl)
2xl: 16px  (rounded-2xl)
full: 9999px (rounded-full)
```

### Shadows
```css
sm:  0 1px 2px rgba(0,0,0,0.05)
md:  0 1px 3px rgba(0,0,0,0.1)
lg:  0 4px 6px rgba(0,0,0,0.1)
xl:  0 10px 15px rgba(0,0,0,0.1)
```

### Transitions
```css
Default: 200ms ease-in-out
Fast:    150ms ease-in-out
Slow:    300ms ease-in-out
```

---

## 📚 Code Examples

### Complete Form Example
```tsx
import { GovInput } from "@/components/ui/gov-input";
import { GovButton } from "@/components/ui/gov-button";

function LoginForm() {
  return (
    <form className="space-y-6 max-w-md mx-auto">
      <GovInput 
        label="Login ID"
        type="text"
        placeholder="Enter your Login ID"
        required
      />
      
      <GovInput 
        label="Password"
        type="password"
        placeholder="Enter your password"
        required
      />
      
      <GovInput 
        label="OTP"
        type="text"
        placeholder="Enter 6-digit OTP"
        maxLength={6}
        helperText="OTP valid for 10 minutes"
        required
      />
      
      <GovButton variant="primary" fullWidth size="lg">
        LOGIN
      </GovButton>
      
      <div className="flex justify-between pt-4 border-t">
        <GovButton variant="link" size="sm">
          Forgot Password?
        </GovButton>
        <GovButton variant="link" size="sm">
          Need Help?
        </GovButton>
      </div>
    </form>
  );
}
```

---

## 🚀 Implementation Guidelines

### File Structure
```
src/
├── app/
│   ├── components/
│   │   └── ui/
│   │       ├── gov-button.tsx
│   │       ├── gov-input.tsx
│   │       ├── card.tsx
│   │       └── tabs.tsx
│   └── App.tsx
└── styles/
    └── theme.css
```

### Naming Conventions
- Components: PascalCase (GovButton, GovInput)
- Props: camelCase (variant, fullWidth)
- CSS classes: Tailwind utilities
- Files: kebab-case (gov-button.tsx)

---

## ✅ Quality Checklist

Before shipping any component:
- [ ] WCAG AA color contrast verified
- [ ] Keyboard navigation tested
- [ ] Focus states visible
- [ ] Mobile responsive
- [ ] Error states implemented
- [ ] Loading states (if applicable)
- [ ] Disabled states styled
- [ ] TypeScript types defined
- [ ] Documentation updated
- [ ] Examples provided

---

**Version**: 2.0.0  
**Based on**: Karnataka Government Portal Header Design  
**Primary Color**: #1f3a5f (Dark Blue)  
**Secondary Color**: #91c7ff (Light Blue)  
**Accent Color**: #009fbc (Cyan)  
**Last Updated**: February 2026  
**Maintained by**: Karnataka Municipal Administration Development Team
