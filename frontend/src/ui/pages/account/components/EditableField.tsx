import React, { useRef, useEffect } from 'react';

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'select';
  selectOptions?: Array<{ value: string; label: string }>;
  isEditMode: boolean;
  onFocus?: () => void;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  type = 'text',
  selectOptions = [],
  isEditMode,
  onFocus,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const contentEditableRef = useRef<HTMLSpanElement>(null);

  const displayValue = value || placeholder || 'Not provided';

  const handleBlur = () => {
    if (type === 'text' && inputRef.current) {
      onChange(inputRef.current.value);
    } else if (type === 'select' && selectRef.current) {
      onChange(selectRef.current.value);
    } else if (contentEditableRef.current) {
      onChange(contentEditableRef.current.textContent || '');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type === 'text') {
      e.preventDefault();
      handleBlur();
      if (inputRef.current) {
        inputRef.current.blur();
      }
    } else if (e.key === 'Escape') {
      if (type === 'text' && inputRef.current) {
        inputRef.current.value = value;
        inputRef.current.blur();
      } else if (type === 'select' && selectRef.current) {
        selectRef.current.value = value;
        selectRef.current.blur();
      } else if (contentEditableRef.current) {
        contentEditableRef.current.textContent = value;
        contentEditableRef.current.blur();
      }
    }
  };

  if (isEditMode) {
    if (type === 'select') {
      return (
        <div className={className}>
          <select
            ref={selectRef}
            defaultValue={value}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full text-xs text-[#3D472C] font-serif bg-transparent border-none outline-none focus:outline-none cursor-pointer"
          >
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className={className}>
        <input
          ref={inputRef}
          type="text"
          defaultValue={value}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          placeholder={placeholder}
          className="w-full text-xs text-[#3D472C] font-serif bg-transparent border-none outline-none focus:outline-none cursor-text"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <span className="text-xs text-[#3D472C] font-serif">
        {displayValue}
      </span>
    </div>
  );
};

export default EditableField;

