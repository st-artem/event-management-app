import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { type TagSelectProps, type TagOption } from '../types';


export const TagSelect: React.FC<TagSelectProps> = ({ 
  value, 
  onChange, 
  options = [], 
  maxTags = 5, 
  placeholder = "Type a tag and press Enter..." 
}) => {
  return (
    <div>
      <CreatableSelect
        isMulti
        value={value}
        options={options}
        onChange={(newValue) => {
          if (newValue.length <= maxTags) {
            onChange(newValue as TagOption[]);
          }
        }}
        placeholder={placeholder}
        unstyled
        classNames={{
          control: ({ isFocused }) =>
            `flex w-full items-center justify-between rounded-lg border px-3 py-2 min-h-[46px] transition-all bg-white dark:bg-brand-darkBg ${
              isFocused
                ? 'border-brand-blue ring-2 ring-brand-blue/20'
                : 'border-gray-200 dark:border-brand-darkBorder'
            }`,
          menu: () => 'mt-1 rounded-lg border border-gray-200 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard shadow-lg text-base z-50',
          option: ({ isFocused, isSelected }) =>
            `cursor-pointer px-4 py-2.5 ${
              isSelected
                ? 'bg-brand-blue text-white'
                : isFocused
                ? 'bg-blue-50 dark:bg-brand-darkBg text-brand-blue dark:text-white'
                : 'text-gray-900 dark:text-gray-200'
            }`,
          multiValue: () => 'mr-1.5 mb-1.5 flex items-center rounded-md bg-blue-50 dark:bg-brand-blue/20',
          multiValueLabel: () => 'px-3 py-1 text-sm font-medium text-blue-900 dark:text-brand-blue',
          multiValueRemove: () => 'hover:bg-blue-100 dark:hover:bg-brand-blue/40 px-2 rounded-r-md cursor-pointer text-blue-900 dark:text-brand-blue transition-colors',
          input: () => 'text-gray-900 dark:text-white text-sm',
          placeholder: () => 'text-gray-400 dark:text-brand-darkText text-sm',
          noOptionsMessage: () => 'text-gray-500 dark:text-gray-400 p-3 text-sm',
        }}
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
        {value.length}/{maxTags} tags added. Press Enter to create a tag.
      </p>
    </div>
  );
};