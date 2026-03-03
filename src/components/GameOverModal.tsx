import { PlayerId } from "@/types/game";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameOverModalProps {
  winner: PlayerId;
  onNewGame: () => void;
  onBackToSetup: () => void;
}

const PLAYER_NAMES: Record<PlayerId, string> = {
  player: "You",
  ai1: "Minh",
  ai2: "Lan",
  ai3: "Hùng",
};

export function GameOverModal({
  winner,
  onNewGame,
  onBackToSetup,
}: GameOverModalProps) {
  const isPlayerWinner = winner === "player";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={cn(
          "bg-secondary border border-border rounded-2xl p-8 text-center",
          "animate-in zoom-in-95 fade-in duration-300",
          "max-w-md w-full mx-4",
        )}
      >
        <div className="text-6xl mb-4">{isPlayerWinner ? "🎉" : "😢"}</div>

        <h2 className="font-display text-3xl text-foreground mb-2">
          {isPlayerWinner ? "You Won!" : "Game Over"}
        </h2>

        <p className="text-muted-foreground mb-6">
          {isPlayerWinner
            ? "Congratulations! You beat all opponents!"
            : `${PLAYER_NAMES[winner]} won this round. Better luck next time!`}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={onNewGame}
            className="w-full px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-gold"
          >
            Play Again
          </Button>
          <Button variant="outline" onClick={onBackToSetup} className="w-full">
            Back to Setup
          </Button>
        </div>
      </div>
    </div>
  );
}
