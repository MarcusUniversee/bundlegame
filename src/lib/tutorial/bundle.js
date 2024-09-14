import { writable, readable, derived, get} from 'svelte/store';

let start;
let actionCounter = 0;
export const orderList = writable([])
export const FullTimeLimit = 300;
export const GameOver = writable(false);
export const gameText = writable({
	selector: "None selected",
})
export const ordersShown = 4;
export const game = writable({
	inSelect: false,
	inStore: false,
	bundled: false,
});

export function resetTimer() {
	start = new Date();
}

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

timeStamp.subscribe((v) => {
	t = v / 1000;
	if (get(GameOver)) {
		//GameOver.set(false);
	}
});

export const orders = writable([])
export const finishedOrders = writable([])
export const failedOrders = writable([])
export const id = writable("")

export const earned = writable(0);
export const currLocation = writable('Los Angeles');

export const elapsed = derived(timeStamp, ($timeStamp, set) => {
	const elapsedSeconds = Math.round($timeStamp / 1000);
	if (elapsedSeconds >= FullTimeLimit && elapsedSeconds <= FullTimeLimit + 2) {
		GameOver.set(true);
		clearInterval();
		set(FullTimeLimit)
		return;
	}
	set(elapsedSeconds);
});

export const getConfig = (loc) => {
	console.log(loc)
	if (loc == "Los Angeles") {
		return {
			"city": "Los Angeles",
			"locations": [
				["Entrance", "Cherry"],
				["Grape", "Apple"]
			],
			"cellDistance": 2000,
		}
	}
	return {
		"city": "Irvine",
		"locations": [
			["Entrance", "Apple"],
			["Banana", "Pear"]
		],
		"cellDistance": 1000,
	}
}