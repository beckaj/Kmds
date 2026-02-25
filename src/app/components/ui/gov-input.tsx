import * as React from "react";
import { cn } from "./utils";

export interface GovInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

const GovInput = React.forwardRef<HTMLInputElement, GovInputProps>(
  ({ className, label, required, error, helperText, type, value, defaultValue, ...rest }, ref) => {
    const id = React.useId();
    const safeValue = value !== undefined && value !== null ? value : '';
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id}
            className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]"
          >
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <input
          {...rest}
          id={id}
          type={type}
          value={safeValue}
          className={cn(
            "w-full px-4 py-2.5 font-['Poppins',sans-serif] text-[14px] text-gray-900",
            "bg-white border-[1.5px] border-gray-300 rounded-md",
            "placeholder:text-gray-400",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f]",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200",
            "hover:border-gray-400",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">
            {error}
          </p>
        )}
        {helperText && !error && (
          null
        )}
      </div>
    );
  }
);

GovInput.displayName = "GovInput";

export { GovInput };