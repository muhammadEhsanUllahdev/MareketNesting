
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSectionHeaderProps {
  title: string;
  section: string;
  isExpanded: boolean;
  toggleSection: (section: string) => void;
}

const FilterSectionHeader = ({ title, section, isExpanded, toggleSection }: FilterSectionHeaderProps) => {
  return (
    <button
      className="flex items-center justify-between w-full py-2.5 cursor-pointer hover:bg-cebleu-purple-50/50 px-2 rounded-md transition-colors duration-200"
      onClick={() => toggleSection(section)}
    >
      <span className="font-medium text-sm text-cebleu-purple-800">
        {title}
      </span>
      {isExpanded ? (
        <ChevronUp className="h-4 w-4 text-cebleu-purple-600" />
      ) : (
        <ChevronDown className="h-4 w-4 text-cebleu-purple-600" />
      )}
    </button>
  );
};

export default FilterSectionHeader;
