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

      // Reset passed status for all players when new cards are played
      newPlayers.forEach((p) => (p.passed = false));

      // Check for winner
      const winner =
        newPlayers[playerIndex].cards.length === 0 ? playerId : null;

      // Move to next player
      let nextIndex = (playerIndex + 1) % 4;
      while (newPlayers[nextIndex].cards.length === 0 && !winner) {
        nextIndex = (nextIndex + 1) % 4;
      }

      setIsFirstPlay(false);

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
        currentPlay: combination,
        lastPlayerId: playerId,
        passCount: 0,
        gamePhase: winner ? "finished" : "playing",
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

      const newPassCount = prev.passCount + 1;

      // If 3 players passed, current play wins and they start new round
      if (newPassCount >= 3) {
        // Find the player who made the last play
        const lastPlayerIndex = prev.players.findIndex(
          (p) => p.id === prev.lastPlayerId,
        );

        // Reset all passed states
        newPlayers.forEach((p) => (p.passed = false));

        return {
          ...prev,
          players: newPlayers,
          currentPlayerIndex: lastPlayerIndex,
          currentPlay: null,
          passCount: 0,
          roundStarter: prev.lastPlayerId,
        };
      }

      // Move to next player who hasn't passed and has cards
      let nextIndex = (playerIndex + 1) % 4;
      while (
        newPlayers[nextIndex].passed ||
        newPlayers[nextIndex].cards.length === 0
      ) {
        nextIndex = (nextIndex + 1) % 4;
        if (nextIndex === playerIndex) break;
      }

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
        passCount: newPassCount,
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
      () => {
        const mustInclude3S =
          isFirstPlay &&
          aiHand.some((c) => c.rank === "3" && c.suit === "spades");
        const aiCards = getAIPlayForAlgorithm(
          aiAlgorithm,
          aiHand,
          gameState.currentPlay,
          mustInclude3S,
        );

        if (aiCards) {
          playCards(aiCards, aiPlayerId);
        } else {
          pass(aiPlayerId);
        }
      },
      1000 + Math.random() * 500,
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

  return {
    gameState,
    selectedCards,
    isPlayerTurn,
    toggleCardSelection,
    clearSelection,
    playerPlay,
    playerPass,
    canPass,
    startGame,
    newGame,
    playCards,
    pass,
  };
}
