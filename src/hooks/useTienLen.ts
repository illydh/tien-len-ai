import { useState, useCallback, useEffect } from "react";
import {
  Card,
  Player,
  GameState,
  PlayerId,
  Combination,
  AIAlgorithm,
} from "@/types/game";
import {
  createDeck,
  shuffleDeck,
  dealCards,
  findStartingPlayer,
  identifyCombination,
  canBeat,
  getAllValidPlays,
} from "@/utils/gameLogic";
import { getAIPlayForAlgorithm } from "@/utils/aiLogic";

const PLAYER_IDS: PlayerId[] = ["player", "ai1", "ai2", "ai3"];

const PLAYER_NAMES: Record<PlayerId, string> = {
  player: "You",
  ai1: "Minh",
  ai2: "Lan",
  ai3: "Hùng",
};

export type PlayerConfig = Record<PlayerId, AIAlgorithm>;

export function useTienLen() {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(),
  );
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isFirstPlay, setIsFirstPlay] = useState(true);

  function createInitialState(): GameState {
    const players: Player[] = PLAYER_IDS.map((id) => ({
      id,
      name: PLAYER_NAMES[id],
      cards: [],
      passed: false,
      algorithm: id === "player" ? "human" : "greedy",
    }));

    return {
      players,
      currentPlayerIndex: 0,
      currentPlay: null,
      lastPlayerId: null,
      passCount: 0,
      gamePhase: "setup",
      winner: null,
      roundStarter: null,
    };
  }

  const startGame = useCallback((config: PlayerConfig) => {
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck);
    const startingPlayer = findStartingPlayer(hands);

    setGameState({
      players: PLAYER_IDS.map((id, index) => ({
        id,
        name: PLAYER_NAMES[id],
        cards: hands[index],
        passed: false,
        algorithm: config[id],
      })),
      currentPlayerIndex: startingPlayer,
      currentPlay: null,
      lastPlayerId: null,
      passCount: 0,
      gamePhase: "playing",
      winner: null,
      roundStarter: PLAYER_IDS[startingPlayer],
    });
    setIsFirstPlay(true);
    setSelectedCards([]);
  }, []);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isPlayerTurn = currentPlayer?.algorithm === "human";

  const toggleCardSelection = useCallback((card: Card) => {
    setSelectedCards((prev) => {
      const isSelected = prev.some((c) => c.id === card.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCards([]);
  }, []);

  const playCards = useCallback((cards: Card[], playerId: PlayerId) => {
    setGameState((prev) => {
      const combination = identifyCombination(cards);
      if (!combination) return prev;
      if (!canBeat(combination, prev.currentPlay)) return prev;

      const playerIndex = prev.players.findIndex((p) => p.id === playerId);
      const newPlayers = [...prev.players];

      // Remove played cards from player's hand
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        cards: newPlayers[playerIndex].cards.filter(
          (c) => !cards.some((played) => played.id === c.id),
        ),
      };

      // Handle burning players (if someone finishes, anyone with 13 cards is burned)
      if (newPlayers[playerIndex].cards.length === 0) {
        newPlayers.forEach((p, idx) => {
          if (p.cards.length === 13) {
            newPlayers[idx] = { ...p, isBurned: true };
          }
        });
      }

      // Check for finished players
      const finishedCount = newPlayers.filter(
        (p) => p.cards.length === 0 || p.isBurned,
      ).length;
      const isGameOver = finishedCount >= 3;

      const winner =
        prev.winner ||
        (newPlayers[playerIndex].cards.length === 0 ? playerId : null);

      if (isGameOver) {
        return {
          ...prev,
          players: newPlayers,
          currentPlay: combination,
          lastPlayerId: playerId,
          gamePhase: "finished",
          winner,
        };
      }

      // Move to next player
      let nextIndex = (playerIndex + 1) % 4;
      while (
        newPlayers[nextIndex].passed ||
        newPlayers[nextIndex].cards.length === 0 ||
        newPlayers[nextIndex].isBurned
      ) {
        nextIndex = (nextIndex + 1) % 4;
        if (nextIndex === playerIndex) break; // Defensive
      }

      setIsFirstPlay(false);

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
        currentPlay: combination,
        lastPlayerId: playerId,
        passCount: 0,
        gamePhase: "playing",
        winner,
      };
    });
    return true;
  }, []);

  const playerPlay = useCallback(() => {
    if (!isPlayerTurn || selectedCards.length === 0) return;

    // Have to wrap in try logic since state is handled asynchronously in hook
    // but we can trust toggle state to limit choices
    const combination = identifyCombination(selectedCards);
    if (!combination || !canBeat(combination, gameState.currentPlay)) return;

    playCards(selectedCards, currentPlayer.id);
    setSelectedCards([]);
  }, [
    isPlayerTurn,
    selectedCards,
    playCards,
    gameState.currentPlay,
    currentPlayer,
  ]);

  const pass = useCallback((playerId: PlayerId) => {
    setGameState((prev) => {
      const playerIndex = prev.players.findIndex((p) => p.id === playerId);
      const newPlayers = [...prev.players];
      newPlayers[playerIndex] = { ...newPlayers[playerIndex], passed: true };

      const activeInTrick = newPlayers.filter(
        (p) => !p.passed && p.cards.length > 0 && !p.isBurned,
      );

      // If trick ends, current play wins and they start new round
      if (activeInTrick.length <= 1) {
        // Find the player who made the last play
        const lastPlayerIndex = prev.players.findIndex(
          (p) => p.id === prev.lastPlayerId,
        );

        let nextStarterIndex = lastPlayerIndex;
        // If the winner of the trick is out of cards, next person with cards starts
        while (
          newPlayers[nextStarterIndex].cards.length === 0 ||
          newPlayers[nextStarterIndex].isBurned
        ) {
          nextStarterIndex = (nextStarterIndex + 1) % 4;
          if (nextStarterIndex === lastPlayerIndex) break; // Defensive
        }

        // Reset all passed states
        newPlayers.forEach((p) => (p.passed = false));

        return {
          ...prev,
          players: newPlayers,
          currentPlayerIndex: nextStarterIndex,
          currentPlay: null,
          passCount: 0,
          roundStarter: newPlayers[nextStarterIndex].id,
        };
      }

      // Move to next player who hasn't passed and has cards
      let nextIndex = (playerIndex + 1) % 4;
      while (
        newPlayers[nextIndex].passed ||
        newPlayers[nextIndex].cards.length === 0 ||
        newPlayers[nextIndex].isBurned
      ) {
        nextIndex = (nextIndex + 1) % 4;
        if (nextIndex === playerIndex) break; // Defensive
      }

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
        passCount: prev.passCount + 1,
      };
    });
  }, []);

  const playerPass = useCallback(() => {
    if (!isPlayerTurn) return;
    pass(currentPlayer.id);
    setSelectedCards([]);
  }, [isPlayerTurn, pass, currentPlayer]);

  // AI turn logic
  useEffect(() => {
    if (gameState.gamePhase !== "playing") return;
    if (!currentPlayer || currentPlayer.algorithm === "human") return;

    const aiPlayerId = currentPlayer.id;
    const aiHand = currentPlayer.cards;
    const aiAlgorithm = currentPlayer.algorithm;

    const timer = setTimeout(
      async () => {
        const mustInclude3S =
          isFirstPlay &&
          aiHand.some((c) => c.rank === "3" && c.suit === "spades");

        const aiCards = await getAIPlayForAlgorithm(
          aiAlgorithm,
          aiHand,
          gameState.currentPlay,
          mustInclude3S,
          false,
        );

        if (aiCards) {
          playCards(aiCards, aiPlayerId);
        } else {
          pass(aiPlayerId);
        }
      },
      300 + Math.random() * 200,
    );

    return () => clearTimeout(timer);
  }, [
    gameState.currentPlayerIndex,
    gameState.gamePhase,
    currentPlayer,
    playCards,
    pass,
    isFirstPlay,
    gameState.currentPlay,
  ]);

  const newGame = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  // Check if player can pass (can't pass if starting new round)
  const canPass = gameState.currentPlay !== null;

  // Check if the current player has any valid plays
  const hasValidPlay = isPlayerTurn
    ? (() => {
        const mustInclude3S =
          isFirstPlay &&
          currentPlayer.cards.some(
            (c) => c.rank === "3" && c.suit === "spades",
          );
        return (
          getAllValidPlays(
            currentPlayer.cards,
            gameState.currentPlay,
            mustInclude3S,
          ).length > 0
        );
      })()
    : true;

  return {
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
    playCards,
    pass,
  };
}
