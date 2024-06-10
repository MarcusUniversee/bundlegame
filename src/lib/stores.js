// place files you want to import through the `$lib` alias in this folder.
import { writable, readable, derived, get} from 'svelte/store';
import { data } from '$lib/data.js';
import { queueNJobs, queueNRandomJobs, queueNextJob, queueRandomJob } from '$lib/jobs.js'

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
export const seenWords = writable(new Set())
export const mode = writable(SAVED);
export const session_id = writable('');

// the number of jobs completed
export const eatsJobsCompleted = writable(0);
export const driverJobsCompleted = writable(0);

const difficulty_multiplier = 5;

// Normalization factors (we can't make double)
const minDifficulty = 0;
const maxDifficulty = 100;

// Create derived stores for normalized difficulties
export const normalized_ubereats_difficulty = derived([eatsJobsCompleted], ($eatsJobsCompleted) => {
    const ubereats_difficulty = difficulty_multiplier * $eatsJobsCompleted;
    return (ubereats_difficulty - minDifficulty) / (maxDifficulty - minDifficulty);
});

export const normalized_driver_difficulty = derived([driverJobsCompleted], ($driverJobsCompleted) => {
    const driver_difficulty = difficulty_multiplier * $driverJobsCompleted;
    return (driver_difficulty - minDifficulty) / (maxDifficulty - minDifficulty);
});

export function resetTimer() {
	start = new Date();
}

const defaultJobs = [
	{
		id: 0,
		waitTime: null,
		timeLimit: null,
		type: 'UberEats',
		city: 'SF',
		index: null,
		data: null,
		avgWait: 15,
		avgEarnings: 40,
		avgItems: 13,
		ready: false, 
        expired: false,
		hasUnfamiliarItems: false,
	},
	{
		id: 2,
		waitTime: null,
		timeLimit: null,
		type: 'UberEats',
		city: 'Berkeley',
		index: null,
		data: null,
		avgWait: 20,
		avgEarnings: 40,
		avgItems: 13,
		ready: false, 
        expired: false,
		hasUnfamiliarItems: true,
	},
	{
		id: 3,
		waitTime: null,
		timeLimit: null,
		type: 'Uber',
		city: 'Berkeley',
		index: null,
		data: null,
		avgWait: 10,
		avgEarnings: 20,
		avgItems: 10,
		ready: false, 
		expired: false,
		hasUnfamiliarItems: false,
	},
	{
		id: 1,
		waitTime: null,
		timeLimit: null,
		type: 'Uber',
		city: 'SF',
		index: null,
		data: null,
		avgWait: 5,
		avgEarnings: 20,
		avgItems: 10,
		ready: false, 
		expired: false,
		hasUnfamiliarItems: false,
	},
]

const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 10);

	return function stop() {
		clearInterval(interval);
	};
});

export const timeStamp = derived(time, ($time) => $time - start);
export const history = writable([]);

// Send history to qualtircs
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

let historyData = [];
const historydata = history.subscribe(($history) => {
  historyData = $history; 
})
function uploadData() {
	const gameArrToSend = JSON.stringify(historyData);
	console.log('Sending experiment result:', gameArrToSend);
	console.log('Type of experiment result:', typeof gameArrToSend);
	window.parent.postMessage({ type: 'gameArr', data: gameArrToSend }, '*');
} 

// Store Data
const eventMapping = {
	"start game": 0,
	"choose work": 1,
	"enter home screen": 2,
	"job available": 3,
	"job expire": 4,
	"start job": 5,
	"guess result": 6,
	"copy paste": 7,
	"finish job": 8,
	"rate": 9,
	"choose leisure": 10,
	"confirm stay in leisure": 11,
	"confirm leave leisure": 12,
	"didn't choose": 13,
	"switch to leisure": 14,
	"switch to work": 15,
	"finish game": 16
  };
  
  // Count of each event type
const eventCounts = {};

// Update Data Function
export function logHistory(eventKey, specific = null, message) {
	console.log('DEBUG', t);
	const eventId = eventMapping[eventKey];
	if (eventId === undefined) {
		console.error(`Unknown event key: ${eventKey}`);
		return;
	}
	const eventCount = (eventCounts[eventId] = (eventCounts[eventId] || 0) + 1);
	const eventTime = t || 0.0;
	const eventData = {
	  time: eventTime.toFixed(3), // Format to 3 decimal places
	  event_id: eventId,
	  count: eventCount,
	  core_data: specific,
	  full_message: message,
	};
	history.update((list) => {
	  list.push(eventData);
	  console.log(list);
	  return list;
	});
}
// export function logHistory(message) {
// 	console.log('DEBUG', t);
// 	history.update((list) => {
// 		list.push({ time: t || 0.0, event: message });
// 		console.log(list);
// 		return list;
// 	});
// }


export const startedWith = readable(Math.random() < 0.5 ? 'Eats' : 'Driver');

// Changed to empty list and generated in generateData
export const jobs = writable([]);

// Generate job data from database
export function generateData() {
	jobs.update(currentJobs => {
	  for (let i = 0; i < 4; i++) {
		if (currentJobs[i].waitTime === null && currentJobs[i].timeLimit === null) {
			const index = Math.floor(Math.random() * data[i].length);
			const random_dataPt = data[i][index];
			currentJobs[i].data = random_dataPt;
			currentJobs[i].waitTime = random_dataPt[0];
			currentJobs[i].timeLimit = random_dataPt[1];
			currentJobs[i].index = [i, index];
			console.log('update:' + currentJobs[i].type + currentJobs[i].city);
			console.log('updated job:' + currentJobs[i].waitTime + ' ' + currentJobs[i].timeLimit);
		  }
		}
	return currentJobs;
	});
}

export function generateDataV2() {
	if (get(mode) === SAVED) {
		const generatedJobs = queueNJobs(4);
		jobs.update(currentJobs => [...currentJobs, ...generatedJobs]);		
	}
	if (get(mode) === RANDOM) {
		const generatedJobs = queueNRandomJobs(4);
		jobs.update(currentJobs => [...currentJobs, ...generatedJobs]);
	}
}

export function generateSingleDataV2(index) {
	if (get(mode) == SAVED) {
		return queueNextJob(index);
	}
	if (get(mode) == RANDOM) {
		return queueRandomJob(index);
	}
}

export function generateSingleData(id) {
	jobs.update(currentJobs => {
		const random_dataPt = data[id][index];
		currentJobs[id].data = random_dataPt;
		currentJobs[id].waitTime = random_dataPt[0];
		currentJobs[id].timeLimit = random_dataPt[1];
		currentJobs[id].index = [id, index];
		currentJobs[id].ready = false;
		currentJobs[id].expired = false;
		console.log('update:' + currentJobs[id].type + currentJobs[id].city);
		console.log('updated job:' + currentJobs[id].waitTime + ' ' + currentJobs[id].timeLimit);
		console.log(get(jobs));
		return currentJobs;
	});
}

/* Game State */
export const earned = writable(0);
export const currLocation = writable('Berkeley');

export const game = writable({
	inGame: false,
	inSummary: false,
	inChoices: false,
	inLeisure: false,
});

export function setMode(choice) {
	mode.set(choice);
}

export function setSessionId(id) {
	session_id.set(id);
}

/* Add word to seen words */
export function addToSeenWords(word) {
	seenWords.update(set => {
		set.add(word);
		return new Set(set); // Return a new Set to trigger reactivity
	});
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

export function startGameV2(title, earnings, numSteps, timeLimit, hardLimit, hasUnfamiliarItems, eatsJobsCompleted, driverJobsCompleted, currGameWords) {
	console.log('Starting');

	/* Sets the game status to the provided fields */
	// console.log(currGameWords);
	game.set({
		inGame: true,
		title: title,
		isUberEats: title.includes('UberEats'),
		earnings: earnings,
		numSteps: numSteps,
		timeLimit: timeLimit,
		hardLimit: hardLimit,
		hasUnfamiliarItems: hasUnfamiliarItems,
		eatsJobsCompleted: eatsJobsCompleted,
		driverJobsCompleted: driverJobsCompleted,
		currGameWords: currGameWords,
	});
	// console.log(isUberEats.includes('UberEats'));
}

export function endGame(gained, gameState, isUberEats) {
	console.log('Ending');
	let difficulty_multiplier = isUberEats ? get(normalized_ubereats_difficulty): get(normalized_ubereats_difficulty);

	// earned.update((n) => n + gained);
	/* You get (round*difficulty_multiplier)% more on subsequent rounds. Leisure has no multiplier*/
	earned.update((n) => {
		// TODO: Difficulty Multiplier
		// const updatedValue = parseFloat((n + gained + gained*difficulty_multiplier).toFixed(2));
		return gained + n;
	});

	/* Increases the number of jobs for type */
	if (isUberEats) {
		eatsJobsCompleted.update((jobs) => jobs + 1);
	} else if (gameState.isUberEats) {
		driverJobsCompleted.update((jobs) => jobs + 1);
	}

	gameState.inGame = false;
	gameState.inSummary = true;
	console.log(gameState);
	game.set(gameState);
}

// elapsed time shared on every page
export const elapsed = derived(timeStamp, ($timeStamp) => Math.round($timeStamp / 1000));
