import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from './ui/Button';

interface ImageUploadProps {
  currentImage?: string;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  className?: string;
}

export default function ImageUpload({ currentImage, onFileSelect, onClear, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    }
  };

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  const handleClear = () => {
    setPreview(null);
    if (onClear) onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={twMerge('w-full', className)}>
      {(preview || currentImage) ? (
        <div className="relative rounded-full overflow-hidden w-32 h-32 mx-auto">
          <img
            src={preview || currentImage}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            variant="danger"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={twMerge(
            'border-2 border-dashed rounded-full w-32 h-32 mx-auto transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500',
            'dark:border-gray-600 dark:hover:border-blue-400'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="h-full flex flex-col items-center justify-center">
            <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
              Click or drag image
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />
        </div>
      )}
    </div>
  );
}