import { GovInput } from "./components/ui/gov-input";
import { GovButton } from "./components/ui/gov-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { RefreshCw, Download, Trash2, Plus } from "lucide-react";

/**
 * Style Guide Component - Showcases all design system components
 * This component demonstrates the complete design system for the Karnataka Government Portal
 */
export default function StyleGuideShowcase() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Government Portal Design System
          </h1>
          <p className="text-lg text-gray-600 font-['Poppins',sans-serif]">
            Karnataka Municipal Administration - Component Library
          </p>
        </div>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',sans-serif]">Color Palette</CardTitle>
            <CardDescription className="font-['Poppins',sans-serif]">
              Primary colors used throughout the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-24 bg-[#1f3a5f] rounded-lg shadow-sm" />
                <p className="text-sm font-medium font-['Poppins',sans-serif]">Primary Blue</p>
                <p className="text-xs text-gray-500 font-mono">#1f3a5f</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 bg-[#f9a825] rounded-lg shadow-sm" />
                <p className="text-sm font-medium font-['Poppins',sans-serif]">Secondary Gold</p>
                <p className="text-xs text-gray-500 font-mono">#f9a825</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 bg-gray-700 rounded-lg shadow-sm" />
                <p className="text-sm font-medium font-['Poppins',sans-serif]">Gray 700</p>
                <p className="text-xs text-gray-500 font-mono">#333333</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 bg-[#0066cc] rounded-lg shadow-sm" />
                <p className="text-sm font-medium font-['Poppins',sans-serif]">Info Blue</p>
                <p className="text-xs text-gray-500 font-mono">#0066cc</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',sans-serif]">Typography</CardTitle>
            <CardDescription className="font-['Poppins',sans-serif]">
              Font family: Poppins (sans-serif)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-[28px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                Heading 1 - 28px Semibold
              </h1>
              <h2 className="text-[24px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                Heading 2 - 24px Semibold
              </h2>
              <h3 className="text-[20px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                Heading 3 - 20px Semibold
              </h3>
              <h4 className="text-[18px] font-medium text-gray-900 font-['Poppins',sans-serif]">
                Heading 4 - 18px Medium
              </h4>
              <p className="text-[16px] text-gray-900 font-['Poppins',sans-serif]">
                Body Large - 16px Regular
              </p>
              <p className="text-[14px] text-gray-900 font-['Poppins',sans-serif]">
                Body Default - 14px Regular (Most common)
              </p>
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                Body Small - 13px Regular
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',sans-serif]">Button Variants</CardTitle>
            <CardDescription className="font-['Poppins',sans-serif]">
              All button styles with different variants and sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Button Variants */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 font-['Poppins',sans-serif]">
                Button Variants (Default Size)
              </h4>
              <div className="flex flex-wrap gap-3">
                <GovButton variant="primary">Primary Button</GovButton>
                <GovButton variant="secondary">Secondary Button</GovButton>
                <GovButton variant="outline">Outline Button</GovButton>
                <GovButton variant="ghost">Ghost Button</GovButton>
                <GovButton variant="link">Link Button</GovButton>
                <GovButton variant="danger">Danger Button</GovButton>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 font-['Poppins',sans-serif]">
                Button Sizes (Primary Variant)
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <GovButton variant="primary" size="sm">Small</GovButton>
                <GovButton variant="primary" size="default">Default</GovButton>
                <GovButton variant="primary" size="lg">Large</GovButton>
                <GovButton variant="primary" size="xl">Extra Large</GovButton>
              </div>
            </div>

            {/* Buttons with Icons */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 font-['Poppins',sans-serif]">
                Buttons with Icons
              </h4>
              <div className="flex flex-wrap gap-3">
                <GovButton variant="primary">
                  <Plus className="h-4 w-4" />
                  Add New
                </GovButton>
                <GovButton variant="outline">
                  <Download className="h-4 w-4" />
                  Download
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
            </div>

            {/* Button States */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 font-['Poppins',sans-serif]">
                Button States
              </h4>
              <div className="flex flex-wrap gap-3">
                <GovButton variant="primary">Normal</GovButton>
                <GovButton variant="primary" disabled>Disabled</GovButton>
                <GovButton variant="primary" loading>Loading</GovButton>
              </div>
            </div>

            {/* Full Width Button */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 font-['Poppins',sans-serif]">
                Full Width Button
              </h4>
              <GovButton variant="secondary" fullWidth size="lg">
                Full Width Button
              </GovButton>
            </div>
          </CardContent>
        </Card>

        {/* Input Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',sans-serif]">Input Fields</CardTitle>
            <CardDescription className="font-['Poppins',sans-serif]">
              Form input components with various states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Input */}
              <GovInput 
                label="Basic Input"
                type="text"
                placeholder="Enter text here"
              />

              {/* Required Input */}
              <GovInput 
                label="Required Input"
                type="text"
                placeholder="This field is required"
                required
              />

              {/* Input with Helper Text */}
              <GovInput 
                label="With Helper Text"
                type="email"
                placeholder="name@example.com"
                helperText="We'll never share your email"
              />

              {/* Input with Error */}
              <GovInput 
                label="With Error"
                type="text"
                placeholder="Invalid input"
                error="This field contains an error"
              />

              {/* Password Input */}
              <GovInput 
                label="Password"
                type="password"
                placeholder="Enter your password"
                required
              />

              {/* Disabled Input */}
              <GovInput 
                label="Disabled Input"
                type="text"
                placeholder="Cannot edit"
                disabled
                value="Disabled value"
              />

              {/* Number Input */}
              <GovInput 
                label="Mobile Number"
                type="tel"
                placeholder="Enter 10-digit number"
                maxLength={10}
                required
              />

              {/* OTP Input */}
              <GovInput 
                label="OTP"
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                helperText="OTP valid for 10 minutes"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Example */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',sans-serif]">Complete Form Example</CardTitle>
            <CardDescription className="font-['Poppins',sans-serif]">
              A typical government portal login form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6 max-w-md" onSubmit={(e) => e.preventDefault()}>
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

              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]">
                  Captcha <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-3 items-center mb-3">
                  <div className="flex-1 h-[52px] bg-gradient-to-br from-gray-100 to-gray-200 border-[1.5px] border-gray-300 rounded-md flex items-center justify-center text-[22px] font-mono tracking-[0.3em] select-none font-bold text-gray-700 shadow-sm">
                    C1ad2C
                  </div>
                  <GovButton 
                    type="button"
                    variant="outline" 
                    size="default"
                    className="h-[52px] px-4"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </GovButton>
                </div>
                <GovInput 
                  type="text"
                  placeholder="Enter the text shown above"
                  required
                />
              </div>
              
              <GovButton variant="secondary" fullWidth size="lg" type="submit">
                LOGIN
              </GovButton>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <GovButton variant="link" size="sm" type="button">
                  Forgot Password?
                </GovButton>
                <GovButton variant="link" size="sm" type="button">
                  Need Help?
                </GovButton>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tabs Example */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',sans-serif]">Tab Navigation</CardTitle>
            <CardDescription className="font-['Poppins',sans-serif]">
              Tabbed interface for different login types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="citizen" className="w-full">
              <TabsList className="w-full bg-gray-50 h-auto p-0 border-b border-gray-200">
                <TabsTrigger 
                  value="citizen" 
                  className="flex-1 font-['Poppins',sans-serif] text-[15px] py-3"
                >
                  Citizen Login
                </TabsTrigger>
                <TabsTrigger 
                  value="department"
                  className="flex-1 font-['Poppins',sans-serif] text-[15px] py-3"
                >
                  Department Login
                </TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="citizen">
                  <p className="text-gray-600 font-['Poppins',sans-serif]">
                    Citizen login form content goes here...
                  </p>
                </TabsContent>
                
                <TabsContent value="department">
                  <p className="text-gray-600 font-['Poppins',sans-serif]">
                    Department login form content goes here...
                  </p>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',sans-serif]">Usage Guidelines</CardTitle>
            <CardDescription className="font-['Poppins',sans-serif]">
              Best practices for using the design system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 font-['Poppins',sans-serif]">Button Usage</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 font-['Poppins',sans-serif]">
                <li><strong>Primary:</strong> Main actions (Submit, Login, Save)</li>
                <li><strong>Secondary:</strong> Important highlighted actions (Register, Download)</li>
                <li><strong>Outline:</strong> Secondary actions (Cancel, Back, Close)</li>
                <li><strong>Ghost:</strong> Tertiary actions (Resend OTP, Refresh)</li>
                <li><strong>Link:</strong> Text links (Forgot Password?, Help)</li>
                <li><strong>Danger:</strong> Destructive actions (Delete, Remove)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 font-['Poppins',sans-serif]">Input Field Best Practices</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 font-['Poppins',sans-serif]">
                <li>Always include clear labels</li>
                <li>Mark required fields with red asterisk</li>
                <li>Provide helpful helper text when needed</li>
                <li>Show clear error messages</li>
                <li>Use appropriate input types (tel, email, password, etc.)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 font-['Poppins',sans-serif]">Accessibility</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 font-['Poppins',sans-serif]">
                <li>All components meet WCAG AA standards</li>
                <li>Keyboard navigation fully supported</li>
                <li>Proper ARIA labels included</li>
                <li>Focus states clearly visible</li>
                <li>Color contrast ratios compliant</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 font-['Poppins',sans-serif] py-8">
          <p>Karnataka Government Portal Design System v1.0.0</p>
          <p className="mt-2">For internal use by Municipal Administration Development Team</p>
        </div>
      </div>
    </div>
  );
}
