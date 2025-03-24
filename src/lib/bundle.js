import { writable, readable, derived, get} from 'svelte/store';
import { addAction, addOrder, updateFields, updateOrder, authenticateUser } from './firebaseDB';

let start;
let stopTimeInterval;
let actionCounter = 0;
export const orderList = writable([])
export const FullTimeLimit = 50;
export const GameOver = writable(false);
export const gameText = writable({
	selector: "None selected",
})
export const ordersShown = 4;
export const game = writable({
	inSelect: false,
	inStore: false,
	bundled: false,
	phase: 1,
});

export const tipTimers = writable([])

export function createTipTimer(id, initialTime) {
	tipTimers.update(t => {
		const newTimer = { orderId: id, remainingTime: initialTime, intervalId: null };
      	return [...t, newTimer];
	})
}

export function startTipTimer(id) {
    tipTimers.update(t => {
      	const updatedTimers = t.map(timer => {
			if (timer.id === id && timer.intervalId === null) {
				timer.intervalId = setInterval(() => {
					tipTimers.update(tipTimers => {
						const updated = tipTimers.map(t => {
							if (t.id === id && t.remainingTime > 0) {
								t.remainingTime -= 1;
							}
							return t;
						});
						return updated;
					});
				}, 1000);
			}
        	return timer;
      	});
      	return updatedTimers;
    });
}

export function stopTipTimer(id) {
	tipTimers.update(t => {
		const updatedTimers = t.map(timer => {
			if (timer.id === id && timer.intervalId !== null) {
				clearInterval(timer.intervalId);
				timer.intervalId = null;
			}
			return timer;
		});
		return updatedTimers;
	});
}

export function removeTipTimer(id) {
	tipTimers.update(t => {
		const updatedTimers = t.filter(timer => timer.id !== id); // Filter out the timer with the specified id
		return updatedTimers;
	});
}

export function resetTimer() {
	start = new Date();
}

const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 10);

	stopTimeInterval = () => clearInterval(interval);
	
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
	console.log(elapsedSeconds)
	if (elapsedSeconds >= FullTimeLimit && elapsedSeconds <= FullTimeLimit + 2) {
		updateFields(get(id), {
			earnings: get(earned),
        	ordersComplete: get(finishedOrders).length,
        	gametime: FullTimeLimit
		})
		GameOver.set(true);
		stopTimeInterval?.();
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

export const logOrder = (order, options) => {
	order.startgametime = get(elapsed)
	order.status = 0
	order.bundled = false
	let optionslst = []
	for (let i=0; i<options.length; i++) {
		optionslst.push(options[i].id)
	}
	order.options = optionslst
	addOrder(get(id), order, order.id)
}
export const logBundledOrder = (order1, order2, options) => {
	order1.startgametime = get(elapsed)
	order1.status = 0
	order1.bundled = true
	order1.bundledWith = order2.id
	order2.startgametime = get(elapsed)
	order2.status = 0
	order2.bundled = true
	order2.bundledWith = order1.id
	let optionslst = []
	for (let i=0; i<options.length; i++) {
		optionslst.push(options[i].id)
	}
	order1.options = optionslst
	order2.options = optionslst
	addOrder(get(id), order1, order1.id)
	addOrder(get(id), order2, order2.id)
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