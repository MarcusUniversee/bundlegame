<script>
    import { game, orders, finishedOrders, failedOrders, earned, currLocation } from "$lib/bundle.js"
    import { storeConfig } from "$lib/config.js";
    $: config = storeConfig($currLocation)

    let GameState = 0;
    let curLocation = [0, 0];
    let bag1Input = "";
    let wordInput = "";
    let bag1 = {}
    let dist = 0;
    let correct = false;

    function handleCell(value, row, col) {
        if (value == "") {
            return;
        }
        dist = Math.abs(row - curLocation[0]) + Math.abs(col - curLocation[1]);
        curLocation[0] = row;
        curLocation[1] = col;
        GameState = 2;
        setTimeout(() => {
            GameState = 1;
        }, dist*config.cellDistance)
    }

    function addBag() {
        let item = config.locations[curLocation[0]][curLocation[1]]
        let bag1InputInt;
        if (item == "" || item == "Entrance") {
            return;
        }
        try {
            bag1InputInt = parseInt(bag1Input)
        } catch {
            alert("Error: Quantity inputs must be numbers")
            bag1Input = "";
            wordInput = "";
            return;
        }
        if (wordInput.toLowerCase() != item.toLowerCase()) {
            alert("Incorrect! You must type the name of the item")
            bag1Input = "";
            wordInput = "";
            return;
        }
        if (Object.keys(bag1).includes(item)) {
            bag1[item] += bag1InputInt
        } else {
            bag1[item] = bag1InputInt
        }
        if (bag1[item] <= 0) {
            delete bag1[item];
        }
        bag1Input = "";
        wordInput = "";
    }

    function start() {
        GameState = 1;
    }
    function exit() {
        GameState = 0;
        $game.inSelect = true;
        $game.inStore = false;
    }

    function checkout() {
        //verify if it is correct
        let c1 = true;
        Object.keys(bag1).forEach((key) => {
            if($orders[0].items[key] != bag1[key]) {
                c1 = false;
            }
        })
        if (Object.keys(bag1).length != Object.keys($orders[0].items).length) {
            c1 = false;
        }
        correct = c1;
        bag1 = {}
        if (correct) {
            $earned += $orders[0].earnings;
            $finishedOrders.push($orders[0]);
            $orders.splice(0, 1)
            GameState = 3;
        } else {
            GameState = 4;
        }
    }

</script>

<style>
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .cell {
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #ccc;
      padding: 20px;
      cursor: pointer;
    }
    .inputbag {
        width: 10px;
    }
  </style>

<div class="bundlegame">
    <div style="display: table;">
        <div style="display: table-row">
            {#each $orders as order}
                <div style="display: table-cell;">
                    <ul>
                        {#each Object.keys(order.items) as item}
                            <li>{order.items[item]} - {item}</li>
                        {/each}
                    </ul>
                </div>
            {/each}
        </div>
    </div>
    {#if GameState == 0}
        <!-- shop/browse -->
        <button id="start" on:click={start}>Start</button>
    {:else if GameState == 1}
        <h3>{config.locations[curLocation[0]][curLocation[1]]}</h3>
        <div style="display: inline-block;">
            <div class="inputbags">
                <input class="inputword" bind:value={wordInput}>
                <input class="inputbag" bind:value={bag1Input}>
                <button on:click={addBag}>Add to bag</button>
            </div>
            <div class="grid">
                {#each config.locations as row, rowIndex}
                    {#each row as cell, colIndex}
                        <button class="cell" on:click={() => handleCell(cell, rowIndex, colIndex)}>
                            {cell}
                        </button>
                    {/each}
                {/each}
            </div>
        </div>
        <button on:click={checkout}>Checkout and Exit</button>
    {:else if GameState == 2}
    <h3>Walking to {config.locations[curLocation[0]][curLocation[1]]}</h3>
    <h5>{dist*config.cellDistance/1000} seconds</h5>
    {:else if GameState == 3}
        <p>Correct!</p>
        <button id="exit" on:click={exit}>Go Back</button>
    {:else}
        <p>Incorrect</p>
        <button id="start" on:click={start}>Try Again</button>
    {/if}
    <div style="display: inline;">
        <div>
            <h5>Bag1</h5>
            <ul>
                {#each Object.keys(bag1) as key}
                    <li>{key}: {bag1[key]}</li>
                {/each}
            </ul>
        </div>
    </div>
</div>