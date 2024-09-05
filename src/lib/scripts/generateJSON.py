import json
import random
import math

def gaussian_random(mean, std_dev):
    """
    Generates a random number using the Box-Muller transform.
    """
    u1 = random.random()
    u2 = random.random()
    z0 = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)
    random_float = z0 * std_dev + mean
    return round(random_float)

def load_default_job(filename):
    """
    Loads the default job data from a JSON file.
    """
    with open(filename, "r") as f:
        return json.load(f)

def generate_order(default_job, id):
    """
    Generates a single random order based on default job data.
    """
    order = {
        "name": random.choice(default_job["names"]),
        "id": f"order{id}",
    }
    store = random.choice(default_job["stores"])
    order["store"] = store["store"]
    order["earnings"] = gaussian_random(store["earnings"][0], store["earnings"][1])

    if order["earnings"] < 1:
        order["earnings"] = 1

    order["city"] = store["city"]
    order["amount"] = gaussian_random(store["amount"][0], store["amount"][1])
    if order["amount"] < 1:
        order["amount"] = 1
    order["expire"] = gaussian_random(store["expire"][0], store["expire"][1])
    if order["expire"] < 1:
        order["expire"] = 1
    order["items"] = {}
    for _ in range(order["amount"]):
        item = random.choice(store["items"])
        order["items"][item] = order["items"].get(item, 0) + 1
    return order

def queueNRandomOrders(n, default_job_data_path):
    """
    Queues N random orders and exports them to a JSON file.
    """

    default_job = load_default_job(default_job_data_path)
    next_orders = []
    for _ in range(n):
        next_orders.append(generate_order(default_job, _))

    with open("generated_orders.json", "w") as f:
        json.dump(next_orders, f, indent=4)  # Write orders to JSON with indentation

    return next_orders

# Example usage
if __name__ == "__main__":
    default_job_data_path = "./src/lib/scripts/game_modes/bundlingDefault.json"  # Replace with your path
    n_orders = 50
    queueNRandomOrders(n_orders, default_job_data_path)
    print(f"Generated {n_orders} random orders and saved to generated_orders.json")