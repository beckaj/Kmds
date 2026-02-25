import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface GovDatePickerProps {
  /** Value in YYYY-MM-DD format */
  value: string;
  onChange: (dateStr: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}

export function GovDatePicker({ value, onChange, placeholder = 'DD/MM/YYYY', error = false, disabled = false }: GovDatePickerProps) {
  const [calOpen, setCalOpen] = useState(false);

  const parsedDate = value ? new Date(value + 'T00:00:00') : null;
  const now = new Date();

  const [viewYear, setViewYear] = useState(parsedDate ? parsedDate.getFullYear() : now.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate ? parsedDate.getMonth() : now.getMonth());

  const calRef = useRef<HTMLDivElement>(null);

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setCalOpen(false);
      }
    };
    if (calOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [calOpen]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; current: boolean; dateStr: string }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: d, current: false, dateStr: y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0') });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, dateStr: viewYear + '-' + String(viewMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0') });
  }
  // Next month leading days to fill 6 rows
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ day: d, current: false, dateStr: y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0') });
  }

  const displayValue = parsedDate
    ? String(parsedDate.getDate()).padStart(2, '0') + '/' + String(parsedDate.getMonth() + 1).padStart(2, '0') + '/' + parsedDate.getFullYear()
    : '';

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setCalOpen(false);
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

  return (
    <div ref={calRef} className="relative">
      {/* Input trigger */}
      <div
        onClick={() => { if (!disabled) setCalOpen(!calOpen); }}
        className={
          "w-full flex items-center px-4 py-2.5 bg-white border-[1.5px] rounded-md transition-all duration-200" +
          (disabled ? ' bg-gray-50 cursor-not-allowed opacity-60' : ' cursor-pointer hover:border-gray-400') +
          (error ? ' border-red-500' : ' border-gray-300') +
          (calOpen ? ' ring-2 ring-[#1f3a5f]/20 border-[#1f3a5f]' : '')
        }
      >
        <span
          className={
            "flex-1 font-['Poppins',sans-serif] text-[14px] select-none" +
            (displayValue ? ' text-gray-900' : ' text-gray-400')
          }
        >
          {displayValue || placeholder}
        </span>
        <Calendar className="w-[18px] h-[18px] text-gray-400 flex-shrink-0" />
      </div>

      {/* Calendar Dropdown */}
      {calOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-[300px] bg-white rounded-lg border border-gray-200 shadow-xl z-[60] p-3 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-[#1f3a5f] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[14px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-[#1f3a5f] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day Name Headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-400 font-['Poppins',sans-serif] py-1 uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell, idx) => {
              const isSelected = cell.dateStr === value;
              const isToday = cell.dateStr === todayStr && cell.current;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDate(cell.dateStr)}
                  className={
                    "w-full aspect-square flex items-center justify-center text-[13px] font-['Poppins',sans-serif] rounded-md transition-all duration-150" +
                    (isSelected
                      ? ' bg-[#1f3a5f] text-white font-semibold shadow-sm'
                      : isToday
                        ? ' bg-[#1f3a5f]/10 text-[#1f3a5f] font-semibold'
                        : cell.current
                          ? ' text-gray-700 hover:bg-gray-100'
                          : ' text-gray-300 hover:bg-gray-50')
                  }
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="mt-2.5 pt-2 border-t border-gray-100 flex justify-center">
            <button
              type="button"
              onClick={() => {
                handleSelectDate(todayStr);
                setViewYear(now.getFullYear());
                setViewMonth(now.getMonth());
              }}
              className="text-[12px] font-medium text-[#1f3a5f] font-['Poppins',sans-serif] hover:underline px-3 py-1 rounded hover:bg-[#1f3a5f]/5 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
