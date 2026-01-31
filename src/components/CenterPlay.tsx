import { Combination, PlayerId } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { cn } from '@/lib/utils';

interface CenterPlayProps {
  currentPlay: Combination | null;
  lastPlayerId: PlayerId | null;
}

const PLAYER_NAMES: Record<PlayerId, string> = {
  player: 'You',
  ai1: 'Minh',
  ai2: 'Lan',
  ai3: 'Hùng',
};

export function CenterPlay({ currentPlay, lastPlayerId }: CenterPlayProps) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
      {currentPlay ? (
        <>
          <div className="text-muted-foreground text-sm">
            {lastPlayerId && `${PLAYER_NAMES[lastPlayerId]} played:`}
          </div>
          <div className="flex gap-1">
            {currentPlay.cards.map((card, index) => (
              <div 
                key={card.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PlayingCard card={card} size="md" />
              </div>
            ))}
          </div>
          <div className={cn(
            'px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide',
            'bg-secondary text-secondary-foreground'
          )}>
            {currentPlay.type.replace('-', ' ')}
          </div>
        </>
      ) : (
        <div className="text-muted-foreground text-lg font-display">
          New Round - Play any combination
        </div>
      )}
    </div>
  );
}
