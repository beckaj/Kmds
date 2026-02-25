import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { cn } from "./utils";

export interface GovMultiSelectProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function GovMultiSelect({
  label,
  required,
  error,
  helperText,
  placeholder = "Select options",
  options = [],
  value = [],
  onChange,
  disabled,
  className,
}: GovMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = React.useId();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleToggle = (optValue: string) => {
    if (disabled) return;
    const safeValue = value || [];
    const exists = safeValue.indexOf(optValue) !== -1;
    if (exists) {
      onChange(safeValue.filter((v) => v !== optValue));
    } else {
      onChange([...safeValue, optValue]);
    }
  };

  const handleRemove = (optValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const safeValue = value || [];
    onChange(safeValue.filter((v) => v !== optValue));
  };

  const selectedLabels = (value || [])
    .map((v) => {
      const opt = (options || []).find((o) => o.value === v);
      return opt ? opt.label : v;
    });

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[14px] font-medium text-gray-700 mb-2 font-['Poppins',sans-serif]"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {/* Trigger */}
        <div
          id={id}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => { if (!disabled) setOpen(!open); }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(!open);
            }
          }}
          className={cn(
            "w-full min-h-[42px] px-3 py-2 font-['Poppins',sans-serif] text-[14px] text-gray-900",
            "bg-white border-[1.5px] border-gray-300 rounded-md cursor-pointer",
            "transition-all duration-200 text-left",
            "focus:outline-none focus:ring-2 focus:ring-[#1f3a5f]/20 focus:border-[#1f3a5f]",
            disabled && "bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200",
            !disabled && "hover:border-gray-400",
            "flex items-center gap-1.5 flex-wrap",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? id + "-error" : helperText ? id + "-helper" : undefined}
        >
          {value.length === 0 ? (
            <span className="text-gray-400 font-['Poppins',sans-serif] text-[14px]">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap flex-1 pr-6">
              {selectedLabels.map((lbl, idx) => (
                <span
                  key={value[idx]}
                  className="inline-flex items-center gap-1 bg-[#1f3a5f]/10 text-[#1f3a5f] px-2 py-0.5 rounded text-[12px] font-medium font-['Poppins',sans-serif]"
                >
                  {lbl}
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => handleRemove(value[idx], e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRemove(value[idx], e as unknown as React.MouseEvent);
                      }
                    }}
                    className="hover:bg-[#1f3a5f]/20 rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              ))}
            </div>
          )}
          <ChevronDown className={cn(
            "w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform",
            open && "rotate-180"
          )} />
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-[240px] overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-[13px] text-gray-400 font-['Poppins',sans-serif]">
                No options available
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = value.indexOf(opt.value) !== -1;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleToggle(opt.value)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-left text-[14px] font-['Poppins',sans-serif] transition-colors",
                      "hover:bg-[#f0f4f8]",
                      isSelected && "bg-[#1f3a5f]/5"
                    )}
                  >
                    <span className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                      isSelected
                        ? "bg-[#1f3a5f] border-[#1f3a5f]"
                        : "border-gray-300 bg-white"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className={cn(
                      "text-gray-700",
                      isSelected && "text-[#1f3a5f] font-medium"
                    )}>
                      {opt.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
      {error && (
        <p id={id + "-error"} className="mt-1.5 text-[13px] text-red-600 font-['Poppins',sans-serif]">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={id + "-helper"} className="mt-1.5 text-[13px] text-gray-500 font-['Poppins',sans-serif]">
          {helperText}
        </p>
      )}
    </div>
  );
}