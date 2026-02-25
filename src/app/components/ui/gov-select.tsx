import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "./utils";

export interface GovSelectProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const GovSelect = React.forwardRef<HTMLButtonElement, GovSelectProps>(
  ({ 
    label, 
    required, 
    error, 
    helperText, 
    placeholder = "Select an option",
    options,
    value,
    onValueChange,
    disabled,
    className
  }, ref) => {
    const id = React.useId();
    
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
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            ref={ref}
            id={id}
            className={cn(
              "w-full px-4 py-2.5 font-['Poppins',sans-serif] text-[14px] text-gray-900",
              "bg-white border-[1.5px] border-gray-300 rounded-md",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f]",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200",
              "hover:border-gray-400",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] font-['Poppins',sans-serif]">
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="font-['Poppins',sans-serif] text-[14px]"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p id={`${id}-error`} className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="mt-1.5 text-[13px] text-gray-500 font-['Poppins',sans-serif]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

GovSelect.displayName = "GovSelect";

export { GovSelect };
