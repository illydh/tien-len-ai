import { Card, SUIT_SYMBOLS } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayingCardProps {
  card: Card;
  selected?: boolean;
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayingCard({ 
  card, 
  selected = false, 
  faceDown = false,
  onClick, 
  className,
  size = 'md'
}: PlayingCardProps) {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const symbol = SUIT_SYMBOLS[card.suit];

  const sizeClasses = {
    sm: 'w-10 h-14 text-xs',
    md: 'w-14 h-20 text-sm',
    lg: 'w-20 h-28 text-base',
  };

  if (faceDown) {
    return (
      <div
        className={cn(
          'playing-card flex items-center justify-center',
          'bg-gradient-to-br from-primary/80 to-primary',
          'border-2 border-primary/50',
          sizeClasses[size],
          className
        )}
      >
        <div className="w-3/4 h-3/4 rounded border-2 border-primary-foreground/30 flex items-center justify-center">
          <span className="text-primary-foreground/50 font-display text-lg">T</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'playing-card cursor-pointer flex flex-col p-1.5',
        selected && 'selected ring-primary',
        sizeClasses[size],
        className
      )}
    >
      {/* Top left corner */}
      <div className={cn('flex flex-col items-center leading-none', isRed ? 'suit-red' : 'suit-black')}>
        <span className="font-bold">{card.rank}</span>
        <span className="text-lg -mt-1">{symbol}</span>
      </div>
      
      {/* Center suit */}
      <div className={cn('flex-1 flex items-center justify-center', isRed ? 'suit-red' : 'suit-black')}>
        <span className="text-2xl">{symbol}</span>
      </div>
      
      {/* Bottom right corner (upside down) */}
      <div className={cn('flex flex-col items-center leading-none rotate-180', isRed ? 'suit-red' : 'suit-black')}>
        <span className="font-bold">{card.rank}</span>
        <span className="text-lg -mt-1">{symbol}</span>
      </div>
    </div>
  );
}
