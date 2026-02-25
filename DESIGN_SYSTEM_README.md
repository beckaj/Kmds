# Karnataka Government Portal - Design System

## 🎨 Overview

A comprehensive design system built specifically for the Karnataka Government's Municipal Administration portal. All colors and styling are extracted directly from the government portal header design.

---

## 🎯 Color System (Based on Header)

### Primary Colors (Extracted from Header)

#### 1. Primary - Dark Blue
- **Color**: `#1f3a5f`
- **Source**: Header background color
- **Usage**: Primary buttons, main brand color, header elements
- **Component**: `<GovButton variant="primary">`

#### 2. Secondary - Light Blue  
- **Color**: `#91c7ff`
- **Source**: Header accent (font size controls)
- **Usage**: Secondary buttons, accents, highlights
- **Component**: `<GovButton variant="secondary">`

#### 3. Accent - Cyan
- **Color**: `#009fbc`
- **Source**: Header border color (toggle border)
- **Usage**: Call-to-action buttons, focus rings, highlights
- **Component**: `<GovButton variant="accent">`

### Semantic Colors

- **Success**: `#10b981` - Confirmations, positive actions
- **Warning**: `#f59e0b` - Warnings, caution messages
- **Error**: `#ef4444` - Errors, destructive actions
- **Info**: `#0066cc` - Links, information

---

## 📦 Components

### GovButton - 8 Variants

```tsx
// Primary - Main actions (Dark Blue #1f3a5f)
<GovButton variant="primary">Login</GovButton>

// Secondary - Important actions (Light Blue #91c7ff)
<GovButton variant="secondary">Register</GovButton>

// Accent - Call-to-action (Cyan #009fbc)
<GovButton variant="accent">Send OTP</GovButton>

// Outline - Secondary actions
<GovButton variant="outline">Cancel</GovButton>

// Ghost - Tertiary actions
<GovButton variant="ghost">Resend OTP</GovButton>

// Link - Navigation
<GovButton variant="link">Forgot Password?</GovButton>

// Danger - Destructive (Red #ef4444)
<GovButton variant="danger">Delete</GovButton>

// Success - Confirmations (Green #10b981)
<GovButton variant="success">Approve</GovButton>
```

### GovInput - Professional Form Inputs

```tsx
<GovInput 
  label="Mobile Number"
  type="tel"
  placeholder="Enter 10-digit number"
  required
  helperText="We'll send you an OTP"
  error="Please enter a valid number" // Optional
/>
```

**Features**:
- Labels with required indicators (red asterisk)
- Error states with validation messages
- Helper text for guidance
- Focus states with proper rings
- Disabled states
- Full accessibility support

---

## 📚 Documentation

### Main Style Guide
**File**: `/STYLE_GUIDE_V2.md`
- Complete color palette with hex codes
- Typography system
- Button variants and usage
- Input field specifications
- Spacing system
- Accessibility guidelines
- Code examples

### Visual Style Guide
**File**: `/src/app/pages/StyleGuide.tsx`
- Interactive component showcase
- Live examples of all buttons
- Input field demonstrations
- Color palette visualization
- Typography examples
- Usage guidelines (Do's and Don'ts)

To view the visual style guide, import it in your app:
```tsx
import StyleGuide from "./pages/StyleGuide";
// Then render <StyleGuide />
```

---

## 🚀 Quick Start

### 1. Using Buttons

```tsx
import { GovButton } from "@/components/ui/gov-button";

// Basic usage
<GovButton variant="primary">Click me</GovButton>

// With size
<GovButton variant="accent" size="lg">Send OTP</GovButton>

// Full width
<GovButton variant="secondary" fullWidth>LOGIN</GovButton>

// With loading state
<GovButton variant="primary" loading>Processing...</GovButton>

// With icon
<GovButton variant="outline">
  <RefreshCw className="h-4 w-4" />
  Refresh
</GovButton>
```

### 2. Using Inputs

```tsx
import { GovInput } from "@/components/ui/gov-input";

// Basic input
<GovInput 
  label="Email Address"
  type="email"
  placeholder="name@example.com"
  required
/>

// With helper text
<GovInput 
  label="Password"
  type="password"
  helperText="Must be at least 8 characters"
  required
/>

// With error
<GovInput 
  label="Mobile Number"
  type="tel"
  error="Please enter a valid mobile number"
/>
```

### 3. Login Form Example

```tsx
<form className="space-y-6">
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
  
  <GovButton variant="secondary" fullWidth size="lg">
    LOGIN
  </GovButton>
  
  <div className="flex justify-between">
    <GovButton variant="link" size="sm">
      Forgot Password?
    </GovButton>
    <GovButton variant="link" size="sm">
      Need Help?
    </GovButton>
  </div>
</form>
```

---

## 🎯 When to Use Each Button Variant

| Variant | Use Case | Examples |
|---------|----------|----------|
| **Primary** | Main page action | Login, Submit Form, Save |
| **Secondary** | Important highlight | Register, Download Report |
| **Accent** | Call-to-action | Send OTP, Verify, Get Started |
| **Outline** | Secondary actions | Cancel, Back, Close Modal |
| **Ghost** | Tertiary actions | Resend OTP, Refresh Captcha |
| **Link** | Navigation/help | Forgot Password?, Help, Learn More |
| **Danger** | Destructive | Delete Account, Remove Item |
| **Success** | Confirmations | Approve Application, Accept |

---

## 📐 Design Tokens

### Button Sizes
```tsx
size="sm"      // h-8, text-13px
size="default" // h-10, text-14px (Default)
size="lg"      // h-12, text-16px
size="xl"      // h-14, text-16px
```

### Spacing (Form Fields)
```tsx
className="space-y-6"  // 24px between fields
```

### Border Radius
```
rounded-md  // 6px (inputs)
rounded-lg  // 8px
rounded-xl  // 12px (cards)
```

---

## ♿ Accessibility

All components include:
- ✅ WCAG AA color contrast compliance
- ✅ Keyboard navigation support
- ✅ Visible focus indicators
- ✅ Proper ARIA labels
- ✅ Screen reader compatibility
- ✅ Error message association
- ✅ Required field indicators

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Considerations
- Touch targets minimum 44px
- Full-width buttons on mobile
- Increased padding for touch

---

## 🏗️ File Structure

```
src/
├── app/
│   ├── components/
│   │   └── ui/
│   │       ├── gov-button.tsx    ✅ Updated with header colors
│   │       ├── gov-input.tsx     ✅ Professional inputs
│   │       ├── card.tsx
│   │       └── tabs.tsx
│   ├── pages/
│   │   └── StyleGuide.tsx        ✅ Visual showcase
│   └── App.tsx                   ✅ Login page with new styling
├── imports/
│   ├── Header.tsx                 🎨 Color source
│   └── Footer.tsx
└── STYLE_GUIDE_V2.md             ✅ Complete documentation
```

---

## 🎨 Color Extraction Process

The design system colors were extracted from the Header component:

1. **Primary Dark Blue (#1f3a5f)**
   - Location: Header background (`bg-[#1f3a5f]`)
   - Line 175, 101 in Header.tsx
   - Used for: Primary buttons, toggle switches

2. **Secondary Light Blue (#91c7ff)**
   - Location: Font size control accent (`bg-[#91c7ff]`)
   - Line 15 in Header.tsx
   - Used for: Secondary buttons, highlights

3. **Accent Cyan (#009fbc)**
   - Location: Toggle border (`border-[#009fbc]`)
   - Line 17 in Header.tsx
   - Used for: Call-to-action, focus rings

---

## 📋 Best Practices

### Do's ✅
- Use Primary button for main page action
- Use Accent button for OTP/verification CTAs
- Always provide labels for inputs
- Mark required fields with asterisk
- Provide helpful error messages

### Don'ts ❌
- Don't use multiple Primary buttons on one page
- Don't use Danger button for non-destructive actions
- Don't create inputs without labels
- Don't use placeholder as label replacement
- Don't mix button sizes inconsistently

---

## 📞 Support

For questions or contributions:
- Review `/STYLE_GUIDE_V2.md` for complete documentation
- Check `/src/app/pages/StyleGuide.tsx` for visual examples
- Reference header design for color accuracy

---

## 📊 Version Information

- **Version**: 2.0.0
- **Based on**: Karnataka Government Portal Header
- **Primary Color**: #1f3a5f (Dark Blue)
- **Secondary Color**: #91c7ff (Light Blue)
- **Accent Color**: #009fbc (Cyan)
- **Last Updated**: February 2026
- **Maintained by**: Karnataka Municipal Administration Development Team

---

## 🚀 What's New in v2.0

✅ **Colors extracted from actual header design**
✅ **8 button variants** (added Accent and Success)
✅ **Updated tab styling** with gradient header
✅ **Comprehensive documentation**
✅ **Visual style guide component**
✅ **Professional input fields**
✅ **Full accessibility support**

---

**The design system is production-ready and aligned with the government portal's visual identity.**
