import { useTienLen } from '@/hooks/useTienLen';
import { PlayerHand } from '@/components/PlayerHand';
import { CenterPlay } from '@/components/CenterPlay';
import { GameControls } from '@/components/GameControls';
import { GameOverModal } from '@/components/GameOverModal';

const Index = () => {
  const {
    gameState,
    selectedCards,
    isPlayerTurn,
    toggleCardSelection,
    clearSelection,
    playerPlay,
    playerPass,
    canPass,
    newGame,
  } = useTienLen();

  const { players, currentPlay, lastPlayerId, gamePhase, winner } = gameState;

  return (
    <div className="min-h-screen table-felt flex items-center justify-center p-4">
      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <h1 className="font-display text-3xl text-primary tracking-wide">Tiến Lên</h1>
        <p className="text-muted-foreground text-sm">Vietnamese Poker</p>
      </div>

      {/* Game table */}
      <div className="relative w-full max-w-5xl aspect-[4/3]">
        {/* Center play area */}
        <CenterPlay currentPlay={currentPlay} lastPlayerId={lastPlayerId} />

        {/* Player hands */}
        {/* Bottom - Human player */}
        <PlayerHand
          playerId="player"
          cards={players[0].cards}
          selectedCards={selectedCards}
          onCardClick={toggleCardSelection}
          isCurrentTurn={gameState.currentPlayerIndex === 0}
          passed={players[0].passed}
          position="bottom"
          showCards
        />

        {/* Left - AI 1 */}
        <PlayerHand
          playerId="ai1"
          cards={players[1].cards}
          selectedCards={[]}
          isCurrentTurn={gameState.currentPlayerIndex === 1}
          passed={players[1].passed}
          position="left"
        />

        {/* Top - AI 2 */}
        <PlayerHand
          playerId="ai2"
          cards={players[2].cards}
          selectedCards={[]}
          isCurrentTurn={gameState.currentPlayerIndex === 2}
          passed={players[2].passed}
          position="top"
        />

        {/* Right - AI 3 */}
        <PlayerHand
          playerId="ai3"
          cards={players[3].cards}
          selectedCards={[]}
          isCurrentTurn={gameState.currentPlayerIndex === 3}
          passed={players[3].passed}
          position="right"
        />
      </div>

      {/* Game controls */}
      <GameControls
        selectedCards={selectedCards}
        currentPlay={currentPlay}
        isPlayerTurn={isPlayerTurn}
        onPlay={playerPlay}
        onPass={playerPass}
        onClear={clearSelection}
        canPass={canPass}
      />

      {/* Game over modal */}
      {gamePhase === 'finished' && winner && (
        <GameOverModal winner={winner} onNewGame={newGame} />
      )}
    </div>
  );
};

export default Index;
