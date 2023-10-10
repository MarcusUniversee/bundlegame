// place files you want to import through the `$lib` alias in this folder.
import { writable, readable, derived } from 'svelte/store';

/* Time Stamps & History */

let start = new Date();

const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 100);

	return function stop() {
		clearInterval(interval);
	};
});

const timeStamp = derived(time, ($time) => $time - start);

export const history = writable([]);

export function historyLog(message) {
	history.update((list) => {
		list.push({ time: $timeStamp, event: message });
		return list;
	});
}

/* Game State */

export const earned = writable(0);
export const game = writable({
	inGame: false,
	inSummary: false
});

export function startGame(isUberEats, earnings, numSteps, timeLimit, hardLimit) {
	console.log('Starting');

	game.set({
		inGame: true,
		title: isUberEats,
		isUberEats: isUberEats.includes('UberEats'),
		earnings: earnings,
		numSteps: numSteps,
		timeLimit: timeLimit,
		hardLimit: hardLimit
	});
	console.log(isUberEats.includes('UberEats'));
}

export function endGame(gained) {
	console.log('Ending');

	earned.update((n) => n + gained);

	game.set({
		inGame: false,
		inSummary: true
	});
}

export const elapsed = derived(timeStamp, ($timeStamp) => Math.round($timeStamp / 1000));