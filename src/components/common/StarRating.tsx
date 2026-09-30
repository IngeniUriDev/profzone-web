import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  interactive = false,
  onRatingChange,
  size = 18
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const current = hoverRating !== null ? hoverRating : rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= current;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: interactive ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              color: isFilled ? '#f59e0b' : '#cbd5e1',
              transition: 'transform 0.1s ease',
              transform: interactive && hoverRating === star ? 'scale(1.2)' : 'scale(1)'
            }}
            title={`${star} estrellas`}
          >
            <Star
              size={size}
              fill={isFilled ? '#f59e0b' : 'none'}
              stroke="currentColor"
              strokeWidth={isFilled ? 0 : 2}
            />
          </button>
        );
      })}
    </div>
  );
};
