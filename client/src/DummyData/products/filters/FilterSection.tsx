
import React from 'react';
import { FilterSectionProps } from './types';
import FilterSectionHeader from './FilterSectionHeader';

const FilterSection = ({ title, section, isExpanded, toggleSection, children }: FilterSectionProps) => {
  return (
    <div>
      <FilterSectionHeader 
        title={title}
        section={section}
        isExpanded={isExpanded}
        toggleSection={toggleSection}
      />
      {isExpanded && (
        <div className="pt-2 pl-1 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default FilterSection;
