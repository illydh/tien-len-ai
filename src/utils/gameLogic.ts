import {
  Card,
  Suit,
  Rank,
  Combination,
  CombinationType,
  SUIT_VALUES,
  RANK_VALUES,
} from "@/types/game";

// Create a full deck of 52 cards
export function createDeck(): Card[] {
  const suits: Suit[] = ["spades", "clubs", "diamonds", "hearts"];
  const ranks: Rank[] = [
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
    "2",
  ];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        rank,
        suit,
        id: `${rank}-${suit}`,
      });
    }
  }

  return deck;
}

// Shuffle deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Deal cards to 4 players (13 cards each)
export function dealCards(deck: Card[]): Card[][] {
  const hands: Card[][] = [[], [], [], []];
  for (let i = 0; i < deck.length; i++) {
    hands[i % 4].push(deck[i]);
  }
  // Sort each hand
  return hands.map((hand) => sortCards(hand));
}

// Get card value for comparison (rank * 4 + suit)
export function getCardValue(card: Card): number {
  return RANK_VALUES[card.rank] * 4 + SUIT_VALUES[card.suit];
}

// Sort cards by rank, then suit
export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => getCardValue(a) - getCardValue(b));
}

// Check if cards form a valid combination
export function identifyCombination(cards: Card[]): Combination | null {
  if (cards.length === 0) return null;

  const sorted = sortCards(cards);

  // Single card
  if (cards.length === 1) {
    return {
      type: "single",
      cards: sorted,
      value: getCardValue(sorted[0]),
    };
  }

  // Pair
  if (cards.length === 2 && sorted[0].rank === sorted[1].rank) {
    return {
      type: "pair",
      cards: sorted,
      value: getCardValue(sorted[1]), // Higher suit determines value
    };
  }

  // Triple
  if (
    cards.length === 3 &&
    sorted[0].rank === sorted[1].rank &&
    sorted[1].rank === sorted[2].rank
  ) {
    return {
      type: "triple",
      cards: sorted,
      value: getCardValue(sorted[2]),
    };
  }

  // Four of a kind
  if (
    cards.length === 4 &&
    sorted[0].rank === sorted[1].rank &&
    sorted[1].rank === sorted[2].rank &&
    sorted[2].rank === sorted[3].rank
  ) {
    return {
      type: "four-of-a-kind",
      cards: sorted,
      value: getCardValue(sorted[3]),
    };
  }

  // Straight (3+ consecutive cards, can't include 2)
  if (cards.length >= 3) {
    const hasTwoCard = sorted.some((c) => c.rank === "2");
    if (!hasTwoCard) {
      let isConsecutive = true;
      for (let i = 1; i < sorted.length; i++) {
        if (
          RANK_VALUES[sorted[i].rank] !==
          RANK_VALUES[sorted[i - 1].rank] + 1
        ) {
          isConsecutive = false;
          break;
        }
      }
      if (isConsecutive) {
        return {
          type: "straight",
          cards: sorted,
          value: getCardValue(sorted[sorted.length - 1]),
        };
      }
    }
  }

  // Double sequence (pairs in sequence)
  if (cards.length >= 6 && cards.length % 2 === 0) {
    const pairs: Card[][] = [];
    for (let i = 0; i < sorted.length; i += 2) {
      if (sorted[i].rank === sorted[i + 1].rank) {
        pairs.push([sorted[i], sorted[i + 1]]);
      } else {
        break;
      }
    }

    if (pairs.length === cards.length / 2) {
      let isConsecutive = true;
      for (let i = 1; i < pairs.length; i++) {
        if (
          RANK_VALUES[pairs[i][0].rank] !==
          RANK_VALUES[pairs[i - 1][0].rank] + 1
        ) {
          isConsecutive = false;
          break;
        }
      }
      if (isConsecutive && !pairs.some((p) => p[0].rank === "2")) {
        return {
          type: "double-sequence",
          cards: sorted,
          value: getCardValue(pairs[pairs.length - 1][1]),
        };
      }
    }
  }

  return null;
}

// Check if a combination can beat another
export function canBeat(
  newPlay: Combination,
  currentPlay: Combination | null,
): boolean {
  // If no current play, anything is valid
  if (!currentPlay) return true;

  // Four of a kind can beat any single 2
  if (
    newPlay.type === "four-of-a-kind" &&
    currentPlay.type === "single" &&
    currentPlay.cards[0].rank === "2"
  ) {
    return true;
  }

  // Double sequence (6+ cards) can beat a 2
  if (
    newPlay.type === "double-sequence" &&
    newPlay.cards.length >= 6 &&
    currentPlay.type === "single" &&
    currentPlay.cards[0].rank === "2"
  ) {
    return true;
  }

  // Must be same type
  if (newPlay.type !== currentPlay.type) return false;

  // For straights and double-sequences, must be same length
  if (
    (newPlay.type === "straight" || newPlay.type === "double-sequence") &&
    newPlay.cards.length !== currentPlay.cards.length
  ) {
    return false;
  }

  // Higher value wins
  return newPlay.value > currentPlay.value;
}

// Find player with 3 of spades (starts first)
export function findStartingPlayer(hands: Card[][]): number {
  for (let i = 0; i < hands.length; i++) {
    if (hands[i].some((c) => c.rank === "3" && c.suit === "spades")) {
      return i;
    }
  }
  return 0;
}

// Get all possible valid combinations an AI can play
export function getAllValidPlays(
  hand: Card[],
  currentPlay: Combination | null,
  mustIncludeThreeOfSpades: boolean = false,
): Card[][] {
  const sortedHand = sortCards(hand);
  const validPlays: Card[][] = [];

  // If must include 3 of spades (first play of game)
  if (mustIncludeThreeOfSpades) {
    const threeOfSpades = hand.find(
      (c) => c.rank === "3" && c.suit === "spades",
    );
    if (threeOfSpades) {
      // Single
      validPlays.push([threeOfSpades]);
      // Pair
      const otherThrees = hand.filter(
        (c) => c.rank === "3" && c.suit !== "spades",
      );
      if (otherThrees.length >= 1) {
        validPlays.push([threeOfSpades, otherThrees[0]]);
      }
      // Triple
      if (otherThrees.length >= 2) {
        validPlays.push([threeOfSpades, otherThrees[0], otherThrees[1]]);
      }
      // Straight of length 3+ starting with 3
      // We can simplify this by finding all straights and filtering for those that include 3 of spades
      for (let len = 3; len <= 13; len++) {
        const straights = findStraights(sortedHand, len);
        for (const straight of straights) {
          if (straight.some((c) => c.rank === "3" && c.suit === "spades")) {
            validPlays.push(straight);
          }
        }
      }
      return validPlays;
    }
  }

  // No current play - can play anything
  if (!currentPlay) {
    // Add all singles
    for (const card of sortedHand) {
      validPlays.push([card]);
    }
    // Add all pairs
    const pairs = findPairs(sortedHand);
    validPlays.push(...pairs);
    // Add all triples
    const triples = findTriples(sortedHand);
    validPlays.push(...triples);
    // Add all straights
    for (let len = 3; len <= 13; len++) {
      validPlays.push(...findStraights(sortedHand, len));
    }
    // Could add double sequences or 4-of-a-kind here if extending fully.
    return validPlays;
  }

  // Try to beat current play
  if (currentPlay.type === "single") {
    for (const card of sortedHand) {
      const combo = identifyCombination([card]);
      if (combo && canBeat(combo, currentPlay)) {
        validPlays.push([card]);
      }
    }
    // 2s can be beaten by 4-of-a-kind or double sequence
    if (currentPlay.cards[0].rank === "2") {
      const groups = groupByRank(sortedHand);
      for (const rank in groups) {
        if (groups[rank].length === 4) {
          validPlays.push(groups[rank]); // 4-of-a-kind
        }
      }
      // (Simplified double sequence omission - can be added later)
    }
  }

  if (currentPlay.type === "pair") {
    const pairs = findPairs(sortedHand);
    for (const pair of pairs) {
      const combo = identifyCombination(pair);
      if (combo && canBeat(combo, currentPlay)) {
        validPlays.push(pair);
      }
    }
  }

  if (currentPlay.type === "triple") {
    const triples = findTriples(sortedHand);
    for (const triple of triples) {
      const combo = identifyCombination(triple);
      if (combo && canBeat(combo, currentPlay)) {
        validPlays.push(triple);
      }
    }
  }

  if (currentPlay.type === "straight") {
    const straights = findStraights(sortedHand, currentPlay.cards.length);
    for (const straight of straights) {
      const combo = identifyCombination(straight);
      if (combo && canBeat(combo, currentPlay)) {
        validPlays.push(straight);
      }
    }
  }

  return validPlays;
}

// AI logic: find the best play using greedy logic (original)
export function findAIPlay(
  hand: Card[],
  currentPlay: Combination | null,
  mustIncludeThreeOfSpades: boolean = false,
): Card[] | null {
  const validPlays = getAllValidPlays(
    hand,
    currentPlay,
    mustIncludeThreeOfSpades,
  );

  if (validPlays.length === 0) {
    return null;
  }

  // For greedy findAIPlay, we simply pick the first valid play which usually is the lowest one because getAllValidPlays builds them starting from singles/lowest
  // However, without current play, we'll prefer single lowest
  if (!currentPlay && !mustIncludeThreeOfSpades) {
    return [sortCards(hand)[0]];
  }

  return validPlays[0];
}

// Helper: find all pairs in hand
function findPairs(hand: Card[]): Card[][] {
  const pairs: Card[][] = [];
  const byRank = groupByRank(hand);

  for (const cards of Object.values(byRank)) {
    if (cards.length >= 2) {
      const sorted = sortCards(cards);
      pairs.push([sorted[sorted.length - 2], sorted[sorted.length - 1]]);
    }
  }

  return pairs.sort((a, b) => getCardValue(a[1]) - getCardValue(b[1]));
}

// Helper: find all triples in hand
function findTriples(hand: Card[]): Card[][] {
  const triples: Card[][] = [];
  const byRank = groupByRank(hand);

  for (const cards of Object.values(byRank)) {
    if (cards.length >= 3) {
      const sorted = sortCards(cards);
      triples.push(sorted.slice(-3));
    }
  }

  return triples.sort((a, b) => getCardValue(a[2]) - getCardValue(b[2]));
}

// Helper: find straights of specific length
function findStraights(hand: Card[], length: number): Card[][] {
  const straights: Card[][] = [];
  const byRank = groupByRank(hand);
  const ranks: Rank[] = [
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];

  for (let i = 0; i <= ranks.length - length; i++) {
    const straightRanks = ranks.slice(i, i + length);
    const hasAllRanks = straightRanks.every((r) => byRank[r]?.length > 0);

    if (hasAllRanks) {
      const straight = straightRanks.map((r) => byRank[r][0]);
      straights.push(straight);
    }
  }

  return straights;
}

// Helper: group cards by rank
function groupByRank(cards: Card[]): Record<string, Card[]> {
  const groups: Record<string, Card[]> = {};
  for (const card of cards) {
    if (!groups[card.rank]) {
      groups[card.rank] = [];
    }
    groups[card.rank].push(card);
  }
  // Sort each group by suit
  for (const rank in groups) {
    groups[rank] = sortCards(groups[rank]);
  }
  return groups;
}
