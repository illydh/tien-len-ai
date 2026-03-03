import { PlayerId, Player } from "@/types/game";
import { PlayerConfig } from "@/hooks/useTienLen";
import {
  createDeck,
  shuffleDeck,
  dealCards,
  findStartingPlayer,
  identifyCombination,
  canBeat,
} from "./gameLogic";
import { getAIPlayForAlgorithm } from "./aiLogic";

export interface SimulationResult {
  wins: Record<PlayerId, number>;
  totalGames: number;
}

export function runHeadlessSimulation(
  config: PlayerConfig,
  totalGames: number,
): SimulationResult {
  const result: SimulationResult = {
    wins: { player: 0, ai1: 0, ai2: 0, ai3: 0 },
    totalGames,
  };

  const PLAYER_IDS: PlayerId[] = ["player", "ai1", "ai2", "ai3"];

  for (let game = 0; game < totalGames; game++) {
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck);
    let currentPlayerIndex = findStartingPlayer(hands);

    let isFirstPlay = true;
    let currentPlay = null;
    let passCount = 0;
    let lastPlayerId = null;

    const players: Player[] = PLAYER_IDS.map((id, index) => ({
      id,
      name: id,
      cards: hands[index],
      passed: false,
      algorithm: config[id] === "human" ? "random" : config[id], // Sub human with random
    }));

    let winner: PlayerId | null = null;

    // Failsafe mostly, typical game shouldn't run this many turns
    let turnCount = 0;

    while (!winner && turnCount < 1000) {
      turnCount++;
      const currentPlayer = players[currentPlayerIndex];

      if (!currentPlayer.passed) {
        const mustInclude3S =
          isFirstPlay &&
          currentPlayer.cards.some(
            (c) => c.rank === "3" && c.suit === "spades",
          );
        const play = getAIPlayForAlgorithm(
          currentPlayer.algorithm,
          currentPlayer.cards,
          currentPlay,
          mustInclude3S,
        );

        if (play) {
          const combination = identifyCombination(play);
          if (combination && canBeat(combination, currentPlay)) {
            // Valid play
            currentPlay = combination;
            currentPlayer.cards = currentPlayer.cards.filter(
              (c) => !play.some((p) => p.id === c.id),
            );
            lastPlayerId = currentPlayer.id;
            passCount = 0;
            isFirstPlay = false;

            // Reset passed states
            players.forEach((p) => (p.passed = false));

            if (currentPlayer.cards.length === 0) {
              winner = currentPlayer.id;
              break;
            }
          } else {
            // AI decided to play an invalid move? Just pass instead as fallback
            currentPlayer.passed = true;
            passCount++;
          }
        } else {
          // AI passed
          currentPlayer.passed = true;
          passCount++;
        }
      }

      // Handle pass reset
      if (passCount >= 3) {
        currentPlay = null;
        passCount = 0;
        players.forEach((p) => (p.passed = false));
        currentPlayerIndex = players.findIndex((p) => p.id === lastPlayerId);
      } else {
        // Move to next player
        let nextIndex = (currentPlayerIndex + 1) % 4;
        while (
          players[nextIndex].passed &&
          players[nextIndex].cards.length > 0
        ) {
          nextIndex = (nextIndex + 1) % 4;
        }
        currentPlayerIndex = nextIndex;
      }
    }

    if (winner) {
      result.wins[winner]++;
    }
  }

  return result;
}
