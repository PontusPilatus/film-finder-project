import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface Option {
  value: string;
  label: string;
  isRating?: boolean;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isRating?: boolean;
}

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select...', 
  className = '',
  isRating = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`select-field w-full text-left flex items-center justify-between ${
          isRating && selectedOption?.value ? 'text-yellow-400' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 rounded-xl border border-white/5 overflow-hidden bg-[#0f172a] shadow-lg">
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                className={`w-full text-left px-4 py-2 hover:bg-white/[0.03] transition-colors ${
                  option.value === value 
                    ? isRating ? 'text-yellow-400' : 'text-blue-400'
                    : option.value === '' ? 'text-gray-400' : isRating ? 'text-yellow-400/50' : 'text-gray-400'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 