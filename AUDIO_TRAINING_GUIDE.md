# Audio Training System - Complete Guide

> **Comprehensive documentation for the Audio Training exercises platform**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Games/Exercises](#gamesexercises)
4. [Reusable Components](#reusable-components)
5. [Utilities & Composables](#utilities--composables)
6. [How to Add a New Exercise](#how-to-add-a-new-exercise)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)

---

## Overview

The Audio Training system is a gamified platform for learning audio engineering skills. Users complete exercises that test their ability to identify frequencies, panning, stereo width, EQ curves, and audio filters.

### Key Features

- **7 Interactive Exercises** - Each focusing on different audio engineering skills
- **XP & Leveling System** - Earn points and level up as you improve
- **Achievement System** - Unlock achievements for completing challenges
- **Progress Tracking** - Track performance across sessions
- **Responsive Design** - Works on desktop and tablet devices

### Technology Stack

- **Framework**: SvelteKit (Svelte 5 with runes)
- **Audio**: Web Audio API
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (Drizzle ORM)
- **TypeScript**: Full type safety

---

## Architecture

### File Structure

```
src/
├── routes/audio-training/
│   ├── (exercises)/                    # Route group for all exercises
│   │   ├── +layout.svelte             # Shared layout (back button)
│   │   ├── db-king/+page.svelte       # dB Level Identification
│   │   ├── panning/+page.svelte       # Panning Position
│   │   ├── filter-expert/+page.svelte # Filter Type Identification
│   │   ├── kit-cut/+page.svelte       # Frequency Cut Detection
│   │   ├── stereohead/+page.svelte    # Stereo Width Detection
│   │   ├── eq/+page.svelte            # EQ Frequency Boost
│   │   └── eq-mirror/+page.svelte     # EQ Curve Matching
│   └── +page.svelte                    # Exercise selection page
│
├── lib/
│   ├── components/audio-training/
│   │   ├── PlayerBar.svelte           # Profile + XP + Notifications
│   │   ├── GameContainer.svelte       # Unified game wrapper
│   │   ├── ToastContainer.svelte      # Toast notifications
│   │   ├── GameControls.svelte        # Game UI controls
│   │   ├── ScoreScreen.svelte         # End-game summary
│   │   ├── InteractiveCanvas.svelte   # Canvas for visualizations
│   │   ├── EQBandControl.svelte       # EQ band sliders
│   │   ├── ProfileCard.svelte         # User profile card
│   │   ├── XPBar.svelte               # XP progress bar
│   │   ├── AudioManager.svelte.ts     # Audio playback manager
│   │   ├── EnhancedGameManager.svelte.ts # Game state + XP logic
│   │   └── types.ts                   # TypeScript interfaces
│   │
│   └── utils/audio-training/
│       ├── game-manager-setup.svelte.ts # Game setup composable
│       ├── canvas-utils.ts            # Canvas drawing utilities
│       ├── frequency-utils.ts         # Frequency calculations
│       ├── scoring-utils.ts           # Points calculation
│       ├── eq-utils.ts                # EQ curve math
│       └── progress-manager.ts        # XP/level persistence
│
└── lib/types/audio-training.ts        # Global types
```

### Design Patterns

#### 1. **Composable Pattern** (`game-manager-setup.svelte.ts`)

Eliminates 50+ lines of boilerplate per exercise by providing a unified game state API.

```typescript
const game = createGameManager({
	exerciseId: 'db-king',
	difficulty: 'beginner'
});

// Access everything via game.*
game.gameState; // Reactive game state
game.userProgress; // User profile + XP
game.roundHistory; // Round results
game.manager; // Game manager instance
```

#### 2. **Component Wrapper Pattern** (`PlayerBar`, `GameContainer`)

Encapsulates repeated UI elements into reusable containers.

#### 3. **Svelte 5 Runes** (`$state`, `$derived`, `$effect`)

Modern reactive state management without legacy APIs.

---

## Games/Exercises

### 1. **dB King** (`/audio-training/db-king`)

**Skill**: Identify the gain level (dB) of pink noise.

**Difficulty**: ⭐⭐☆☆☆

**Features**:

- Pink noise generation
- ±3dB tolerance
- Logarithmic dB scaling

**Key Technique**: Gain detection

---

### 2. **Panning** (`/audio-training/panning`)

**Skill**: Identify stereo panning position (-100% to +100%).

**Difficulty**: ⭐⭐☆☆☆

**Features**:

- Interactive visual canvas
- Stereo panner node
- Hover preview

**Key Technique**: Stereo image analysis

---

### 3. **Filter Expert** (`/audio-training/filter-expert`)

**Skill**: Identify which filter type is applied (lowpass, highpass, bandpass, notch).

**Difficulty**: ⭐⭐⭐☆☆

**Features**:

- 4 filter types
- Multiple button UI
- Audio sample playback

**Key Technique**: Filter frequency response recognition

---

### 4. **Kit Cut** (`/audio-training/kit-cut`)

**Skill**: Identify which frequency range has been cut (sub-bass, bass, low-mid, mid, high-mid, high).

**Difficulty**: ⭐⭐⭐☆☆

**Features**:

- 6 frequency ranges
- A/B toggle (filtered vs. original)
- Drum loop samples

**Key Technique**: Frequency absence detection

---

### 5. **Stereohead** (`/audio-training/stereohead`)

**Skill**: Identify stereo width (0% = mono, 100% = normal, 200% = ultra-wide).

**Difficulty**: ⭐⭐⭐☆☆

**Features**:

- Interactive canvas
- M/S stereo processing
- Visual width meter

**Key Technique**: Stereo width perception

---

### 6. **EQ** (`/audio-training/eq`)

**Skill**: Identify which frequency is boosted (+8dB peak).

**Difficulty**: ⭐⭐⭐⭐☆

**Features**:

- Logarithmic frequency canvas
- 20 common EQ frequencies
- A/B toggle (EQ active vs. bypass)

**Key Technique**: EQ boost frequency identification

---

### 7. **EQ Mirror** (`/audio-training/eq-mirror`)

**Skill**: Match a target 4-band EQ curve.

**Difficulty**: ⭐⭐⭐⭐⭐

**Features**:

- 4-band parametric EQ controls
- Real-time visual EQ curve
- A/B comparison (your EQ vs. target)
- Accuracy-based scoring (80%+ = correct)

**Key Technique**: EQ curve matching

---

## Reusable Components

### `PlayerBar.svelte`

**Purpose**: Unified profile display + XP bar + level-up notifications.

**Props**:

```typescript
interface PlayerBarProps {
	userProgress: UserProgress | null;
	showXPNotification: boolean;
	xpEarned: number;
	leveledUp: boolean;
	newLevel: number;
}
```

**Usage**:

```svelte
<PlayerBar
	userProgress={game.userProgress}
	showXPNotification={game.showXPNotification}
	xpEarned={game.xpEarned}
	leveledUp={game.leveledUp}
	newLevel={game.newLevel}
/>
```

---

### `GameContainer.svelte`

**Purpose**: Wrapper for all game content with consistent styling.

**Props**:

```typescript
interface GameContainerProps {
	title: string;
	description: string;
	gradient: string; // Tailwind gradient (e.g., "from-blue-900 to-slate-900")
	class?: string; // Additional classes
	children: Snippet;
}
```

**Usage**:

```svelte
<GameContainer
	title="🎯 Exercise Name"
	description="Exercise description"
	gradient="from-blue-900 to-slate-900"
>
	<!-- Game content here -->
</GameContainer>
```

---

### `ToastContainer.svelte`

**Purpose**: Display toast notifications for achievements and events.

**Usage**:

```svelte
<script>
	let toastContainer: ToastContainer;

	$effect(() => {
		if (toastContainer) {
			game.setToastContainer(toastContainer);
		}
	});
</script>

<ToastContainer bind:this={toastContainer} />
```

---

### `GameControls.svelte`

**Purpose**: Unified game controls (start, skip, A/B toggle, custom actions).

**Props**:

```typescript
interface GameControlsProps {
	gameState: GameState;
	onStartGame: () => void;
	onSkipRound: () => void;
	showABToggle?: boolean;
	abState?: boolean;
	onABToggle?: () => void;
	customActions?: Array<{
		label: string;
		onClick: () => void;
		variant?: 'primary' | 'secondary' | 'danger';
		disabled?: boolean;
	}>;
	startButton?: Snippet; // Custom start button text
}
```

**Usage**:

```svelte
<GameControls gameState={game.gameState} onStartGame={startNewGame} onSkipRound={skipRound}>
	{#snippet startButton()}
		Start 10-Round Challenge
	{/snippet}
</GameControls>
```

---

### `ScoreScreen.svelte`

**Purpose**: End-game score summary with stats and play again button.

**Props**:

```typescript
interface ScoreScreenProps {
	gameState: GameState;
	roundHistory: RoundResult[];
	onPlayAgain: () => void;
	customStats?: Array<{ label: string; value: string }>;
}
```

**Usage**:

```svelte
<ScoreScreen
	gameState={game.gameState}
	roundHistory={game.roundHistory}
	onPlayAgain={playAgain}
	customStats={[
		{ label: 'Perfect Rounds', value: '8/10' },
		{ label: 'Accuracy', value: '92%' }
	]}
/>
```

---

### `InteractiveCanvas.svelte`

**Purpose**: HTML5 Canvas with mouse interaction and overlays.

**Props**:

```typescript
interface InteractiveCanvasProps {
	width: number;
	height: number;
	onCanvasClick?: (event: MouseEvent) => void;
	onCanvasMouseMove?: (event: MouseEvent) => void;
	onCanvasMouseLeave?: () => void;
	disabled?: boolean;
	className?: string;
	disabledOverlay?: Snippet; // Custom disabled overlay
	overlay?: Snippet; // Custom overlay content
}
```

**Methods** (via `bind:this`):

```typescript
canvas.getCanvas(); // Get HTMLCanvasElement
canvas.getContext(); // Get 2D context
canvas.drawBackground(); // Draw background
canvas.drawGrid(); // Draw grid
canvas.clear(); // Clear canvas
```

**Usage**:

```svelte
<script>
	let canvas = $state<InteractiveCanvas>();

	function draw() {
		if (!canvas) return;
		const ctx = canvas.getContext();
		// Draw on canvas...
	}
</script>

<InteractiveCanvas
	bind:this={canvas}
	width={800}
	height={120}
	disabled={!isPlaying}
	onCanvasClick={handleClick}
	onCanvasMouseMove={handleMouseMove}
/>
```

---

## Utilities & Composables

### `createGameManager()` - **Most Important**

**Purpose**: Single function to set up all game state, XP tracking, and callbacks.

**Location**: `$lib/utils/audio-training/game-manager-setup.svelte.ts`

**Signature**:

```typescript
function createGameManager(setup: GameManagerSetup): GameManager;

interface GameManagerSetup {
	exerciseId: ExerciseId;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	onGameComplete?: (session: GameSession) => void;
}

interface GameManager {
	gameState: GameState; // Reactive game state
	userProgress: UserProgress; // User profile + XP
	roundHistory: RoundResult[]; // Round results
	showXPNotification: boolean; // XP popup visibility
	xpEarned: number; // XP earned this round
	leveledUp: boolean; // Level up flag
	newLevel: number; // New level (if leveled up)
	manager: EnhancedGameManager; // Full manager instance
	resetRoundHistory: () => void; // Reset history
	setToastContainer: (container: ToastContainer) => void;
}
```

**Usage**:

```typescript
const game = createGameManager({
	exerciseId: 'db-king',
	difficulty: 'beginner',
	onGameComplete: (session) => {
		console.log('Game completed!', session);
	}
});

// Start a new game
game.manager.startNewGame();
game.resetRoundHistory();

// Submit a round
const result: RoundResult = {
	correct: true,
	points: 100,
	actualValue: 5,
	userGuess: 5
};
game.manager.submitRound(result);
```

---

### `FrequencyUtils`

**Purpose**: Logarithmic frequency calculations for canvas positioning.

**Methods**:

```typescript
FrequencyUtils.freqToX(freq, canvasWidth, minFreq, maxFreq); // Hz → X position
FrequencyUtils.xToFreq(x, canvasWidth, minFreq, maxFreq); // X position → Hz
FrequencyUtils.formatFrequency(freq); // Format as "1.5kHz"
FrequencyUtils.getLogarithmicMargin(freq, percent); // ±margin in Hz
```

---

### `ScoringUtils`

**Purpose**: Calculate points based on accuracy.

**Methods**:

```typescript
ScoringUtils.calculatePoints(difference, tolerance); // 0-100 points
```

---

### `EQUtils`

**Purpose**: EQ curve calculations for visualization.

**Methods**:

```typescript
EQUtils.calculateTotalGain(freq, eqBands); // Total gain at frequency
EQUtils.gainToY(gain, canvasHeight); // dB → Y position
```

---

### `CanvasUtils`

**Purpose**: Common canvas drawing utilities.

**Methods**:

```typescript
CanvasUtils.drawBackground(ctx, width, height, color);
CanvasUtils.drawGrid(ctx, width, height, gridColor);
CanvasUtils.drawTooltip(ctx, text, x, y, maxWidth);
```

---

## How to Add a New Exercise

Follow these steps to create a new audio training exercise:

### Step 1: Create Route Directory

```bash
mkdir -p src/routes/audio-training/\(exercises\)/my-exercise
touch src/routes/audio-training/\(exercises\)/my-exercise/+page.svelte
```

### Step 2: Use the Template

```svelte
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GameControls from '$lib/components/audio-training/GameControls.svelte';
	import ScoreScreen from '$lib/components/audio-training/ScoreScreen.svelte';
	import PlayerBar from '$lib/components/audio-training/PlayerBar.svelte';
	import GameContainer from '$lib/components/audio-training/GameContainer.svelte';
	import ToastContainer from '$lib/components/audio-training/ToastContainer.svelte';
	import { AudioManager } from '$lib/components/audio-training/AudioManager.svelte';
	import { createGameManager } from '$lib/utils/audio-training/game-manager-setup.svelte';
	import type { RoundResult } from '$lib/components/audio-training/types';
	import type { GameSession } from '$lib/types/audio-training';

	// 1. Setup game manager
	let toastContainer: ToastContainer;

	const game = createGameManager({
		exerciseId: 'my-exercise', // Add to ExerciseId type
		difficulty: 'beginner'
	});

	$effect(() => {
		if (toastContainer) {
			game.setToastContainer(toastContainer);
		}
	});

	// 2. Initialize audio manager
	const audioManager = new AudioManager();
	let isAudioPlaying = $derived(audioManager.isPlaying);

	// 3. Exercise-specific state
	let currentValue = $state(0);
	let userGuess = $state<number | null>(null);

	// 4. Lifecycle
	onMount(async () => {
		await audioManager.initialize();
		// Setup your audio nodes...
	});

	onDestroy(() => {
		audioManager.cleanup();
	});

	// 5. Exercise logic
	function startExercise() {
		// Generate random challenge
		currentValue = Math.random() * 100;

		// Setup Web Audio API nodes
		audioManager.source = audioManager.createSource();
		// ... connect audio nodes ...

		audioManager.startSource();
	}

	function submitGuess() {
		if (!isAudioPlaying) return;

		const isCorrect = Math.abs(userGuess! - currentValue) <= 5;
		const points = isCorrect ? 100 : 50;

		const result: RoundResult = {
			correct: isCorrect,
			points,
			actualValue: currentValue,
			userGuess: userGuess!
		};

		audioManager.stop();
		game.manager.submitRound(result);
	}

	function startNewGame() {
		game.manager.startNewGame();
		game.resetRoundHistory();
		startExercise();
	}

	function skipRound() {
		audioManager.stop();
		game.manager.skipRound(currentValue, 'Skipped!');
	}

	function playAgain() {
		game.manager.startNewGame();
		game.resetRoundHistory();
	}

	// 6. Auto-start next round
	$effect(() => {
		if (
			game.gameState.gameStarted &&
			!game.gameState.gameCompleted &&
			!game.gameState.showResult &&
			game.gameState.currentRound > 0
		) {
			startExercise();
		}
	});
</script>

<svelte:head>
	<title>My Exercise - Audio Training</title>
</svelte:head>

<!-- Player Bar -->
<PlayerBar
	userProgress={game.userProgress}
	showXPNotification={game.showXPNotification}
	xpEarned={game.xpEarned}
	leveledUp={game.leveledUp}
	newLevel={game.newLevel}
/>

<!-- Toast Container -->
<ToastContainer bind:this={toastContainer} />

<!-- Game Container -->
<GameContainer
	title="🎯 My Exercise"
	description="Description of your exercise"
	gradient="from-blue-900 to-slate-900"
>
	<!-- Game Controls -->
	<GameControls gameState={game.gameState} onStartGame={startNewGame} onSkipRound={skipRound}>
		{#snippet startButton()}
			Start Challenge
		{/snippet}
	</GameControls>

	<!-- Exercise UI -->
	{#if isAudioPlaying && !game.gameState.showResult}
		<section class="mb-8">
			<h3 class="mb-4 text-center text-xl font-semibold">Your exercise UI here</h3>

			<button onclick={submitGuess}> Submit Guess </button>
		</section>
	{/if}

	<!-- Score Screen -->
	{#if game.gameState.gameCompleted}
		<ScoreScreen
			gameState={game.gameState}
			roundHistory={game.roundHistory}
			onPlayAgain={playAgain}
		/>
	{/if}
</GameContainer>
```

### Step 3: Add Exercise ID to Types

**File**: `src/lib/types/audio-training.ts`

```typescript
export type ExerciseId =
	| 'db-king'
	| 'panning'
	| 'filter-expert'
	| 'kit-cut'
	| 'stereohead'
	| 'eq'
	| 'eq-mirror'
	| 'my-exercise'; // ← Add your exercise here
```

### Step 4: Add to Exercise List

**File**: `src/routes/audio-training/+page.svelte`

Add your exercise card to the main selection page.

### Step 5: Test

```bash
npm run dev
```

Navigate to `/audio-training/my-exercise` and test!

---

## Code Examples

### Example 1: Simple Gain Exercise

```typescript
// Generate random gain value
function generateChallenge() {
	currentGain = Math.random() * 12 - 6; // -6dB to +6dB
}

// Setup audio with gain
async function startExercise() {
	audioManager.source = audioManager.createSource();
	gainNode = audioManager.audioContext!.createGain();

	gainNode.gain.setValueAtTime(
		Math.pow(10, currentGain / 20), // dB to linear
		audioManager.audioContext!.currentTime
	);

	audioManager.source.connect(gainNode);
	gainNode.connect(audioManager.audioContext!.destination);
	audioManager.startSource();
}
```

### Example 2: Interactive Canvas

```typescript
let canvas = $state<InteractiveCanvas>();

function draw() {
	if (!canvas) return;
	const ctx = canvas.getContext();
	if (!ctx) return;

	canvas.clear();
	canvas.drawBackground();

	// Draw custom visualization
	ctx.fillStyle = '#60a5fa';
	ctx.fillRect(x, y, width, height);
}

function handleClick(event: MouseEvent) {
	if (!canvas) return;
	const rect = canvas.getCanvas().getBoundingClientRect();
	const x = event.clientX - rect.left;
	// Handle click...
}
```

---

## Best Practices

### ✅ DO:

1. **Use `createGameManager()`** for all game state management
2. **Use `PlayerBar`** for XP display
3. **Use `GameContainer`** for consistent styling
4. **Add `ToastContainer`** for notifications
5. **Use `$state()` for reactive values**
6. **Clean up audio nodes** in `onDestroy()`
7. **Use `game.resetRoundHistory()`** when starting new game
8. **Handle null checks** for canvas/audio context
9. **Use snippet syntax** (`{#snippet}`) not slots
10. **Test XP notifications** to ensure they work

### ❌ DON'T:

1. **Don't manually manage XP state** - use `createGameManager()`
2. **Don't create custom ProfileCard/XPBar** - use PlayerBar
3. **Don't use legacy `$:` reactive statements** - use runes
4. **Don't forget to disconnect audio nodes** on cleanup
5. **Don't skip the layout** - exercises must be in `(exercises)` route group
6. **Don't hardcode colors** - use Tailwind classes
7. **Don't forget accessibility** - add ARIA labels
8. **Don't use `<slot>` syntax** - use snippets

---

## Performance Tips

1. **Debounce canvas redraws** for mouse move events
2. **Disconnect unused audio nodes** immediately
3. **Use `$derived` for computed values** instead of recalculating
4. **Lazy-load audio samples** to reduce initial load time
5. **Use `requestAnimationFrame`** for smooth animations

---

## Troubleshooting

### Issue: XP notifications not showing

**Solution**: Make sure you bind and set the toast container:

```svelte
<script>
	let toastContainer: ToastContainer;

	$effect(() => {
		if (toastContainer) {
			game.setToastContainer(toastContainer);
		}
	});
</script>

<ToastContainer bind:this={toastContainer} />
```

### Issue: Audio context suspended

**Solution**: Call `audioManager.resumeIfSuspended()` before playing:

```typescript
await audioManager.resumeIfSuspended();
audioManager.startSource();
```

### Issue: Canvas not drawing

**Solution**: Ensure canvas is initialized and use `$effect`:

```typescript
let canvas = $state<InteractiveCanvas>();

$effect(() => {
	if (canvas) {
		draw();
	}
});
```

---

## Resources

- **Web Audio API Docs**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Svelte 5 Runes**: https://svelte.dev/docs/svelte/$state
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Drizzle ORM**: https://orm.drizzle.team/

---

## Changelog

### 2026-02-05 - Major Refactoring ✅

- **Refactored all 7 exercises** to use unified architecture
- **Created `createGameManager()` composable** - eliminates 50+ lines per exercise
- **Added reusable components**: `PlayerBar`, `GameContainer`, `ToastContainer`
- **Migrated to Svelte 5 snippets** - removed deprecated `<slot>` syntax
- **Removed ~850 lines** of duplicate code
- **Added comprehensive documentation** (this file!)

---

**📝 Last Updated**: February 5, 2026  
**👤 Maintainer**: ArtsWarehouse Team  
**📧 Questions?**: See AGENTS.md for development guidelines

---

**Happy coding! 🎵✨**
