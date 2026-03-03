# Tiến Lên AI

Tiến Lên AI is a web-based implementation of the popular Vietnamese card game **Tiến Lên** (Vietnamese Poker), built with React, TypeScript, Tailwind CSS, and Vite.

This project goes beyond just playing the game—it serves as a playground for testing and evaluating different artificial intelligence algorithms to see which strategies perform best.

## Features

- **Interactive Gameplay**: Play Tiến Lên against 3 AI opponents in a beautifully designed, responsive web interface.
- **Multiple AI Algorithms**: Choose from a variety of AI strategies for any of the 4 players (including automating your own seat!). Available algorithms include:
  - **Human**: Interactive player control.
  - **Random Choice**: Makes a legal, randomly selected play.
  - **Greedy**: Always plays the lowest valid combination to empty the hand quickly.
  - **Minimax (Fast)**: Evaluates hands 1-step deep, trying to keep high-value cards while minimizing hand size.
  - **Q-Learning (Mock)**: A heuristic-based mock of a Q-learning policy that balances exploration (random) with exploitation (playing larger combinations).
  - **Reinforcement (Mock)**: A heuristic-based mock of Reinforcement Learning that hoards the highest value cards (2s) until the endgame.
- **Game Setup**: Configure the algorithms for each player before the game starts.
- **Headless Simulation**: Run hundreds of games instantly in the background without the UI overhead to empirically test the win rates of different algorithm matchups.

## Tech Stack

- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS** (with custom game design system)
- **shadcn/ui** (Radix UI components)
- **Lucide Icons**

## Getting Started

### Prerequisites

You need Node.js installed on your machine. We recommend managing Node versions using [nvm](https://github.com/nvm-sh/nvm).

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/illydh/tien-len-ai.git
   cd tien-len-ai
   ```

2. Install the necessary dependencies:

   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

### Building for Production

To create a production build:

```sh
npm run build
```

The optimized files will be generated in the `dist` directory.

## Project Structure

- `src/components/` - React components including the playing cards, player hands, game controls, and setup screens.
- `src/hooks/` - Custom React hooks (`useTienLen.ts` handles the overarching game state and React lifecycles).
- `src/utils/` - Core generic game logic (`gameLogic.ts`), AI logic algorithms (`aiLogic.ts`), and high-speed simulation rules (`simulation.ts`).
- `src/types/` - TypeScript type definitions for the deck, combinations, game state, and players.
- `src/index.css` - Custom styling and theming for the card table.

## AI Strategies Breakdown

The project allows you to observe how different card-playing philosophies perform against each other.

1. Open the app locally.
2. At the **Game Setup** screen, select different algorithms for the 4 players.
3. Click **Run Headless Simulation** with a batch size of 100+ to immediately see which AI wins most often.
4. Or, set yourself as "Human" and play against them directly to feel their difficulty level!
