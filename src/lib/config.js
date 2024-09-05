import default_job from "./scripts/game_modes/bundlingDefault.json" with { type: "json" };
import order_list from "./scripts/game_modes/generated_orders.json" with { type: "json" };

let id = 0;
let orderid = 0;

function gaussianRandom(mean, stdDev) {
    // Using the Box-Muller transform to generate a Gaussian-distributed random number
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    // Scale and shift to match the desired mean and standard deviation
    let randomFloat = z0 * stdDev + mean;
    
    // Round to the nearest integer
    let randomInt = Math.round(randomFloat);
    
    return randomInt;
}

/* Queues N orders */
export function queueNRandomOrders(n) {
    const next_orders = [];
    for (let i = 0; i < n; i++) {
        //randomly generate
        let order = {
            name: default_job["names"][Math.floor(Math.random() * default_job["names"].length)]
        }
        let store = default_job["stores"][Math.floor(Math.random() * default_job["stores"].length)];
        order.store = store["store"]
        order.earnings = gaussianRandom(store["earnings"][0], store["earnings"][1])
        if (order.earnings < 1) {
            order.earnings = 1;
        }
        order.city = store["city"]
        let count = gaussianRandom(store["amount"][0], store["amount"][1])
        if (count < 1) {
            count = 1;
        }
        order.amount = count
        order.items = {}
        order.id = "generated" + id
        for (let i=0; i<count; i++) {
            //pick an item
            let item = store["items"][Math.floor(Math.random() * store["items"].length)]
            if (Object.keys(order["items"]).includes(item)) {
                order.items[item] += 1
            } else {
                order.items[item] = 1
            }
        }
        next_orders.push(order);
        id += 1;
    }
    return next_orders;
}

export function queueNFixedOrders(n) {
    const next_orders = []
    for (let i = 0; i < n; i++) {
        next_orders.push(order_list[orderid])
        orderid += 1;
    }
    return next_orders
}

/* Returns the configuration for a store */
export function storeConfig(store) {
    let r = ""
    default_job["stores"].forEach((e) => {
        if (e["store"] === store) {
            r = e;
        }
    })
    return r;
}

export function getDistances(location) {
    return default_job["distances"][location]
}