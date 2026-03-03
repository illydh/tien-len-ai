import { Button } from "@/components/ui/button";
import { Card, Combination } from "@/types/game";
import { identifyCombination, canBeat } from "@/utils/gameLogic";
import { cn } from "@/lib/utils";

interface GameControlsProps {
  selectedCards: Card[];
  currentPlay: Combination | null;
  isPlayerTurn: boolean;
  onPlay: () => void;
  onPass: () => void;
  onClear: () => void;
  canPass: boolean;
  hasValidPlay: boolean;
}

export function GameControls({
  selectedCards,
  currentPlay,
  isPlayerTurn,
  onPlay,
  onPass,
  onClear,
  canPass,
  hasValidPlay,
}: GameControlsProps) {
  const combination = identifyCombination(selectedCards);
  const isValidPlay = combination && canBeat(combination, currentPlay);

  if (!isPlayerTurn) {
    return (
      <div className="absolute bottom-56 left-1/2 -translate-x-1/2 z-20">
        <div className="px-6 py-3 bg-secondary/80 backdrop-blur-sm rounded-full text-muted-foreground">
          Waiting for other players...
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-56 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
      {/* Subtle indicator message when no valid plays remain */}
      {!hasValidPlay && canPass && (
        <div className="text-sm font-medium text-destructive/90 bg-destructive/10 px-3 py-1 rounded-full animate-pulse transition-opacity">
          No valid plays. You must pass.
        </div>
      )}

      <div className="flex items-center gap-3">
        {selectedCards.length > 0 && (
          <Button
            variant="outline"
            onClick={onClear}
            className="bg-secondary/80 backdrop-blur-sm border-border hover:bg-secondary"
          >
            Clear ({selectedCards.length})
          </Button>
        )}

        {canPass && (
          <Button
            variant="outline"
            onClick={onPass}
            className={cn(
              "bg-secondary/80 backdrop-blur-sm border-border hover:bg-secondary",
              !hasValidPlay &&
                "ring-2 ring-destructive ring-offset-2 ring-offset-background",
            )}
          >
            Pass
          </Button>
        )}

        <Button
          onClick={onPlay}
          disabled={!isValidPlay}
          className={cn(
            "px-8 py-6 text-lg font-semibold",
            isValidPlay
              ? "bg-primary hover:bg-primary/90 text-primary-foreground glow-gold"
              : "bg-muted text-muted-foreground",
          )}
        >
          {!combination && selectedCards.length > 0
            ? "Invalid Combination"
            : isValidPlay
              ? `Play ${combination?.type.replace("-", " ")}!`
              : "Select Cards"}
        </Button>
      </div>
    </div>
  );
}
