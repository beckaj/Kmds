# Government Portal Design System

## 📋 Overview

A comprehensive design system for Karnataka Government's Municipal Administration portal, built with React, TypeScript, and Tailwind CSS. This system provides consistent, accessible, and professional UI components for large-scale government applications.

## 🎯 Key Features

- **Production-Ready Components**: Professional input fields, buttons, and form elements
- **Accessibility First**: WCAG AA compliant with proper ARIA labels and keyboard navigation
- **Consistent Styling**: Unified design language across all components
- **Government-Specific**: Tailored for official government portals
- **TypeScript Support**: Full type safety for enterprise applications
- **Responsive Design**: Mobile-first approach with tablet and desktop support

## 🚀 Quick Start

### Using the Components

```tsx
import { GovInput } from "@/components/ui/gov-input";
import { GovButton } from "@/components/ui/gov-button";

function MyForm() {
  return (
    <form className="space-y-6">
      <GovInput 
        label="Email Address"
        type="email"
        placeholder="name@example.com"
        required
        helperText="We'll never share your email"
      />
      
      <GovButton variant="secondary" fullWidth size="lg">
        Submit
      </GovButton>
    </form>
  );
}
```

## 📦 Available Components

### GovInput
Professional input field component with states for error, disabled, and helper text.

**Props:**
- `label` - Field label
- `required` - Shows red asterisk if true
- `error` - Error message to display
- `helperText` - Helper text below input
- All standard HTML input props

**Variants:**
- Text, Email, Password, Tel, Number, etc.

### GovButton
Versatile button component with multiple variants and sizes.

**Variants:**
- `primary` - Main actions (dark blue)
- `secondary` - Highlighted actions (gold)
- `outline` - Secondary actions (bordered)
- `ghost` - Tertiary actions (transparent)
- `link` - Text links
- `danger` - Destructive actions (red)

**Sizes:**
- `sm` - Small (h-8)
- `default` - Default (h-10)
- `lg` - Large (h-12)
- `xl` - Extra Large (h-14)

**Props:**
- `variant` - Button style variant
- `size` - Button size
- `fullWidth` - Make button full width
- `loading` - Show loading spinner
- `disabled` - Disable button

## 🎨 Design Tokens

### Colors
```css
Primary Blue: #1f3a5f
Secondary Gold: #f9a825
Error Red: #ef4444
Success Green: #10b981
Info Blue: #0066cc
```

### Typography
```css
Font Family: Poppins, sans-serif
Font Sizes: 12px, 13px, 14px, 16px, 18px, 20px, 24px, 28px
Font Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
```

### Spacing
Based on 4px grid system (Tailwind spacing scale)

## 📖 Style Guide

View the complete style guide with live examples:
```tsx
import StyleGuideShowcase from "@/app/StyleGuideShowcase";
```

Or read the full documentation in `STYLE_GUIDE.md`

## 🎯 Usage Guidelines

### When to Use Each Button Variant

| Variant | Use Case | Examples |
|---------|----------|----------|
| Primary | Main page action | Login, Submit Form, Save |
| Secondary | Important highlight | Register, Download, Continue |
| Outline | Secondary actions | Cancel, Back, Close |
| Ghost | Tertiary actions | Resend OTP, Refresh Captcha |
| Link | Navigation/help | Forgot Password?, Help |
| Danger | Destructive | Delete, Remove, Logout |

### Form Best Practices

1. **Always label inputs** - Use the `label` prop
2. **Mark required fields** - Use `required` prop for red asterisk
3. **Provide helpful hints** - Use `helperText` for guidance
4. **Show clear errors** - Use `error` prop with specific messages
5. **Use proper input types** - tel, email, password, etc.

### Accessibility

✅ All components include:
- Proper ARIA labels
- Keyboard navigation support
- Focus indicators (visible outlines)
- Color contrast compliance (WCAG AA)
- Screen reader compatibility

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── ui/
│   │       ├── gov-input.tsx      # Input component
│   │       ├── gov-button.tsx     # Button component
│   │       ├── card.tsx           # Card components
│   │       └── tabs.tsx           # Tab components
│   ├── App.tsx                    # Main login page
│   └── StyleGuideShowcase.tsx     # Style guide demo
├── imports/
│   ├── Header.tsx                 # Government header
│   └── Footer.tsx                 # Government footer
└── styles/
    └── theme.css                  # Global theme styles
```

## 🔧 Development

### Installing Dependencies
```bash
npm install
# or
pnpm install
```

### Running the Application
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## 📱 Responsive Design

Components are built mobile-first:
- **Mobile**: < 640px (Touch targets 44px+)
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Component Examples

### Complete Login Form
```tsx
<form className="space-y-6">
  <GovInput 
    label="Mobile Number"
    type="tel"
    placeholder="Enter 10-digit number"
    maxLength={10}
    required
    helperText="We'll send you an OTP"
  />
  
  <GovInput 
    label="Enter OTP"
    type="text"
    placeholder="6-digit OTP"
    maxLength={6}
    required
  />
  
  <GovButton variant="secondary" fullWidth size="lg">
    LOGIN
  </GovButton>
  
  <div className="flex justify-between">
    <GovButton variant="link" size="sm">
      Forgot Mobile Number?
    </GovButton>
    <GovButton variant="link" size="sm">
      New User? Register
    </GovButton>
  </div>
</form>
```

### Button with Loading State
```tsx
const [loading, setLoading] = useState(false);

<GovButton 
  variant="primary" 
  loading={loading}
  onClick={() => setLoading(true)}
>
  Send OTP
</GovButton>
```

### Input with Error Handling
```tsx
const [error, setError] = useState("");

<GovInput 
  label="Email"
  type="email"
  error={error}
  onChange={(e) => {
    if (!e.target.value.includes("@")) {
      setError("Please enter a valid email");
    } else {
      setError("");
    }
  }}
/>
```

## 🤝 Contributing

This design system is maintained by the Karnataka Municipal Administration Development Team. For changes or suggestions:

1. Review the style guide
2. Ensure accessibility compliance
3. Test on all supported browsers
4. Update documentation

## 📄 License

Government of Karnataka - Internal Use Only

## 📞 Support

For technical support or design questions, contact the Municipal Administration Development Team.

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Maintained by**: Karnataka Government - Municipal Administration
