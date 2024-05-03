// place files you want to import through the `$lib` alias in this folder.
import { writable, readable, derived, get} from 'svelte/store';

/* Variables to indicate whether we chose from a saved or random state */
export const SAVED = 'saved';
export const RANDOM = 'random';

/* Time Stamps & History */
export const FullTimeLimit = 1200;
let start;
export const confirmedToStay = writable(false);
export const LeisureTime = writable(0.0);
export const leisureStart = writable(0.0);
export const leisurePay = 0.01;
export const GameOver = writable(false);
export const currentGameIndex = 0;

/* Number of Types of jobs completed */
export const eatsJobsCompleted = writable(0);
export const driverJobsCompleted = writable(0);

/* Resets the timer */
export function resetTimer() {
	start = new Date();
}

/* Game Time */
const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 10);

	return function stop() {
		clearInterval(interval);
	};
});

/* Timestamp Constants */
export const timeStamp = derived(time, ($time) => $time - start);
export const history = writable([]);
let t;
let lastHistoryResetTime = 0;
const sendInterval = 60;

timeStamp.subscribe((v) => {
	t = v / 1000;
	if (get(GameOver)) {
		uploadData();
		GameOver.set(false);
	}
	else if (t - lastHistoryResetTime >= sendInterval) {
		lastHistoryResetTime = t;
		uploadData();
		restartHistory();
	}
});

export function restartHistory() {
	history.set([]);
}

/* Game State */
export const earned = writable(0);
export const currLocation = writable('Berkeley');

/* Game State */
export const game = writable({
	inGame: false,
	inSummary: false,
	inChoices: false,
	inLeisure: false,
	gameMode: SAVED
});

/* Start Game given game state */
export function startGame(isUberEats, earnings, numSteps, timeLimit, hardLimit, hasUnfamiliarItems, eatsJobsCompleted, driverJobsCompleted) {
	console.log('Starting');

	game.set({
		inGame: true,
		title: isUberEats,
		isUberEats: isUberEats.includes('UberEats'),
		earnings: earnings,
		numSteps: numSteps,
		timeLimit: timeLimit,
		hardLimit: hardLimit,
		hasUnfamiliarItems: hasUnfamiliarItems,
		eatsJobsCompleted: eatsJobsCompleted,
		driverJobsCompleted: driverJobsCompleted,
	});
	console.log(isUberEats.includes('UberEats'));
}


export function startGame(isUberEats, earnings, numSteps, timeLimit, hardLimit, hasUnfamiliarItems, eatsJobsCompleted, driverJobsCompleted) {
	console.log('Starting');

	game.set({
		inGame: true,
		title: isUberEats,
		isUberEats: isUberEats.includes('UberEats'),
		earnings: earnings,
		numSteps: numSteps,
		timeLimit: timeLimit,
		hardLimit: hardLimit,
		hasUnfamiliarItems: hasUnfamiliarItems,
		eatsJobsCompleted: eatsJobsCompleted,
		driverJobsCompleted: driverJobsCompleted,
	});
	console.log(isUberEats.includes('UberEats'));
}

export function endGame(gained, gameState, isUberEats) {
	console.log('Ending');
	let difficulty_multiplier = isUberEats ? get(normalized_ubereats_difficulty): get(normalized_ubereats_difficulty);

	// earned.update((n) => n + gained);
	/* You get (round*difficulty_multiplier)% more on subsequent rounds. Leisure has no multiplier*/
	earned.update((n) => {
		const updatedValue = parseFloat((n + gained + gained*difficulty_multiplier).toFixed(2));
		return updatedValue;
	});

	/* Increases the number of jobs for type */
	if (isUberEats) {
		eatsJobsCompleted.update((jobs) => jobs + 1);
	} else if (gameState.isUberEats) {
		driverJobsCompleted.update((jobs) => jobs + 1);
	}

	gameState.inGame = false;
	gameState.inSummary = true;
	game.set(gameState);
}

// elapsed time shared on every page
export const elapsed = derived(timeStamp, ($timeStamp) => Math.round($timeStamp / 1000));