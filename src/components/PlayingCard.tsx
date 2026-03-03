import { Card, SUIT_SYMBOLS } from "@/types/game";
import { cn } from "@/lib/utils";

interface PlayingCardProps {
  card: Card;
  selected?: boolean;
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PlayingCard({
  card,
  selected = false,
  faceDown = false,
  onClick,
  className,
  size = "md",
}: PlayingCardProps) {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const symbol = SUIT_SYMBOLS[card.suit];

  // Significantly increased sizes for better visibility and "premium" feel
  const sizeClasses = {
    sm: "w-12 h-16 text-[10px]",
    md: "w-16 h-24 text-sm",
    lg: "w-20 h-28 text-base",
  };

  if (faceDown) {
    return (
      <div
        className={cn(
          "playing-card flex items-center justify-center",
          "bg-gradient-to-br from-primary/80 to-primary",
          "border-2 border-primary/50",
          sizeClasses[size],
          className,
        )}
      >
        <div className="w-3/4 h-3/4 rounded border-2 border-primary-foreground/30 flex items-center justify-center">
          <span className="text-primary-foreground/50 font-display text-4xl">
            T
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "playing-card cursor-pointer relative p-2",
        selected && "selected ring-primary",
        sizeClasses[size],
        className,
      )}
    >
      {/* Top left corner */}
      <div
        className={cn(
          "absolute top-2 left-2 flex flex-col items-center leading-none",
          isRed ? "suit-red" : "suit-black",
        )}
      >
        <span className="font-bold">{card.rank}</span>
        <span className="text-current opacity-80">{symbol}</span>
      </div>

      {/* Center suit */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center pointer-events-none",
          isRed ? "suit-red" : "suit-black",
        )}
      >
        <span className="text-5xl opacity-20">{symbol}</span>
      </div>

      {/* Bottom right corner (upside down) */}
      <div
        className={cn(
          "absolute bottom-2 right-2 flex flex-col items-center leading-none rotate-180",
          isRed ? "suit-red" : "suit-black",
        )}
      >
        <span className="font-bold">{card.rank}</span>
        <span className="text-current opacity-80">{symbol}</span>
      </div>
    </div>
  );
}
