import { Card, Combination, Player, GameState } from "@/types/game";
import {
  getAllValidPlays,
  findAIPlay,
  getCardValue,
  sortCards,
} from "./gameLogic";

// Default AI play logic (Greedy)
export function playGreedy(
  hand: Card[],
  currentPlay: Combination | null,
  mustIncludeThreeOfSpades: boolean = false,
): Card[] | null {
  return findAIPlay(hand, currentPlay, mustIncludeThreeOfSpades);
}

// Random Choice logic
export function playRandom(
  hand: Card[],
  currentPlay: Combination | null,
  mustIncludeThreeOfSpades: boolean = false,
): Card[] | null {
  const validPlays = getAllValidPlays(
    hand,
    currentPlay,
    mustIncludeThreeOfSpades,
  );
  if (validPlays.length === 0) return null;

  // Choose randomly
  const randomIndex = Math.floor(Math.random() * validPlays.length);
  return validPlays[randomIndex];
}

// Evaluate a hand for minimax or heuristics.
// Lower score is better (we want 0 cards left).
// Having high cards (like 2) improves the hand (lowers score effectively in an inverted sense or we give them negative penalty).
function evaluateHand(hand: Card[]): number {
  let score = hand.length * 100;
  for (const card of hand) {
    if (card.rank === "2") {
      score -= 50;
    } else if (card.rank === "A" || card.rank === "K") {
      score -= 20;
    }
  }
  return score;
}

export async function playMinimax(
  hand: Card[],
  currentPlay: Combination | null,
  mustIncludeThreeOfSpades: boolean = false,
  depth: number = 4,
  isSimulation: boolean = false,
): Promise<Card[] | null> {
  const validPlays = getAllValidPlays(
    hand,
    currentPlay,
    mustIncludeThreeOfSpades,
  );
  if (validPlays.length === 0) return null;

  let bestPlay: Card[] | null = null;
  let bestScore = Infinity;

  if (!isSimulation) {
    await new Promise((r) => setTimeout(r, 0));
  }

  for (const play of validPlays) {
    const remainingHand = hand.filter((c) => !play.some((p) => p.id === c.id));
    const score = await getMinimaxScore(remainingHand, depth - 1, isSimulation);

    if (score < bestScore) {
      bestScore = score;
      bestPlay = play;
    }
  }

  return bestPlay || validPlays[0];
}

async function getMinimaxScore(
  hand: Card[],
  depth: number,
  isSimulation: boolean,
): Promise<number> {
  if (depth === 0 || hand.length === 0) return evaluateHand(hand);

  const validPlays = getAllValidPlays(hand, null, false);
  if (validPlays.length === 0) return evaluateHand(hand);

  let bestScore = Infinity;
  for (const play of validPlays) {
    const remainingHand = hand.filter((c) => !play.some((p) => p.id === c.id));

    // Yield to main thread at upper depths to keep UI responsive
    if (!isSimulation && depth >= 3) {
      await new Promise((r) => setTimeout(r, 0));
    }

    const score = await getMinimaxScore(remainingHand, depth - 1, isSimulation);
    if (score < bestScore) {
      bestScore = score;
    }
  }
  return bestScore;
}

// Mock Q-learning Logic
// In a real scenario, this would consist of a state lookup in a Q-table.
// Here we mock it by using a slight randomization with heuristic weights.
export function playQLearning(
  hand: Card[],
  currentPlay: Combination | null,
  mustIncludeThreeOfSpades: boolean = false,
): Card[] | null {
  const validPlays = getAllValidPlays(
    hand,
    currentPlay,
    mustIncludeThreeOfSpades,
  );
  if (validPlays.length === 0) return null;

  // Q-Learning balances exploration and exploitation
  const isExploration = Math.random() < 0.1; // 10% epsilon
  if (isExploration) {
    return playRandom(hand, currentPlay, mustIncludeThreeOfSpades);
  } else {
    // Exploitation based on a "learned" policy (mocked via simple heuristic)
    // Prefers moves that play more cards at once (e.g. triples, straights over singles)
    let bestPlay = validPlays[0];
    for (const play of validPlays) {
      if (play.length > bestPlay.length) {
        bestPlay = play;
      } else if (play.length === bestPlay.length) {
        // Tie breaker: play lower value cards first
        if (
          getCardValue(play[play.length - 1]) <
          getCardValue(bestPlay[bestPlay.length - 1])
        ) {
          bestPlay = play;
        }
      }
    }
    return bestPlay;
  }
}

// Mock Reinforcement Learning (e.g. PPO/DQN)
// Similar to Q-learning but might act slightly differently in our mock.
export function playReinforcement(
  hand: Card[],
  currentPlay: Combination | null,
  mustIncludeThreeOfSpades: boolean = false,
): Card[] | null {
  // Let's pretend RL policy tends to hold onto powerful cards (2s) strictly until the end of the game
  const validPlays = getAllValidPlays(
    hand,
    currentPlay,
    mustIncludeThreeOfSpades,
  );
  if (validPlays.length === 0) return null;

  // Always play the longest combination, but avoid playing 2s unless necessary or winning
  let bestPlay = validPlays[0];
  for (const play of validPlays) {
    const hasTwo = play.some((c) => c.rank === "2");
    const bestHasTwo = bestPlay.some((c) => c.rank === "2");

    if (!hasTwo && bestHasTwo) {
      bestPlay = play;
    } else if (hasTwo === bestHasTwo) {
      if (play.length > bestPlay.length) {
        bestPlay = play;
      }
    }
  }

  // Sometimes RL realizes passing is better to keep control, but we'll return bestPlay
  return bestPlay;
}

// Main delegator
export async function getAIPlayForAlgorithm(
  algorithm: string,
  hand: Card[],
  currentPlay: Combination | null,
  mustIncludeThreeOfSpades: boolean = false,
  isSimulation: boolean = false,
): Promise<Card[] | null> {
  switch (algorithm) {
    case "random":
      return playRandom(hand, currentPlay, mustIncludeThreeOfSpades);
    case "minimax":
      return await playMinimax(
        hand,
        currentPlay,
        mustIncludeThreeOfSpades,
        4,
        isSimulation,
      );
    case "q-learning":
      return playQLearning(hand, currentPlay, mustIncludeThreeOfSpades);
    case "reinforcement":
      return playReinforcement(hand, currentPlay, mustIncludeThreeOfSpades);
    case "greedy":
    default:
      return playGreedy(hand, currentPlay, mustIncludeThreeOfSpades);
  }
}
