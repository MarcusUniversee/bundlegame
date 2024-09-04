import { writable, readable, derived, get} from 'svelte/store';
import { addAction, addOrder, updateFields, updateOrder, authenticateUser } from './firebaseDB';

let start;
let actionCounter = 0;
export const FullTimeLimit = 200;
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
		//GameOver.set(false);
	}
});

export const orders = writable([])
export const finishedOrders = writable([])
export const failedOrders = writable([])
export const id = writable("")

export const earned = writable(0);
export const currLocation = writable('Berkeley');

export const elapsed = derived(timeStamp, ($timeStamp, set) => {
	const elapsedSeconds = Math.round($timeStamp / 1000);
	if (elapsedSeconds == FullTimeLimit) {
		updateFields(get(id), {
			earnings: get(earned),
        	ordersComplete: get(finishedOrders).length,
        	gametime: FullTimeLimit
		})
		GameOver.set(true);
		clearInterval();
		set(FullTimeLimit)
		return;
	}
	set(elapsedSeconds);
});

export const logAction = (action) => {
	action.earnings = get(earned)
	action.ordersComplete = get(finishedOrders).length
	action.gametime = get(elapsed)
	console.log(action)
	addAction(get(id), action, actionCounter + "_" + action.buttonID)
	actionCounter += 1;
}

export const logOrder = (order) => {
	order.startgametime = get(elapsed)
	order.status = 0
	order.bundled = get(game).bundled
	console.log(order)
	addOrder(get(id), order, order.id)
}

//state should contain info such as:
//whether the order was completed succesfully or not
//how many tries it took, etc
export const completeOrder = (orderID) => {
	let state = {
		status: 1,
		endgametime: get(elapsed)
	}
	updateOrder(get(id), state, orderID)
}

export const authUser = (id, pass) => {
	return authenticateUser(id, pass)
}