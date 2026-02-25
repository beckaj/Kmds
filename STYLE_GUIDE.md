# Government Portal Design System - Style Guide

## 🎨 Design Philosophy

This design system is built for the Karnataka Government's Municipal Administration portal. It emphasizes accessibility, clarity, and trust while maintaining a modern, professional appearance suitable for government services.

---

## 📐 Color Palette

### Primary Colors
- **Primary Blue**: `#1f3a5f` - Main brand color, used for primary actions and headers
- **Primary Blue Hover**: `#2d4f7f` - Hover state for primary elements
- **Primary Blue Active**: `#15283f` - Active/pressed state

### Secondary Colors
- **Secondary Gold**: `#f9a825` - Call-to-action buttons, important highlights
- **Secondary Gold Hover**: `#f9b23d` - Hover state for secondary elements
- **Secondary Gold Active**: `#e89611` - Active/pressed state

### Neutral Colors
- **Gray 900**: `#1a1a1a` - Primary text
- **Gray 700**: `#333333` - Secondary text
- **Gray 600**: `#666666` - Tertiary text
- **Gray 500**: `#999999` - Placeholder text
- **Gray 400**: `#cccccc` - Borders (light)
- **Gray 300**: `#d1d5db` - Borders (default)
- **Gray 200**: `#e5e7eb` - Borders (subtle)
- **Gray 100**: `#f3f4f6` - Background (light)
- **Gray 50**: `#f9fafb` - Background (subtle)

### Semantic Colors
- **Success**: `#10b981` - Success states, confirmations
- **Warning**: `#f59e0b` - Warning states, alerts
- **Error/Danger**: `#ef4444` - Error states, destructive actions
- **Info**: `#0066cc` - Links, information

### Background Colors
- **Page Background**: `#f5f5f5`
- **Card Background**: `#ffffff`
- **Input Background**: `#ffffff`

---

## 🔤 Typography

### Font Family
**Primary Font**: Poppins (sans-serif)
- Used for all UI elements, forms, buttons, and body text
- Fallback: system-ui, sans-serif

### Font Sizes
```css
- Heading 1: 28px / 1.75rem (font-semibold)
- Heading 2: 24px / 1.5rem (font-semibold)
- Heading 3: 20px / 1.25rem (font-semibold)
- Heading 4: 18px / 1.125rem (font-medium)
- Body Large: 16px / 1rem (font-normal)
- Body Default: 14px / 0.875rem (font-normal)
- Body Small: 13px / 0.8125rem (font-normal)
- Caption: 12px / 0.75rem (font-normal)
```

### Font Weights
- **Regular**: 400 (body text)
- **Medium**: 500 (labels, emphasized text)
- **Semibold**: 600 (headings, important text)
- **Bold**: 700 (strong emphasis - use sparingly)

### Line Heights
- **Tight**: 1.2 (headings)
- **Normal**: 1.5 (body text)
- **Relaxed**: 1.75 (long-form content)

---

## 📏 Spacing System

Use consistent spacing values based on 4px grid:
```
2px  - 0.5 (micro spacing)
4px  - 1   (xs)
8px  - 2   (sm)
12px - 3   (md)
16px - 4   (base)
20px - 5   (lg)
24px - 6   (xl)
32px - 8   (2xl)
40px - 10  (3xl)
48px - 12  (4xl)
64px - 16  (5xl)
```

---

## 🔘 Button Styles

### Button Variants

#### Primary Button
**Use**: Main call-to-action, form submissions
```tsx
<GovButton variant="primary" size="default">
  Login
</GovButton>
```
- Background: `#1f3a5f`
- Text: White
- Hover: `#2d4f7f`
- Focus: Ring `#1f3a5f/30`

#### Secondary Button
**Use**: Important secondary actions, highlighting special features
```tsx
<GovButton variant="secondary" size="default">
  Register
</GovButton>
```
- Background: `#f9a825`
- Text: `#1f3a5f`
- Hover: `#f9b23d`

#### Outline Button
**Use**: Secondary actions, cancel buttons, less prominent actions
```tsx
<GovButton variant="outline" size="default">
  Cancel
</GovButton>
```
- Background: White
- Border: Gray 300
- Text: Gray 700
- Hover: Gray 50 background

#### Ghost Button
**Use**: Tertiary actions, subtle interactions
```tsx
<GovButton variant="ghost" size="default">
  Resend OTP
</GovButton>
```
- Background: Transparent
- Text: Gray 700
- Hover: Gray 100 background

#### Link Button
**Use**: Text links that look like buttons
```tsx
<GovButton variant="link" size="default">
  Forgot Password?
</GovButton>
```
- Background: Transparent
- Text: `#0066cc`
- Underline on hover

#### Danger Button
**Use**: Destructive actions (delete, remove, etc.)
```tsx
<GovButton variant="danger" size="default">
  Delete Account
</GovButton>
```
- Background: Red 600
- Text: White
- Hover: Red 700

### Button Sizes
```tsx
<GovButton size="sm">Small</GovButton>      // h-8, text-13px
<GovButton size="default">Default</GovButton> // h-10, text-14px
<GovButton size="lg">Large</GovButton>      // h-12, text-16px
<GovButton size="xl">Extra Large</GovButton> // h-14, text-16px
```

### Full Width Button
```tsx
<GovButton fullWidth>Login</GovButton>
```

### Loading State
```tsx
<GovButton loading>Processing...</GovButton>
```

---

## 📝 Input Field Styles

### Standard Text Input

```tsx
<GovInput 
  label="Mobile Number"
  type="tel"
  placeholder="Enter 10-digit mobile number"
  required
/>
```

**Visual Specifications**:
- Height: 42px (py-2.5)
- Padding: 16px horizontal
- Border: 1.5px solid Gray 300
- Border Radius: 6px (rounded-md)
- Font Size: 14px
- Font Family: Poppins

**States**:
- **Default**: Border Gray 300, Background White
- **Hover**: Border Gray 400
- **Focus**: Border Primary Blue, Ring 2px Primary Blue/20
- **Error**: Border Red 500, Ring 2px Red/20
- **Disabled**: Background Gray 50, Text Gray 500, Border Gray 200

### Input with Error
```tsx
<GovInput 
  label="Email"
  type="email"
  error="Please enter a valid email address"
/>
```

### Input with Helper Text
```tsx
<GovInput 
  label="Password"
  type="password"
  helperText="Must be at least 8 characters"
/>
```

---

## 🎴 Card & Container Styles

### Card
- Background: White
- Border: 1px solid Gray 200
- Border Radius: 12px (rounded-xl)
- Shadow: `0px 2px 8px rgba(0, 0, 0, 0.1)`
- Padding: 32px (p-8)

### Form Container
- Max Width: 550px
- Centered on page
- Background: White card on gray page

---

## 🔄 Interactive States

### Focus States
All interactive elements should have visible focus indicators:
- **Ring**: 2px solid color with 20% opacity
- **Offset**: 2px from element edge
- **Color**: Matches element's primary color

### Hover States
- **Buttons**: Background color change (lighter/darker)
- **Links**: Underline appears
- **Inputs**: Border color darkens slightly

### Active/Pressed States
- **Buttons**: Background color darkens further
- **Scale**: Optional subtle scale down (0.98)

### Disabled States
- **Opacity**: 50%
- **Cursor**: not-allowed
- **Background**: Gray 50 (for inputs)

---

## 📋 Form Design Patterns

### Login Form Structure
```tsx
<form className="space-y-6">
  <GovInput label="Login ID" required />
  <GovInput label="Password" type="password" required />
  <GovButton variant="secondary" fullWidth size="lg">
    LOGIN
  </GovButton>
  <div className="flex justify-between text-sm">
    <GovButton variant="link" size="sm">Forgot Password?</GovButton>
    <GovButton variant="link" size="sm">Need Help?</GovButton>
  </div>
</form>
```

### Form Field Spacing
- **Between fields**: 24px (space-y-6)
- **Label to input**: 8px (mb-2)
- **Input to helper text**: 6px (mt-1.5)
- **Form to submit button**: 24px

### Required Field Indicator
- Red asterisk (*) after label
- Color: `#ef4444` (Red 600)

---

## 🎯 Component Usage Guidelines

### When to Use Each Button Type

| Variant | Use Case | Examples |
|---------|----------|----------|
| Primary | Main action on a page | Submit form, Login, Save |
| Secondary | Important highlighted action | Register, Download, Continue |
| Outline | Secondary actions | Cancel, Back, Close |
| Ghost | Tertiary actions | Resend OTP, Refresh Captcha |
| Link | Text links, minimal actions | Forgot Password?, Help, Learn More |
| Danger | Destructive actions | Delete, Remove, Logout |

### Accessibility Guidelines

1. **Color Contrast**: All text must meet WCAG AA standards (4.5:1 for normal text)
2. **Focus Indicators**: Always visible and clear
3. **Labels**: All inputs must have associated labels
4. **Error Messages**: Clear, specific, and associated with inputs
5. **Keyboard Navigation**: All interactive elements must be keyboard accessible
6. **Screen Readers**: Use proper ARIA labels and roles

---

## 📱 Responsive Design

### Breakpoints
```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

### Mobile Considerations
- Touch targets minimum 44px × 44px
- Increased padding on mobile
- Stack form elements vertically
- Full-width buttons on mobile

---

## 🔐 Government Portal Specific Guidelines

### Trust Indicators
- Display government logo prominently
- Show security badges for sensitive operations
- Use official color schemes

### Form Security
- Always show password strength indicators
- Implement CAPTCHA for public forms
- Show OTP countdown timers
- Clear session timeout warnings

### Language Support
- Provide toggle between English and Kannada
- Maintain consistent layout across languages
- Use Unicode fonts for Kannada text

---

## 🎨 Example Component Library

### Complete Login Form Example
```tsx
import { GovInput } from "@/components/ui/gov-input";
import { GovButton } from "@/components/ui/gov-button";

function LoginForm() {
  return (
    <div className="space-y-6 font-['Poppins',sans-serif]">
      <GovInput 
        label="Login ID"
        type="text"
        placeholder="Enter your login ID"
        required
      />
      
      <GovInput 
        label="Password"
        type="password"
        placeholder="Enter your password"
        required
      />
      
      <GovButton variant="secondary" fullWidth size="lg">
        LOGIN
      </GovButton>
      
      <div className="flex justify-between items-center text-sm">
        <GovButton variant="link" size="sm">
          Forgot Password?
        </GovButton>
        <GovButton variant="link" size="sm">
          Need Help?
        </GovButton>
      </div>
    </div>
  );
}
```

---

## 🚀 Implementation Checklist

- [x] Color palette defined
- [x] Typography system established
- [x] Spacing system implemented
- [x] Button component with all variants
- [x] Input component with states
- [x] Card/container styles
- [x] Focus states for accessibility
- [x] Responsive design considerations
- [x] Government-specific guidelines

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Maintained by**: Karnataka Municipal Administration Development Team
