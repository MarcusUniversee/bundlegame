import random
import json
import sys
import helpers
from typing import List
import argparse
import constants
import numpy as np

def generate_games(
    game_count: int = constants.DEFAULT_GAME_COUNT,
    avg_wait_time: int = constants.DEFAULT_AVG_WAIT_TIME,
    sigma_wait_time: int = constants.DEFAULT_SIGMA_WAIT_TIME,
    avg_earnings: int = constants.DEFAULT_AVG_EARNINGS,
    sigma_earnings: int = constants.DEFAULT_SIGMA_EARNINGS,
    avg_items: int = constants.DEFAULT_AVG_ITEMS,
    sigma_items: int = constants.DEFAULT_SIGMA_ITEMS,
    avg_time_limit: int = constants.DEFAULT_AVG_TIME_LIMIT,
    sigma_time_limit: int = constants.DEFAULT_SIGMA_TIME_LIMIT,
    types: List[str] = constants.DEFAULT_TYPES,
    cities: List[str] = constants.DEFAULT_CITIES,
    can_have_unfamiliar_items: bool = constants.DEFAULT_CAN_HAVE_UNFAMILIAR_ITEMS,
    unfamiliar_items_rate: float = constants.DEFAULT_UNFAMILIAR_ITEMS_RATE,
    hold_type: str = None,
    hold_city: str = None,
):
    """
    Generate a json of games given the provided parameters. If any of the parameters
    hold_{parameter} parameters functions are set the true, we will hold this variable across
    every job rather than uniformly sample from the given range.
    
    For each game, we sample from the provided avg and sd to create the shown values,
    making the represented average value.
    After we, we sample from this average value then our global sd. The global sd 
    is relatively small to stay around the expected average. 

    Currently the options parameters are sampled uniformly
    """
    games = []
    for id in range(1, game_count + 1):

        game = {
            "id": id,
            "trueWaitTime": 0,
            "trueEarnings": 0,
            "trueItemsCount": 0,
            "trueTimeLimit": 0,
            "avgWait": max(constants.MIN_WAIT_TIME, int(np.random.normal(avg_wait_time, sigma_wait_time, 1))),
            "avgEarnings": max(constants.MIN_EARNINGS, int(np.random.normal(avg_earnings, sigma_earnings, 1))),
            "avgItemsCount": max(constants.MIN_ITEMS_COUNT, int(np.random.normal(avg_items, sigma_items, 1))),
            "avgTimeLimit": max(constants.MIN_TIME_LIMIT, int(np.random.normal(avg_time_limit, sigma_time_limit, 1))),
            "city": hold_city if hold_city else random.choice(cities),
            "job_type": hold_type if hold_type else random.choice(types),
            "hasUnfamiliarItems": can_have_unfamiliar_items,
            "unfamiliarRate": 0.0,
            "itemSequence": [],
        }
        game['trueEarnings'] = max(constants.MIN_EARNINGS, int(np.random.normal(game['avgEarnings'], constants.GLOBAL_SIGMA, 1)))
        game['trueWaitTime'] = max(constants.MIN_WAIT_TIME, int(np.random.normal(game['avgWait'], constants.GLOBAL_SIGMA, 1)))
        game['trueItemsCount'] = max(constants.MIN_ITEMS_COUNT, int(np.random.normal(game['avgItemsCount'], constants.GLOBAL_SIGMA, 1)))
        game['trueTimeLimit'] = max(constants.MIN_TIME_LIMIT, int(np.random.normal(game['avgTimeLimit'], constants.GLOBAL_SIGMA, 1)))

        if game["hasUnfamiliarItems"]:
            game["unfamiliarRate"] = unfamiliar_items_rate
        for _ in range(game['trueItemsCount']):
            if game['job_type'] == constants.UBER_EATS:
                game['itemSequence'].append(helpers.sample_from_lists(constants.UNFAMILIAR_FOODS, constants.FAMILIAR_FOODS, game["unfamiliarRate"]))
            else:
                game['itemSequence'].append(helpers.sample_from_lists(constants.UNFAMILIAR_SIGNS, constants.FAMILIAR_SIGNS, game["unfamiliarRate"]))
        games.append(game)
        id += 1
    return games

def parse_arguments():
    parser = argparse.ArgumentParser(description="Generate JSON of games")
    parser.add_argument("--game_count", type=int, default=constants.DEFAULT_GAME_COUNT, help=f"Number of games (default: {constants.DEFAULT_GAME_COUNT})")
    parser.add_argument("--avg_wait_time", type=int, default=constants.DEFAULT_AVG_WAIT_TIME, help=f"Average wait time (default: {constants.DEFAULT_AVG_WAIT_TIME})")
    parser.add_argument("--sigma_wait_time", type=int, default=constants.DEFAULT_SIGMA_WAIT_TIME, help=f"Standard deviation of wait time (default: {constants.DEFAULT_SIGMA_WAIT_TIME})")
    parser.add_argument("--avg_earnings", type=int, default=constants.DEFAULT_AVG_EARNINGS, help=f"Average earnings (default: {constants.DEFAULT_AVG_EARNINGS})")
    parser.add_argument("--sigma_earnings", type=int, default=constants.DEFAULT_SIGMA_EARNINGS, help=f"Standard deviation of earnings (default: {constants.DEFAULT_SIGMA_EARNINGS})")
    parser.add_argument("--avg_items", type=int, default=constants.DEFAULT_AVG_ITEMS, help=f"Average number of items (default: {constants.DEFAULT_AVG_ITEMS})")
    parser.add_argument("--sigma_items", type=int, default=constants.DEFAULT_SIGMA_ITEMS, help=f"Standard deviation of items (default: {constants.DEFAULT_SIGMA_ITEMS})")
    parser.add_argument("--avg_time_limit", type=int, default=constants.DEFAULT_AVG_TIME_LIMIT, help=f"Average time limit (default: {constants.DEFAULT_AVG_TIME_LIMIT})")
    parser.add_argument("--sigma_time_limit", type=int, default=constants.DEFAULT_SIGMA_TIME_LIMIT, help=f"Standard deviation of time limit (default: {constants.DEFAULT_SIGMA_TIME_LIMIT})")
    parser.add_argument("--types", nargs="+", default=constants.DEFAULT_TYPES, help=f"List of types (default: {constants.DEFAULT_TYPES})")
    parser.add_argument("--cities", nargs="+", default=constants.DEFAULT_CITIES, help=f"List of cities (default: {constants.DEFAULT_CITIES})")
    parser.add_argument("--can_have_unfamiliar_items", type=bool, default=constants.DEFAULT_CAN_HAVE_UNFAMILIAR_ITEMS, help=f"Flag indicating if unfamiliar items can be included (default: {constants.DEFAULT_CAN_HAVE_UNFAMILIAR_ITEMS})")
    parser.add_argument("--unfamiliar_items_rate", type=float, default=constants.DEFAULT_UNFAMILIAR_ITEMS_RATE, help=f"Rate of unfamiliar items (default: {constants.DEFAULT_UNFAMILIAR_ITEMS_RATE})")
    parser.add_argument("--hold_type", type=str, default=None, help="Constant type for all jobs")
    parser.add_argument("--hold_city", type=str, default=None, help="Constant city for all jobs")
    parser.add_argument("file_name", type=str, help="Name of the file")

    return parser.parse_args()
    

if __name__ == "__main__":
    args = parse_arguments()

    print("Arguments:")
    print(f"Output filename: {args.file_name}")
    print(f"Game count: {args.game_count}")
    print(f"Avg wait time: {args.avg_wait_time}")
    print(f"Sigma wait time: {args.sigma_wait_time}")
    print(f"Avg earnings: {args.avg_earnings}")
    print(f"Sigma earnings: {args.sigma_earnings}")
    print(f"Avg items: {args.avg_items}")
    print(f"Sigma items: {args.sigma_items}")
    print(f"Avg time limit: {args.avg_time_limit}")
    print(f"Sigma time limit: {args.sigma_time_limit}")
    print(f"Types: {args.types}")
    print(f"Cities: {args.cities}")
    print(f"Can have unfamiliar items: {args.can_have_unfamiliar_items}")
    print(f"Unfamiliar items rate: {args.unfamiliar_items_rate}")
    print(f"Hold type: {args.hold_type}")
    print(f"Hold city: {args.hold_city}")

    json_out = {}

    config = {}

    # Iterate through args attributes
    for arg_name in vars(args):
        # Construct key by removing "args." prefix
        key = arg_name.replace("args.", "")
        # Add key-value pair to config
        config[key] = getattr(args, arg_name)

    json_out['config'] = config

    games = generate_games(
        args.game_count,
        args.avg_wait_time,
        args.sigma_wait_time,
        args.avg_earnings,
        args.sigma_earnings,
        args.avg_items,
        args.sigma_items,
        args.avg_time_limit,
        args.sigma_time_limit,
        args.types,
        args.cities,
        args.can_have_unfamiliar_items,
        args.unfamiliar_items_rate,
        args.hold_type,
        args.hold_city,
    )
    
    json_out['games'] = games

    with open(args.file_name, "w") as json_file:
        json.dump(json_out, json_file, indent=4)

    print(f"Games JSON file '{args.file_name}' created successfully.")