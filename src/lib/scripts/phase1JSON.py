
import json
import random
import math
from itertools import permutations
def load_default_job(filename):
    """
    Loads the default job data from a JSON file.
    """
    with open(filename, "r") as f:
        return json.load(f)

#everything below is a generator function
"""
orders will have ids: start_id -> start_id + 3
loc is the possible ending locations of the previous state, used to calculate optimal probabilities
"""
def pure_randomness(default_job, start_id, loc):
    varies = []
    for _ in range(4):
        varies.append({
            "location": "none",
            "earnings": 0,
            "amount": 0,
            "unique": 0
        })
    return generate_group(default_job, start_id, varies, loc)

def equal_location_earnings(default_job, start_id, loc):
    varies = []
    for _ in range(4):
        varies.append({
            "location": "Sprouts Farmers Market",
            "earnings": 20,
            "amount": 0,
            "unique": 0
        })
    return generate_group(default_job, start_id, varies, loc)

def equal_earnings(default_job, start_id, loc):
    varies = []
    for _ in range(4):
        varies.append({
            "location": "none",
            "earnings": 20,
            "amount": 0,
            "unique": 0
        })
    return generate_group(default_job, start_id, varies, loc)

def vary_location(default_job, start_id, loc):
    varies = []
    for _ in range(4):
        varies.append({
            "location": "none",
            "earnings": 20,
            "amount": 8,
            "unique": 2
        })
    return generate_group(default_job, start_id, varies, loc)

def commonsense_item_amount(default_job, start_id, loc):
    varies = []
    #random index is the "easy" or obvious choice
    random_index = int(random.random()*4)
    for x in range(4):
        if x == random_index:
            varies.append({
                "location": "Sprouts Farmers Market",
                "earnings": 20,
                "amount": 5,
                "unique": 2
            })
        else:
            varies.append({
                "location": "Sprouts Farmers Market",
                "earnings": 20,
                "amount": 15,
                "unique": 5
            })
    return generate_group(default_job, start_id, varies, loc)

def vary_earnings_item_amount(default_job, start_id, loc):
    varies = []
    for x in range(4):
        varies.append({
            "location": "Sprouts Farmers Market",
            "earnings": 0,
            "amount": 0,
            "unique": 0
        })
    return generate_group(default_job, start_id, varies, loc)

def equal_everything(default_job, start_id, loc):
    #only thing that varies is the types of foods
    varies = []
    for x in range(4):
        varies.append({
            "location": "Sprouts Farmers Market",
            "earnings": 20,
            "amount": 6,
            "unique": 3
        })
    return generate_group(default_job, start_id, varies, loc)

#end generator functions here

def generate_group(default_job, start_id, varies, loc):
    order1 = generate(default_job, start_id, varies[0])
    order2 = generate(default_job, start_id + 1, varies[1])
    order3 = generate(default_job, start_id + 2, varies[2])
    order4 = generate(default_job, start_id + 3, varies[3])
    possibilities = get_optimality(default_job, order1, order2, order3, order4, loc)
    return (order1, order2, order3, order4), possibilities

def generate(default_job, id, vary):
    #randomize
    """
    Generates a single random order based on default job data and returns the type of indicator
    """
    order = {
        "name": random.choice(default_job["names"]),
        "id": f"order{id}",
    }
    if (vary['location'] == "none"):
        store = random.choice(default_job["stores"])
    else:
        store = find_store(default_job, vary['location'])

    order["store"] = store["store"]
    if vary['earnings'] == 0:
        order["earnings"] = int(random.random()*40)
    else:
        order["earnings"] = vary['earnings']
    

    if order["earnings"] < 1:
        order["earnings"] = 1
    order["startingearnings"] = order["earnings"]

    order["city"] = store["city"]
    if vary['amount'] == 0:
        order["amount"] = int(random.random()*20)
    else:
        order["amount"] = vary["amount"]
    if order["amount"] < 1:
        order["amount"] = 1
    order["expire"] = 1
    order["items"] = {}
    order["demand"] = 0
    
    if vary["unique"] == 0:
        unique_items = store['items']
    else:
        unique_items = random.sample(store['items'], vary["unique"])
    for _ in range(order["amount"]):
        item = random.choice(unique_items)
        order["items"][item] = order["items"].get(item, 0) + 1
    return order
    

def get_optimality(default_job, order1, order2, order3, order4, loc):
    possibilities = {}
    for l in loc:
        possibilities.update({
            str(order1['id']) + ";" + l + "-" + order1["city"]: calculation_single_helper(default_job, order1, l),
            str(order2['id']) + ";" + l + "-" + order2["city"]: calculation_single_helper(default_job, order2, l),
            str(order3['id']) + ";" + l + "-" + order3["city"]: calculation_single_helper(default_job, order3, l),
            str(order4['id']) + ";" + l + "-" + order4["city"]: calculation_single_helper(default_job, order4, l),
            str(order1['id']) + "," + str(order2['id']) + ";" + l + "-" + order1["city"]: calculation_bundle_helper(default_job, order1, order2, l),
            str(order1['id']) + "," + str(order3['id']) + ";" + l + "-" +  order1["city"]: calculation_bundle_helper(default_job, order1, order3, l),
            str(order1['id']) + "," + str(order4['id']) + ";" + l + "-" + order1["city"]: calculation_bundle_helper(default_job, order1, order4, l),
            str(order2['id']) + "," + str(order3['id']) + ";" + l + "-" + order2["city"]: calculation_bundle_helper(default_job, order2, order3, l),
            str(order2['id']) + "," + str(order4['id']) + ";" + l + "-" + order2["city"]: calculation_bundle_helper(default_job, order2, order4, l),
            str(order3['id']) + "," + str(order4['id']) + ";" + l + "-" + order3["city"]: calculation_bundle_helper(default_job, order3, order4, l),
        })
    return possibilities


#earnings/time (in seconds) of a non-bundled order
def calculation_single_helper(default_job, order, loc):
    selection = {
        "valid": True,
        "orderID": [order['id']],
        "bundled": False,
        "store": order['store'],
        "earnings": order['earnings'],
        "starting_location": loc
    }
    store = find_store(default_job, order['store'])
    min_time = 1
    max_time = 1
    selection["city"] = store["city"]
    
    grid = store['locations']
    items = list(order['items'].keys())
    start = find_entrance(grid)
    #first find time for movement   
    movement, selection['optimalmovement'] = brute_force_tsp(find_positions(grid, items), start)
    selection["movementtime"] = movement*(store["cellDistance"]/1000 + 0.3)
    #add a little bit to account for mouse movement/click
    min_time += movement*(store["cellDistance"]/1000 + 0.3)
    max_time += movement*(store["cellDistance"]/1000 + 0.3)

    #next find time for typing.
    #Lets say a typing speed of 20 - 80 WPM. with an average of 5 characters per word
    # this is 1/1.67 sec - 1/6.67 
    for item in items:
        #add a little bit for mouse movement/clicking and to type quantity
        min_time += ((len(item) + 1)/6.67) + 0.5
        max_time += ((len(item) + 1)/1.67) + 0.5
    selection["mintypingtime"] = min_time - selection["movementtime"]
    selection["maxtypingtime"] = max_time - selection["movementtime"]

    #traveling to a city time. no time added if it is the same location
    if store["city"] != loc:
        distances = default_job["distances"][loc]
        index = distances["destinations"].index(store["city"])
        min_time += distances["distances"][index]
        max_time += distances["distances"][index]
        selection["traveltime"] = distances["distances"][index]
    else:
        selection["traveltime"] = 0

    selection['low_expected_value'] = order['earnings']/min_time
    selection['high_expected_value'] = order['earnings']/max_time
    return selection
    
#earnings/time of a bundled order
def calculation_bundle_helper(default_job, order1, order2, loc):
    if (order1['store'] != order2['store']):
        return False
    selection = {
        "valid": True,
        "orderID": [order1['id'], order2['id']],
        "bundled": True,
        "store": order1['store'],
        "earnings": order1['earnings'] + order2['earnings'],
        "starting_location": loc
    }
    store = find_store(default_job, order1['store'])
    selection["city"] = store["city"]
    min_time = 0
    max_time = 0
    
    grid = store['locations']
    items = set(order1['items'].keys())
    items.update(order2['items'].keys())
    start = find_entrance(grid)
    #first find time for movement   
    movement, selection['optimalmovement'] = brute_force_tsp(find_positions(grid, items), start)
    #add a little bit to account for mouse movement/click
    selection["movementtime"] = movement*(store["cellDistance"]/1000 + 0.3)
    min_time += movement*(store["cellDistance"]/1000 + 0.3)
    max_time += movement*(store["cellDistance"]/1000 + 0.3)

    #next find time for typing.
    #Lets say a typing speed of 30 - 100 WPM. with an average of 5 characters per word
    # this is 1/2.5 sec - 1/8.33
    for item in items:
        #add a little bit for mouse movement/clicking and to type quantity
        #this extra addition is a little bit more for this versus non-bundled
        min_time += ((len(item) + 2)/8.33) + 0.8
        max_time += ((len(item) + 2)/2.5) + 0.8
    selection["mintypingtime"] = min_time - selection["movementtime"]
    selection["maxtypingtime"] = max_time - selection["movementtime"]

    #traveling to a city time. no time added if it is the same location
    if store["city"] != loc:
        distances = default_job["distances"][loc]
        index = distances["destinations"].index(store["city"])
        min_time += distances["distances"][index]
        max_time += distances["distances"][index]
        selection["traveltime"] = distances["distances"][index]
    else:
        selection["traveltime"] = 0

    selection['low_expected_value'] = (order1['earnings'] + order2['earnings'])/min_time
    selection['high_expected_value'] = (order1['earnings'] + order2['earnings'])/max_time
    return selection

def find_entrance(grid):
    for row in range(3):
        for col in range(3):
            if grid[row][col] == "Entrance":
                return (row, col)
    return (-1, -1)

def find_store(default_job, name):
    for s in default_job["stores"]:
        if s["store"] == name:
            return s
    return {}

def find_positions(grid, items):
    """Return a list of indices where the given characters are found in the 3x3 grid."""
    positions = []
    
    for row in range(3):
        for col in range(3):
            if grid[row][col].lower() in items:
                positions.append((row, col))

    return positions

def manhattan_distance(a, b):
    """Calculate the Manhattan distance between two points."""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def brute_force_tsp(points, start):
    """Find the shortest path visiting all points using brute force."""
    min_distance = float('inf')
    best_order = None

    for perm in permutations(points):
        path = (start,) + perm
        total_distance = sum(manhattan_distance(path[i], path[i + 1]) for i in range(len(path) - 1))
        if total_distance < min_distance:
            min_distance = total_distance
            best_order = path

    return min_distance, best_order

def custom_json_dump(data, file, max_indent=2, current_level=0):
    """Recursively dumps JSON data with limited indentation depth."""
    if isinstance(data, dict):
        if current_level >= max_indent:
            json.dump(data, file, separators=(',', ':'))  # Minified format beyond max_indent
        else:
            file.write("{\n")
            for i, (key, value) in enumerate(data.items()):
                file.write(" " * (current_level * 2) + f'"{key}": ')
                custom_json_dump(value, file, max_indent, current_level + 1)
                if i < len(data) - 1:
                    file.write(",\n")
            file.write("\n" + " " * ((current_level - 1) * 2) + "}")
    elif isinstance(data, list):
        if current_level >= max_indent:
            json.dump(data, file, separators=(',', ':'))  # Minified format beyond max_indent
        else:
            file.write("[\n")
            for i, item in enumerate(data):
                file.write(" " * (current_level * 2))
                custom_json_dump(item, file, max_indent, current_level + 1)
                if i < len(data) - 1:
                    file.write(",\n")
            file.write("\n" + " " * ((current_level - 1) * 2) + "]")
    else:
        json.dump(data, file)


#gives the best option, along with a reason why the criteria it fulfills. loc is the starting location
def determine_optimal(orders, possibilities, loc, threshold=[0.2, 0.2, 0.2, 0.2]):
    optimal = {
        "order_ids": []
    }
    for order in orders:
        optimal["order_ids"].append(order["id"])
    for l in loc:
        optimal[l] = {
            "optimal_choice": [],
            "tags": []
        }
        max_expected_value = 0
        max_expected_key = ""
        #find the best combo
        for key, value in possibilities.items():
            if not value:
                continue
            if l == value["starting_location"]:
                v = (value["low_expected_value"] + value["high_expected_value"])/2
                if v > max_expected_value:
                    max_expected_key = key
                    max_expected_value = v
        
        max_keys = []

        for key, value in possibilities.items():
            if not value:
                continue
            if l == value["starting_location"]:
                v = (value["low_expected_value"] + value["high_expected_value"])/2
                if v == max_expected_value:
                    max_keys.append(key)

        optimal[l]["optimal_choice"] = max_keys

        #look at the less optimal combos for comparison
        bundles_exist = False
        possible_locs = set()
        unoptimal = []
        #create an array with the less optimal combos
        for key, value in possibilities.items():
            if not value:
                continue
            if "," in key:
                bundles_exist = True
            if key in max_keys:
                continue
            possible_locs.add(value["city"])
            unoptimal.append(value)
        
        #find the optimal criteria
        #bundle or nonbundle if it is possible to bundle
        if bundles_exist:
            if possibilities[max_expected_key]["bundled"]:
                optimal[l]["tags"].append("bundle")
            else:
                optimal[l]["tags"].append("single")
    
        #location (if more than one location exists).
        # this tag will only be added if the location chosen was unique to the other options
        optimal_loc = possibilities[max_expected_key]["city"]
        if len(possible_locs) > 1 and (optimal_loc not in possible_locs):
            if optimal_loc == l:
                optimal[l]["tags"].append("samelocation:" + optimal_loc)
            else:
                optimal[l]["tags"].append("difflocation:" + optimal_loc)
        

        total_high_time = possibilities[max_expected_key]["earnings"]/possibilities[max_expected_key]["high_expected_value"]
        # earnings. this label appears only if the increase in earnings caused the value to be greater

        earning = True
        for u in unoptimal:
            if u["earnings"] >= possibilities[max_expected_key]["earnings"]:
                earning = False
                break
            #if we lower the optimal earnings to the other, and see that the value is now less
            if u["high_expected_value"] > u["earnings"]/total_high_time:
                earning = False
                break
        if earning:
            optimal[l]["tags"].append("earnings")

        
        # no traveling (similar to previous one)
        # the tag "no travel" will be added if traveling significantly decreased (at least 20% of high time)
        # the earnings/time compared other travel times
        # 
        travel_time = possibilities[max_expected_key]["traveltime"]
        travel = True
        if optimal_loc == l:
            for u in unoptimal:
                if u["earnings"]/u["high_expected_value"] < total_high_time:
                    travel = False
                    break
                #change in travel times / change in total times
                #value = earnings/time. so time = earnings/value
                unopt_value = (u["traveltime"] - travel_time)/(u["earnings"]/u["high_expected_value"] - total_high_time)
                if unopt_value < threshold[0]:
                    travel = False
                    break
        else:
            travel = False
        if travel:
            optimal[l]["tags"].append("pickorderinsamedestination")
        
        #movement. same as no travel except for movement
        movement_time = possibilities[max_expected_key]["movementtime"]
        movement = True
        for u in unoptimal:
            if u["earnings"]/u["high_expected_value"] < total_high_time:
                movement = False
                break
            unopt_value = (u["movementtime"]-movement_time)/(u["earnings"]/u["high_expected_value"] - total_high_time)
            if unopt_value < threshold[1]:
                movement = False
                break
        if movement:
            optimal[l]["tags"].append("movement")

        #food typing for FAST typers. same as no travel except for typing. do not expect to see this very much
        mintyping_time = possibilities[max_expected_key]["mintypingtime"]
        mintyping = True
        for u in unoptimal:
            if u["earnings"]/u["high_expected_value"] < total_high_time:
                mintyping = False
                break
            unopt_value = (u["mintypingtime"]-mintyping_time)/(u["earnings"]/u["high_expected_value"] - total_high_time)
            if unopt_value < threshold[2]:
                mintyping = False
                break
        if mintyping:
            optimal[l]["tags"].append("typing:fast")

        #food typing for SLOW typers. same as no travel except for typing. do not expect to see this very much, but more than previous
        maxtyping_time = possibilities[max_expected_key]["maxtypingtime"]
        maxtyping = True
        for u in unoptimal:
            if u["earnings"]/u["high_expected_value"] < total_high_time:
                maxtyping = False
                break
            unopt_value = (u["maxtypingtime"]-maxtyping_time)/(u["earnings"]/u["high_expected_value"] - total_high_time)
            if unopt_value < threshold[3]:
                maxtyping = False
                break
        if maxtyping:
            optimal[l]["tags"].append("typing:s")
    return optimal
        
def createSet(func, default_job, n, next_orders, next_possibilities, next_optimal, previous_locs={"Emeryville"}):
    orders, possibilities = func(default_job, n, previous_locs)
    optimal = determine_optimal(orders, possibilities, previous_locs, [0.1, 0.1, 0.1, 0.1])
    optimal["generator"] = func.__name__
    next_optimal.append(optimal)
    l = set()
    for o in orders:
        o["generator"] = func.__name__
        l.add(o["city"])
    for key in possibilities.keys():
        if not possibilities[key]:
            continue
        possibilities[key]["generator"] = func.__name__
    next_orders.extend(orders)
    next_possibilities.append(possibilities)
    return l
    


if __name__ == "__main__":
    default_job_data_path = "./src/lib/scripts/game_modes/phase1Stores.json"  # Replace with your path
    default_job = load_default_job(default_job_data_path)
    next_orders = []
    next_possibilities = []
    next_optimal = []
    previous_locs = {"Emeryville"}
    count = 0
    generators = [vary_earnings_item_amount,vary_location, equal_earnings, equal_everything, equal_location_earnings, commonsense_item_amount, pure_randomness]
    previous_locs = createSet(commonsense_item_amount, default_job, count, next_orders, next_possibilities, next_optimal, previous_locs)
    count += 4
    for x in range(80):
        if x % 5 == 3:
            previous_locs = createSet(pure_randomness, default_job, count, next_orders, next_possibilities, next_optimal, previous_locs)
            continue
        if x % 3 <= 1:
            previous_locs = createSet(random.choice(generators), default_job, count, next_orders, next_possibilities, next_optimal, previous_locs)
        else:
            previous_locs = createSet(equal_location_earnings, default_job, count, next_orders, next_possibilities, next_optimal, previous_locs)
        count += 4

    with open("phase1_orders.json", "w") as f:
        custom_json_dump(next_orders, f, max_indent=3)  # Write orders to JSON with indentation
    with open("phase1_possibilities.json", "w") as f:
        custom_json_dump(next_possibilities, f, max_indent=3)  # Write orders to JSON with indentation
    with open("phase1_optimal.json", "w") as f:
        custom_json_dump(next_optimal, f, max_indent=3)  # Write orders to JSON with indentation