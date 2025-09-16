import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  count?: number;
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  color?: string;
  hoverColor?: string;
  inactiveColor?: string;
  isEditable?: boolean;
}

export function StarRating({
  count = 5,
  value,
  onChange,
  size = 24,
  color = 'text-yellow-400',
  hoverColor = 'text-yellow-500',
  inactiveColor = 'text-gray-300',
  isEditable = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  const stars = Array.from({ length: count }, (_, i) => i + 1);

  const handleClick = (rating: number) => {
    if (isEditable && onChange) {
      onChange(rating);
    }
  };

  const handleMouseOver = (rating: number) => {
    if (isEditable) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (isEditable) {
      setHoverValue(undefined);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {stars.map((starValue) => (
        <Star
          key={starValue}
          size={size}
          className={`
            ${isEditable ? 'cursor-pointer' : ''}
            ${(hoverValue || value) >= starValue ? (hoverValue ? hoverColor : color) : inactiveColor}
          `}
          fill={(hoverValue || value) >= starValue ? 'currentColor' : 'none'}
          onClick={() => handleClick(starValue)}
          onMouseOver={() => handleMouseOver(starValue)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  );
}
