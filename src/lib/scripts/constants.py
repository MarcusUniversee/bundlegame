# Default game parameters
UBER_EATS = 'UberEats'
UBER = 'Uber'

DEFAULT_GAME_COUNT = 100

DEFAULT_AVG_WAIT_TIME = 10
DEFAULT_SIGMA_WAIT_TIME = 7

DEFAULT_AVG_ITEMS = 15
DEFAULT_SIGMA_ITEMS = 5

DEFAULT_AVG_EARNINGS = 30
DEFAULT_SIGMA_EARNINGS = 10

DEFAULT_AVG_TIME_LIMIT = 60
DEFAULT_SIGMA_TIME_LIMIT = 20

DEFAULT_TYPES = ['UberEats', 'Uber']
DEFAULT_CITIES = ['SF', 'Berkeley']
DEFAULT_UNFAMILIAR_ITEMS_RATE = 0.3
DEFAULT_CAN_HAVE_UNFAMILIAR_ITEMS = True

# Minimum values so that when we sample we never get a negative value
MIN_WAIT_TIME = 0
MIN_EARNINGS = 5
MIN_ITEMS_COUNT = 5
MIN_TIME_LIMIT = 10

GLOBAL_SIGMA = 3

UNFAMILIAR_FOODS = ['dill', 'lychee', 'cabbage', 'paracress', 'muscadine']
FAMILIAR_FOODS = ['apple', 'coconut', 'banana', 'pineapple']

UNFAMILIAR_SIGNS = ['stop', 'yield', 'crossing']
FAMILIAR_SIGNS = ['red', 'green', 'yellow']