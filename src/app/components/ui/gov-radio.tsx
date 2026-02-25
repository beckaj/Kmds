import * as React from "react";
import { cn } from "./utils";

export interface GovRadioOption {
  value: string;
  label: string;
}

export interface GovRadioProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  options: GovRadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  name: string;
}

const GovRadio = React.forwardRef<HTMLDivElement, GovRadioProps>(
  ({ 
    label, 
    required, 
    error, 
    helperText, 
    options,
    value,
    onChange,
    disabled,
    className,
    name
  }, ref) => {
    const id = React.useId();
    
    return (
      <div ref={ref} className={cn("w-full", className)}>
        {label && (
          <label 
            className="block text-[14px] font-medium text-gray-700 mb-3 font-['Poppins',sans-serif]"
          >
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <div className="flex gap-6">
          {options.map((option) => {
            const optionId = `${id}-${option.value}`;
            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={disabled}
                  className={cn(
                    "w-4 h-4 text-[#1f3a5f] border-gray-300 cursor-pointer",
                    "focus:ring-2 focus:ring-[#1f3a5f]/20",
                    disabled && "cursor-not-allowed"
                  )}
                  aria-invalid={error ? "true" : "false"}
                />
                <span className="text-[14px] text-gray-700 font-['Poppins',sans-serif]">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
        {error && (
          <p className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-[13px] text-gray-500 font-['Poppins',sans-serif]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

GovRadio.displayName = "GovRadio";

export { GovRadio };
