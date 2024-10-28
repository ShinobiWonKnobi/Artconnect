import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export default function TagInput({
  tags,
  onChange,
  placeholder = 'Add tags...',
  maxTags = 10,
}: TagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = input.trim().toLowerCase();
      
      if (newTag && !tags.includes(newTag) && tags.length < maxTags) {
        onChange([...tags, newTag]);
        setInput('');
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-white dark:bg-gray-700 
                    border-gray-300 dark:border-gray-600 min-h-[42px]">
        {tags.map(tag => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 
                     text-blue-800 dark:text-blue-100 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 
                       transition-colors duration-200"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length < maxTags ? placeholder : `Maximum ${maxTags} tags`}
          disabled={tags.length >= maxTags}
          className="flex-1 min-w-[120px] outline-none bg-transparent dark:text-white 
                   placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Press enter or comma to add tags. {maxTags - tags.length} tags remaining.
      </p>
    </div>
  );
}