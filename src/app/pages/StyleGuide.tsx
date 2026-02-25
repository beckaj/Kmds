import { GovInput } from "../components/ui/gov-input";
import { GovButton } from "../components/ui/gov-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { RefreshCw, Download, Trash2, Plus, Check, AlertTriangle, Info } from "lucide-react";

/**
 * COMPREHENSIVE STYLE GUIDE
 * Based on Karnataka Government Portal Header Design
 * 
 * Primary Color: #1f3a5f (Dark Blue - from header background)
 * Secondary Color: #91c7ff (Light Blue - from header accent)
 * Accent Color: #009fbc (Cyan - from header border)
 */
export default function StyleGuide() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-6 bg-white rounded-xl shadow-sm p-12 border border-gray-200">
          <div className="inline-block px-6 py-2 bg-[#1f3a5f] text-white rounded-full text-sm font-semibold mb-4 font-['Poppins',sans-serif]">
            Design System v2.0
          </div>
          <h1 className="text-5xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Karnataka Government Portal
          </h1>
          <h2 className="text-2xl text-gray-600 font-['Poppins',sans-serif]">
            Design System & Component Library
          </h2>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto font-['Poppins',sans-serif]">
            A comprehensive design system based on the government portal header, 
            providing consistent, accessible, and professional UI components.
          </p>
        </div>

        {/* Color Palette Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 font-['Poppins',sans-serif]">
              🎨 Color Palette
            </h2>
            <p className="text-gray-600 font-['Poppins',sans-serif]">
              Colors extracted from the Karnataka Government Portal header design
            </p>
          </div>

          {/* Primary Colors from Header */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-['Poppins',sans-serif]">Primary Colors (From Header)</CardTitle>
              <CardDescription className="font-['Poppins',sans-serif]">
                Core brand colors extracted directly from the government portal header
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Primary Dark Blue */}
                <div className="space-y-3">
                  <div className="h-32 bg-[#1f3a5f] rounded-lg shadow-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm font-['Poppins',sans-serif]">Header Background</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">Primary - Dark Blue</p>
                    <p className="text-xs text-gray-500 font-mono">#1f3a5f</p>
                    <p className="text-xs text-gray-600 mt-1 font-['Poppins',sans-serif]">Main brand color, primary buttons, header</p>
                  </div>
                </div>

                {/* Secondary Light Blue */}
                <div className="space-y-3">
                  <div className="h-32 bg-[#91c7ff] rounded-lg shadow-md flex items-center justify-center">
                    <span className="text-[#1f3a5f] font-semibold text-sm font-['Poppins',sans-serif]">Header Accent</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">Secondary - Light Blue</p>
                    <p className="text-xs text-gray-500 font-mono">#91c7ff</p>
                    <p className="text-xs text-gray-600 mt-1 font-['Poppins',sans-serif]">Secondary buttons, accents, highlights</p>
                  </div>
                </div>

                {/* Accent Cyan */}
                <div className="space-y-3">
                  <div className="h-32 bg-[#009fbc] rounded-lg shadow-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm font-['Poppins',sans-serif]">Header Border</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">Accent - Cyan</p>
                    <p className="text-xs text-gray-500 font-mono">#009fbc</p>
                    <p className="text-xs text-gray-600 mt-1 font-['Poppins',sans-serif]">Call-to-action, borders, focus states</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Semantic Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="font-['Poppins',sans-serif]">Semantic Colors</CardTitle>
              <CardDescription className="font-['Poppins',sans-serif]">
                Colors for success, warning, error, and information states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-24 bg-[#10b981] rounded-lg shadow-sm" />
                  <p className="text-sm font-medium font-['Poppins',sans-serif]">Success</p>
                  <p className="text-xs text-gray-500 font-mono">#10b981</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-[#f59e0b] rounded-lg shadow-sm" />
                  <p className="text-sm font-medium font-['Poppins',sans-serif]">Warning</p>
                  <p className="text-xs text-gray-500 font-mono">#f59e0b</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-[#ef4444] rounded-lg shadow-sm" />
                  <p className="text-sm font-medium font-['Poppins',sans-serif]">Error/Danger</p>
                  <p className="text-xs text-gray-500 font-mono">#ef4444</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-[#0066cc] rounded-lg shadow-sm" />
                  <p className="text-sm font-medium font-['Poppins',sans-serif]">Info</p>
                  <p className="text-xs text-gray-500 font-mono">#0066cc</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 font-['Poppins',sans-serif]">
              🔤 Typography
            </h2>
            <p className="text-gray-600 font-['Poppins',sans-serif]">
              Font family: Poppins (sans-serif) - Used throughout the application
            </p>
          </div>

          <Card>
            <CardContent className="space-y-8 pt-6">
              <div className="space-y-4">
                <div className="border-l-4 border-[#1f3a5f] pl-4">
                  <h1 className="text-[32px] font-bold text-gray-900 font-['Poppins',sans-serif]">
                    Display - 32px Bold
                  </h1>
                  <p className="text-sm text-gray-500 font-mono mt-1">font-bold, text-[32px]</p>
                </div>
                
                <div className="border-l-4 border-[#91c7ff] pl-4">
                  <h1 className="text-[28px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    Heading 1 - 28px Semibold
                  </h1>
                  <p className="text-sm text-gray-500 font-mono mt-1">font-semibold, text-[28px]</p>
                </div>
                
                <div className="border-l-4 border-[#009fbc] pl-4">
                  <h2 className="text-[24px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    Heading 2 - 24px Semibold
                  </h2>
                  <p className="text-sm text-gray-500 font-mono mt-1">font-semibold, text-[24px]</p>
                </div>
                
                <div className="border-l-4 border-gray-300 pl-4">
                  <h3 className="text-[20px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                    Heading 3 - 20px Semibold
                  </h3>
                  <p className="text-sm text-gray-500 font-mono mt-1">font-semibold, text-[20px]</p>
                </div>
                
                <div className="border-l-4 border-gray-200 pl-4">
                  <h4 className="text-[18px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                    Heading 4 - 18px Medium
                  </h4>
                  <p className="text-sm text-gray-500 font-mono mt-1">font-medium, text-[18px]</p>
                </div>
                
                <div className="pl-4">
                  <p className="text-[16px] text-gray-900 font-['Poppins',sans-serif]">
                    Body Large - 16px Regular - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                  <p className="text-sm text-gray-500 font-mono mt-1">font-normal, text-[16px]</p>
                </div>
                
                <div className="pl-4">
                  <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif]">
                    Body Default - 14px Regular - This is the standard body text size used throughout the application.
                  </p>
                  <p className="text-sm text-gray-500 font-mono mt-1">font-normal, text-[14px] (Most common)</p>
                </div>
                
                <div className="pl-4">
                  <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                    Body Small - 13px Regular - Helper text, captions, and secondary information.
                  </p>
                  <p className="text-sm text-gray-500 font-mono mt-1">font-normal, text-[13px]</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Button System Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 font-['Poppins',sans-serif]">
              🔘 Button System
            </h2>
            <p className="text-gray-600 font-['Poppins',sans-serif]">
              Comprehensive button variants with clear use cases
            </p>
          </div>

          {/* Button Variants */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-['Poppins',sans-serif]">Button Variants</CardTitle>
              <CardDescription className="font-['Poppins',sans-serif]">
                All available button styles based on the government portal color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Primary Button */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <GovButton variant="primary">Primary Button</GovButton>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">Primary - Dark Blue (#1f3a5f)</p>
                    <p className="text-xs text-gray-600 font-['Poppins',sans-serif]">Use for: Main actions, form submissions (Login, Submit, Save)</p>
                  </div>
                </div>
              </div>

              {/* Secondary Button */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <GovButton variant="secondary">Secondary Button</GovButton>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">Secondary - Light Blue (#91c7ff)</p>
                    <p className="text-xs text-gray-600 font-['Poppins',sans-serif]">Use for: Important secondary actions (Register, Download, Export)</p>
                  </div>
                </div>
              </div>

              {/* Accent Button */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <GovButton variant="accent">Accent Button</GovButton>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">Accent - Cyan (#009fbc)</p>
                    <p className="text-xs text-gray-600 font-['Poppins',sans-serif]">Use for: Call-to-action (Send OTP, Verify, Get Started)</p>
                  </div>
                </div>
              </div>

              {/* Outline Button */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <GovButton variant="outline">Outline Button</GovButton>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">Outline - Neutral</p>
                    <p className="text-xs text-gray-600 font-['Poppins',sans-serif]">Use for: Secondary actions (Cancel, Back, Close)</p>
                  </div>
                </div>
              </div>

              {/* Ghost Button */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <GovButton variant="ghost">Ghost Button</GovButton>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">Ghost - Transparent</p>
                    <p className="text-xs text-gray-600 font-['Poppins',sans-serif]">Use for: Tertiary actions (Resend OTP, Refresh)</p>
                  </div>
                </div>
              </div>

              {/* Link Button */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <GovButton variant="link">Link Button</GovButton>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">Link - Blue (#0066cc)</p>
                    <p className="text-xs text-gray-600 font-['Poppins',sans-serif]">Use for: Navigation links (Forgot Password?, Help)</p>
                  </div>
                </div>
              </div>

              {/* Danger Button */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <GovButton variant="danger">Danger Button</GovButton>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">Danger - Red (#ef4444)</p>
                    <p className="text-xs text-gray-600 font-['Poppins',sans-serif]">Use for: Destructive actions (Delete, Remove, Logout)</p>
                  </div>
                </div>
              </div>

              {/* Success Button */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <GovButton variant="success">Success Button</GovButton>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins',sans-serif]">Success - Green (#10b981)</p>
                    <p className="text-xs text-gray-600 font-['Poppins',sans-serif]">Use for: Confirmations (Approve, Accept, Confirm)</p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Button Sizes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-['Poppins',sans-serif]">Button Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-2">
                  <GovButton variant="primary" size="sm">Small (sm)</GovButton>
                  <p className="text-xs text-gray-500 font-mono">h-8, text-13px</p>
                </div>
                <div className="space-y-2">
                  <GovButton variant="primary" size="default">Default</GovButton>
                  <p className="text-xs text-gray-500 font-mono">h-10, text-14px</p>
                </div>
                <div className="space-y-2">
                  <GovButton variant="primary" size="lg">Large (lg)</GovButton>
                  <p className="text-xs text-gray-500 font-mono">h-12, text-16px</p>
                </div>
                <div className="space-y-2">
                  <GovButton variant="primary" size="xl">Extra Large (xl)</GovButton>
                  <p className="text-xs text-gray-500 font-mono">h-14, text-16px</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buttons with Icons */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-['Poppins',sans-serif]">Buttons with Icons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <GovButton variant="primary">
                  <Plus className="h-4 w-4" />
                  Add New
                </GovButton>
                <GovButton variant="secondary">
                  <Download className="h-4 w-4" />
                  Download
                </GovButton>
                <GovButton variant="accent">
                  <Check className="h-4 w-4" />
                  Verify
                </GovButton>
                <GovButton variant="outline">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </GovButton>
                <GovButton variant="danger">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </GovButton>
              </div>
            </CardContent>
          </Card>

          {/* Button States */}
          <Card>
            <CardHeader>
              <CardTitle className="font-['Poppins',sans-serif]">Button States</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <GovButton variant="primary">Normal</GovButton>
                <GovButton variant="primary" disabled>Disabled</GovButton>
                <GovButton variant="primary" loading>Loading</GovButton>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Input Fields Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 font-['Poppins',sans-serif]">
              📝 Input Fields
            </h2>
            <p className="text-gray-600 font-['Poppins',sans-serif]">
              Professional form inputs with validation states
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GovInput 
                  label="Basic Input"
                  type="text"
                  placeholder="Enter text here"
                />

                <GovInput 
                  label="Required Input"
                  type="text"
                  placeholder="This field is required"
                  required
                />

                <GovInput 
                  label="With Helper Text"
                  type="email"
                  placeholder="name@example.com"
                  helperText="We'll never share your email"
                />

                <GovInput 
                  label="With Error"
                  type="text"
                  placeholder="Invalid input"
                  error="This field contains an error"
                />

                <GovInput 
                  label="Password Input"
                  type="password"
                  placeholder="Enter your password"
                  required
                />

                <GovInput 
                  label="Mobile Number"
                  type="tel"
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  helperText="Format: 9876543210"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Usage Guidelines */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 font-['Poppins',sans-serif]">
              📋 Usage Guidelines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',sans-serif] flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#10b981]" />
                  Do's
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm font-['Poppins',sans-serif]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">✓</span>
                    <span>Use Primary button for main page actions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">✓</span>
                    <span>Use Accent button for call-to-action (Send OTP)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">✓</span>
                    <span>Always provide labels for input fields</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">✓</span>
                    <span>Mark required fields with red asterisk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">✓</span>
                    <span>Use helper text for additional guidance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',sans-serif] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-[#f59e0b]" />
                  Don'ts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm font-['Poppins',sans-serif]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ef4444] mt-0.5">✗</span>
                    <span>Don't use multiple Primary buttons on one page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ef4444] mt-0.5">✗</span>
                    <span>Don't use Danger button for non-destructive actions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ef4444] mt-0.5">✗</span>
                    <span>Don't create inputs without labels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ef4444] mt-0.5">✗</span>
                    <span>Don't use placeholder as a replacement for labels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ef4444] mt-0.5">✗</span>
                    <span>Don't mix button sizes inconsistently</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-12 border-t border-gray-200">
          <p className="text-sm text-gray-500 font-['Poppins',sans-serif]">
            Karnataka Government Portal Design System v2.0.0
          </p>
          <p className="text-xs text-gray-400 mt-2 font-['Poppins',sans-serif]">
            Based on Header Design | Colors: #1f3a5f, #91c7ff, #009fbc
          </p>
          <p className="text-xs text-gray-400 mt-1 font-['Poppins',sans-serif]">
            Maintained by Municipal Administration Development Team | February 2026
          </p>
        </div>

      </div>
    </div>
  );
}
