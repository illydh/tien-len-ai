// Card suits ranked from lowest to highest (Tiến Lên rules)
export type Suit = 'spades' | 'clubs' | 'diamonds' | 'hearts';

// Card ranks from lowest (3) to highest (2)
export type Rank = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2';

export interface Card {
  rank: Rank;
  suit: Suit;
  id: string;
}

export type PlayerId = 'player' | 'ai1' | 'ai2' | 'ai3';

export interface Player {
  id: PlayerId;
  name: string;
  cards: Card[];
  passed: boolean;
}

export type CombinationType = 
  | 'single' 
  | 'pair' 
  | 'triple' 
  | 'straight' 
  | 'double-sequence'
  | 'four-of-a-kind';

export interface Combination {
  type: CombinationType;
  cards: Card[];
  value: number; // For comparing combinations
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  currentPlay: Combination | null;
  lastPlayerId: PlayerId | null;
  passCount: number;
  gamePhase: 'dealing' | 'playing' | 'finished';
  winner: PlayerId | null;
  roundStarter: PlayerId | null;
}

// Suit values for comparison
export const SUIT_VALUES: Record<Suit, number> = {
  spades: 0,
  clubs: 1,
  diamonds: 2,
  hearts: 3,
};

// Rank values for comparison
export const RANK_VALUES: Record<Rank, number> = {
  '3': 0,
  '4': 1,
  '5': 2,
  '6': 3,
  '7': 4,
  '8': 5,
  '9': 6,
  '10': 7,
  'J': 8,
  'Q': 9,
  'K': 10,
  'A': 11,
  '2': 12,
};

// Suit symbols for display
export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
};
