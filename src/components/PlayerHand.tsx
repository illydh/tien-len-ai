import { Card, PlayerId } from "@/types/game";
import { PlayingCard } from "./PlayingCard";
import { cn } from "@/lib/utils";

interface PlayerHandProps {
  playerId: PlayerId;
  cards: Card[];
  selectedCards: Card[];
  onCardClick?: (card: Card) => void;
  isCurrentTurn: boolean;
  passed: boolean;
  position: "bottom" | "left" | "top" | "right";
  showCards?: boolean;
}

const PLAYER_NAMES: Record<PlayerId, string> = {
  player: "You",
  ai1: "Minh",
  ai2: "Lan",
  ai3: "Hùng",
};

const PLAYER_COLORS: Record<PlayerId, string> = {
  player: "bg-player-you text-primary-foreground",
  ai1: "bg-player-ai1 text-white",
  ai2: "bg-player-ai2 text-white",
  ai3: "bg-player-ai3 text-white",
};

export function PlayerHand({
  playerId,
  cards,
  selectedCards,
  onCardClick,
  isCurrentTurn,
  passed,
  position,
  showCards = false,
}: PlayerHandProps) {
  const isPlayer = playerId === "player";

  const positionClasses = {
    bottom: "flex-row",
    left: "flex-col",
    top: "flex-row",
    right: "flex-col",
  };

  const containerClasses = {
    bottom: "absolute bottom-4 left-1/2 -translate-x-1/2",
    left: "absolute left-4 top-1/2 -translate-y-1/2",
    top: "absolute top-4 left-1/2 -translate-x-1/2",
    right: "absolute right-4 top-1/2 -translate-y-1/2",
  };

  const cardOverlap =
    position === "bottom" ? "-ml-14" : position === "top" ? "-ml-9" : "-mt-12";

  return (
    <div
      className={cn(
        containerClasses[position],
        "flex flex-col items-center",
        position === "bottom" ? "gap-6" : "gap-3",
      )}
    >
      {/* Player badge */}
      <div
        className={cn(
          "player-badge flex items-center gap-2",
          PLAYER_COLORS[playerId],
          isCurrentTurn && "glow-gold ring-2 ring-primary",
          position === "bottom" && "order-2",
        )}
      >
        <span className="font-medium">{PLAYER_NAMES[playerId]}</span>
        <span className="text-xs opacity-80">({cards.length})</span>
        {passed && (
          <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded">
            Passed
          </span>
        )}
      </div>

      {/* Cards */}
      <div
        className={cn(
          "flex",
          positionClasses[position],
          position === "bottom" && "order-1",
        )}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={cn(
              index > 0 && cardOverlap,
              "transition-transform hover:z-50",
              isPlayer && "hover:-translate-y-2",
            )}
            style={{ zIndex: index }}
          >
            <PlayingCard
              card={card}
              faceDown={!isPlayer && !showCards}
              selected={selectedCards.some((c) => c.id === card.id)}
              onClick={
                isPlayer && onCardClick ? () => onCardClick(card) : undefined
              }
              size={position === "bottom" ? "lg" : "sm"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
