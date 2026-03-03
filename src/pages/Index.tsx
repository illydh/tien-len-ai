import { useState } from "react";
import { useTienLen, PlayerConfig } from "@/hooks/useTienLen";
import { PlayerHand } from "@/components/PlayerHand";
import { CenterPlay } from "@/components/CenterPlay";
import { GameControls } from "@/components/GameControls";
import { GameOverModal } from "@/components/GameOverModal";
import { SetupScreen } from "@/components/SetupScreen";
import { runHeadlessSimulation, SimulationResult } from "@/utils/simulation";
import { Button } from "@/components/ui/button";

export default function Index() {
  const {
    gameState,
    selectedCards,
    isPlayerTurn,
    toggleCardSelection,
    clearSelection,
    playerPlay,
    playerPass,
    canPass,
    hasValidPlay,
    startGame,
    newGame,
  } = useTienLen();

  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);
  const [simulationConfig, setSimulationConfig] = useState<PlayerConfig | null>(
    null,
  );

  const { players, currentPlay, lastPlayerId, gamePhase, winner } = gameState;

  const handleSimulate = (config: PlayerConfig, rounds: number) => {
    const result = runHeadlessSimulation(config, rounds);
    setSimulationResult(result);
    setSimulationConfig(config);
  };

  const handleRestartRound = () => {
    const config: PlayerConfig = {
      player: players[0].algorithm,
      ai1: players[1].algorithm,
      ai2: players[2].algorithm,
      ai3: players[3].algorithm,
    };
    startGame(config);
  };

  if (simulationResult && simulationConfig) {
    return (
      <div className="min-h-screen table-felt flex flex-col items-center justify-center p-4">
        <div className="bg-card text-card-foreground p-8 rounded-lg shadow-xl w-full max-w-md relative z-10 border border-border">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Simulation Results
          </h2>
          <div className="space-y-4 mb-6">
            <p className="text-lg">
              Total Games: {simulationResult.totalGames}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-border pb-1">
                <span className="capitalize">
                  Player 1 (
                  {simulationConfig.player === "human"
                    ? "random"
                    : simulationConfig.player}
                  ):
                </span>
                <span className="font-mono">
                  {(
                    (simulationResult.wins.player /
                      simulationResult.totalGames) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <span className="capitalize">
                  Player 2 ({simulationConfig.ai1}):
                </span>
                <span className="font-mono">
                  {(
                    (simulationResult.wins.ai1 / simulationResult.totalGames) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <span className="capitalize">
                  Player 3 ({simulationConfig.ai2}):
                </span>
                <span className="font-mono">
                  {(
                    (simulationResult.wins.ai2 / simulationResult.totalGames) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="capitalize">
                  Player 4 ({simulationConfig.ai3}):
                </span>
                <span className="font-mono">
                  {(
                    (simulationResult.wins.ai3 / simulationResult.totalGames) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              setSimulationResult(null);
              setSimulationConfig(null);
            }}
            className="w-full"
          >
            Back to Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen table-felt flex items-center justify-center p-4">
      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center text-white z-20 drop-shadow-md">
        <h1 className="font-display text-3xl tracking-wide">Tiến Lên AI</h1>
        <p className="opacity-80 text-sm">Vietnamese Poker Bots</p>
      </div>

      {gamePhase === "setup" && (
        <SetupScreen onStartGame={startGame} onSimulate={handleSimulate} />
      )}

      {/* Game table */}
      {gamePhase !== "setup" && (
        <>
          <div className="relative w-full max-w-5xl aspect-[4/3]">
            {/* Center play area */}
            <CenterPlay currentPlay={currentPlay} lastPlayerId={lastPlayerId} />

            {/* Player hands */}
            <PlayerHand
              playerId="player"
              cards={players[0].cards}
              selectedCards={selectedCards}
              onCardClick={toggleCardSelection}
              isCurrentTurn={gameState.currentPlayerIndex === 0}
              passed={players[0].passed}
              isBurned={players[0].isBurned}
              position="bottom"
              showCards={players[0].algorithm === "human"}
            />

            <PlayerHand
              playerId="ai1"
              cards={players[1].cards}
              selectedCards={[]}
              isCurrentTurn={gameState.currentPlayerIndex === 1}
              passed={players[1].passed}
              isBurned={players[1].isBurned}
              position="left"
            />

            <PlayerHand
              playerId="ai2"
              cards={players[2].cards}
              selectedCards={[]}
              isCurrentTurn={gameState.currentPlayerIndex === 2}
              passed={players[2].passed}
              isBurned={players[2].isBurned}
              position="top"
            />

            <PlayerHand
              playerId="ai3"
              cards={players[3].cards}
              selectedCards={[]}
              isCurrentTurn={gameState.currentPlayerIndex === 3}
              passed={players[3].passed}
              isBurned={players[3].isBurned}
              position="right"
            />

            {/* Game controls - only show if player 0 is human */}
            {players[0].algorithm === "human" && (
              <GameControls
                selectedCards={selectedCards}
                currentPlay={currentPlay}
                isPlayerTurn={isPlayerTurn}
                onPlay={playerPlay}
                onPass={playerPass}
                onClear={clearSelection}
                canPass={canPass}
                hasValidPlay={hasValidPlay}
              />
            )}
          </div>

          {/* Restart button for bot-only games when stuck or finished */}
          {players[0].algorithm !== "human" && (
            <div className="absolute bottom-8 z-50">
              <Button
                size="lg"
                variant="secondary"
                onClick={newGame}
                className="shadow-lg"
              >
                Back to Setup
              </Button>
            </div>
          )}

          {/* Game over modal */}
          {gamePhase === "finished" && winner && (
            <GameOverModal
              winner={winner}
              onNewGame={handleRestartRound}
              onBackToSetup={newGame}
            />
          )}
        </>
      )}
    </div>
  );
}
