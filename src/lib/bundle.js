import { writable, readable, derived, get} from 'svelte/store';

let start;
export const FullTimeLimit = 1200;
export const GameOver = writable(false);

export const gameText = writable({
	selector: "None selected",
})

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
		GameOver.set(false);
	}
});

export const orders = writable([])
export const finishedOrders = writable([])
export const failedOrders = writable([])

export const earned = writable(0);
export const currLocation = writable('Berkeley');

export const elapsed = derived(timeStamp, ($timeStamp) => Math.round($timeStamp / 1000));