import React, { useState } from "react";
import { PlayerId, AIAlgorithm } from "@/types/game";
import { PlayerConfig } from "@/hooks/useTienLen";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SetupScreenProps {
  onStartGame: (config: PlayerConfig) => void;
  onSimulate: (config: PlayerConfig, rounds: number) => void;
}

const ALGORITHMS: { value: AIAlgorithm; label: string }[] = [
  { value: "human", label: "Human" },
  { value: "random", label: "Random Choice" },
  { value: "greedy", label: "Greedy" },
  { value: "minimax", label: "Minimax (Fast)" },
  { value: "q-learning", label: "Q-Learning (Mock)" },
  { value: "reinforcement", label: "Reinforcement (Mock)" },
];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onStartGame,
  onSimulate,
}) => {
  const [config, setConfig] = useState<PlayerConfig>({
    player: "human",
    ai1: "greedy",
    ai2: "random",
    ai3: "minimax",
  });

  const [rounds, setRounds] = useState(10);

  const handleAlgorithmChange = (id: PlayerId, algo: AIAlgorithm) => {
    setConfig((prev) => ({ ...prev, [id]: algo }));
  };

  return (
    <div className="bg-card text-card-foreground p-8 rounded-lg shadow-xl w-full max-w-md mx-auto relative z-10 border border-border mt-16">
      <h2 className="text-2xl font-bold mb-6 text-center">Game Setup</h2>

      <div className="space-y-4 mb-8">
        {(["player", "ai1", "ai2", "ai3"] as PlayerId[]).map((id, index) => (
          <div key={id} className="flex flex-col space-y-1">
            <Label className="text-sm font-medium">
              {id === "player"
                ? "Player 1 (Bottom)"
                : `Player ${index + 1} (${id})`}
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-card text-card-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={config[id]}
              onChange={(e) =>
                handleAlgorithmChange(id, e.target.value as AIAlgorithm)
              }
            >
              {ALGORITHMS.map((algo) => (
                <option key={algo.value} value={algo.value}>
                  {algo.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex flex-col space-y-3">
        <Button
          onClick={() => onStartGame(config)}
          size="lg"
          className="w-full"
        >
          Start Normal Game
        </Button>
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-border">
          <Label>Simulation Rounds</Label>
          <input
            type="number"
            min="1"
            max="1000"
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className="flex h-10 w-full rounded-md border border-input bg-card text-card-foreground px-3 py-2 text-sm ring-offset-background"
          />
          <Button onClick={() => onSimulate(config, rounds)} className="w-full">
            Run Simulation
          </Button>
        </div>
      </div>
    </div>
  );
};
