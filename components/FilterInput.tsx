
import React from 'react';

interface FilterInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const FilterInput: React.FC<FilterInputProps> = ({ label, name, value, onChange, className = '' }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="border border-gray-400 rounded-md px-3 py-1 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
      />
    </div>
  );
};

export default FilterInput;
