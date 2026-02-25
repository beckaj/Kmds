import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const govButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-['Poppins',sans-serif] font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Primary - Dark Blue (from header #1f3a5f)
        primary: 
          "bg-[#1f3a5f] text-white hover:bg-[#2d4f7f] active:bg-[#15283f] focus:ring-[#1f3a5f]/30 shadow-sm",
        
        // Secondary - Light Blue (from header accent #91c7ff)
        secondary: 
          "bg-[#91c7ff] text-[#1f3a5f] hover:bg-[#a8d4ff] active:bg-[#7ab8ff] focus:ring-[#91c7ff]/30 shadow-sm font-semibold",
        
        // Accent - Cyan (from header border #009fbc)
        accent: 
          "bg-[#009fbc] text-white hover:bg-[#00b8d9] active:bg-[#008299] focus:ring-[#009fbc]/30 shadow-sm",
        
        // Outline - Neutral secondary actions
        outline: 
          "border-[1.5px] border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 focus:ring-gray-300/30",
        
        // Ghost - Tertiary actions
        ghost: 
          "text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300/30",
        
        // Link - Text links
        link: 
          "text-[#0066cc] underline-offset-4 hover:underline focus:ring-[#0066cc]/30 p-0 h-auto",
        
        // Danger - Destructive actions
        danger:
          "bg-[#ef4444] text-white hover:bg-[#dc2626] active:bg-[#b91c1c] focus:ring-[#ef4444]/30 shadow-sm",
        
        // Success - Positive confirmations
        success:
          "bg-[#10b981] text-white hover:bg-[#059669] active:bg-[#047857] focus:ring-[#10b981]/30 shadow-sm",
      },
      size: {
        sm: "h-8 px-3 py-1.5 text-[13px] rounded-md",
        default: "h-10 px-5 py-2.5 text-[14px]",
        lg: "h-12 px-6 py-3 text-[16px]",
        xl: "h-14 px-8 py-3.5 text-[16px]",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface GovButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof govButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const GovButton = React.forwardRef<HTMLButtonElement, GovButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    asChild = false, 
    loading = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(govButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);

GovButton.displayName = "GovButton";

export { GovButton, govButtonVariants };
