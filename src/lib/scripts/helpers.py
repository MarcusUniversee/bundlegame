import random

def sample_from_lists(list1, list2, x):
    """
    Sample from list1 with standard probablity x, otherwise sample from list2
    """
    if random.random() < x:
        return random.choice(list1)
    else:
        return random.choice(list2)