<script>
    import { get } from 'svelte/store';
    import { onMount, onDestroy } from 'svelte';
    import { game, orders, finishedOrders, failedOrders, earned, currLocation, elapsed, completeOrder, logAction } from "$lib/bundle.js"
    import { storeConfig } from "$lib/config.js";
    let config = storeConfig($orders[0].store)

    let GameState = 0;
    let curLocation = [0, 0];
    let bag1Input = "";
    let bag2Input = "";
    let wordInput = "";
    let bag1 = {}
    let bag2 = {}
    let dist = 0;
    let correct = false;
    let startTimer = $elapsed;
    let intervalId;
    let startEarnings;
    let totalEarnings;
    let curTip = 0;
    $: endTimer = $elapsed - startTimer;

    function updateTip() {
        let tipIndex = Math.floor(endTimer / config["tipinterval"])
        let percentIncrease = tipIndex < config["tip"].length ? (1 + (config["tip"][tipIndex]/100)) : (config["tip"][config["tip"].length - 1]/100)
        curTip = Math.round(percentIncrease * 100 - 100);
        totalEarnings = Math.round(startEarnings*percentIncrease*100)/100
    }

    onMount(() => {
        const selOrders = get(orders)
        if ($game.bundled) {
            startEarnings = selOrders[0].earnings + selOrders[1].earnings
        } else {
            startEarnings = selOrders[0].earnings
        }
        totalEarnings = startEarnings
        config = storeConfig($orders[0].store)
        if ($game.phase == 2) {
            intervalId = setInterval(updateTip, 1000); // Run updateTimer every 1000ms (1 second)
        }
        
    });

    onDestroy(() => {
        if ($game.phase == 2) {
            clearInterval(intervalId);
        }
    });

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
        }, dist*config["cellDistance"])
    }

    function addBag() {
        const selOrders = get(orders)
        let item = config["locations"][curLocation[0]][curLocation[1]].toLowerCase()
        let bag1InputInt;
        let bag2InputInt;
        let action = {
            buttonID: "addtobag",
            buttonContent: "Add to bag",
            bagInput1: bag1Input,
            bagInput2: bag2Input,
            itemInput: wordInput,
            bag1_: bag1,
            bag2_: bag2,
            order1: selOrders[0]
        }
        if (!$game.bundled) {
            bag2Input = "0";
        } else {
            action.order2 = selOrders[1]
        }
        
        
        if (item == "" || item == "Entrance") {
            return;
        }
        try {
            bag1InputInt = parseInt(bag1Input)
            bag2InputInt = parseInt(bag2Input)
        } catch {
            alert("Error: Quantity inputs must be numbers")
            action.mistake = "numbertypo"
            bag1Input = "";
            bag2Input = "";
            wordInput = "";
            logAction(action)
            return;
        }
        if (isNaN(bag1InputInt) || isNaN(bag2InputInt)) {
            alert("Error: Quantity inputs must be numbers")
            action.mistake = "numberempty"
            bag1Input = "";
            bag2Input = "";
            wordInput = "";
            logAction(action)
            return;
        }
        if (wordInput.toLowerCase() != item.toLowerCase()) {
            alert("Incorrect! You must type the name of the item")
            action.mistake = "itemtypo"
            bag1Input = "";
            bag2Input = "";
            wordInput = "";
            logAction(action)
            return;
        }
        if (Object.keys(bag1).includes(item)) {
            bag1[item] += bag1InputInt
            bag2[item] += bag2InputInt
        } else {
            bag1[item] = bag1InputInt
            bag2[item] = bag2InputInt
        }
        if (bag1[item] <= 0) {
            delete bag1[item];
        }
        if (bag2[item] <= 0) {
            delete bag2[item];
        }
        bag1Input = "";
        bag2Input = "";
        wordInput = "";
        logAction(action)
    }

    function start() {
        const selOrders = get(orders)
        startTimer = $elapsed;
        config = storeConfig(selOrders[0].store)
        GameState = 1;
    }
    function exit() {
        GameState = 0;
        $game.inSelect = true;
        $game.inStore = false;
    }

    function checkoutSingle() {
        //verify if it is correct
        const selOrders = get(orders)
        let c1 = true;
        Object.keys(bag1).forEach((key) => {
            console.log(selOrders[0].items[key])
            if(selOrders[0].items[key] != bag1[key]) {
                c1 = false;
            }
        })
        if (Object.keys(bag1).length != Object.keys(selOrders[0].items).length) {
            c1 = false;
        }
        correct = c1;
        bag1 = {}
        if (correct) {
            $earned += totalEarnings;
            completeOrder(selOrders[0].id)
            $finishedOrders.push(selOrders[0]);
            $orders.splice(0, 1)
            GameState = 3;

        } else {
            GameState = 4;
        }
    }

    function checkoutBundle() {
        const selOrders = get(orders)
        //verify if it is correct
        let c1 = true;
        let c2 = true;
        //check bag1 -> order1, bag2 -> order2
        Object.keys(bag1).forEach((key) => {
            if(selOrders[0].items[key] != bag1[key]) {
                c1 = false;
            }
        })
        if (Object.keys(bag1).length != Object.keys(selOrders[0].items).length) {
            c1 = false;
        }
        Object.keys(bag2).forEach((key) => {
            if(selOrders[1].items[key] != bag2[key]) {
                c1 = false;
            }
        })
        if (Object.keys(bag2).length != Object.keys(selOrders[1].items).length) {
            c1 = false;
        }

        //check bag1 -> order1, bag2 -> order2
        Object.keys(bag1).forEach((key) => {
            if(selOrders[1].items[key] != bag1[key]) {
                c2 = false;
            }
        })
        if (Object.keys(bag1).length != Object.keys(selOrders[1].items).length) {
            c2 = false;
        }
        Object.keys(bag2).forEach((key) => {
            if(selOrders[0].items[key] != bag2[key]) {
                c2 = false;
            }
        })
        if (Object.keys(bag2).length != Object.keys(selOrders[0].items).length) {
            c2 = false;
        }
        correct = c1 || c2;
        console.log(c1)
        console.log(c2)
        bag1 = {}
        bag2 = {}
        if (correct) {
            $earned += totalEarnings;
            completeOrder(selOrders[0].id)
            completeOrder(selOrders[1].id)
            $finishedOrders.push(selOrders[0]);
            $finishedOrders.push(selOrders[1]);
            $orders.splice(0, 2)
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
      background-color: white;
      border: 1px solid #ccc;
      padding: 20px;
      cursor: pointer;
    }
    .inputbag {
        width: 10px;
    }
    .order {
        padding-right: 1em;
    }
    .selected {
        background-color: aqua;
    }
  </style>

<div class="bundlegame">
    <h5>{$orders[0].store}</h5>
    <div style="display: table;">
        {#if $game.phase == 2}
        <div style="display: table-row">Total Earnings: ${totalEarnings} (${startEarnings} + {curTip}% tip)</div>
        {:else}
        <div style="display: table-row">Total Earnings: ${totalEarnings}</div>
        {/if}
        <div style="display: table-row">
            {#each $orders as order}
                <div class="order" style="display: table-cell;">
                    <p>
                        Order for {order.name}
                        <br>
                        Earnings: {order.earnings}
                    </p>
                    <ul>
                        {#each Object.keys(order.items) as item}
                            <li>{order.items[item]} - {item}</li>
                        {/each}
                    </ul>
                </div>
            {/each}
        </div>
        {#if GameState == 1 || GameState == 2}
            <p>Time spent: {endTimer}</p>
        {/if}
    </div>
    {#if GameState == 0}
        <!-- shop/browse -->
        {#if $game.bundled}
            <button id="startbundle" on:click={start}>Start</button>
        {:else}
            <button id="startsingle" on:click={start}>Start</button>
        {/if}
        
    {:else if GameState == 1}
        <h3>{config["locations"][curLocation[0]][curLocation[1]]}</h3>
        <div style="display: inline-block;">
            <div class="inputbags">
                <input class="inputword" bind:value={wordInput}>
                <input class="inputbag" bind:value={bag1Input}>
                {#if $game.bundled}
                    <input class="inputbag" bind:value={bag2Input}>
                {/if}
                <button id="addtobag" on:click={addBag}>Add to bag</button>
            </div>
            <div class="grid">
                {#each config["locations"] as row, rowIndex}
                    {#each row as cell, colIndex}
                        <button id="moveinstore" class="cell" class:selected={(rowIndex == curLocation[0] && colIndex == curLocation[1])} on:click={() => handleCell(cell, rowIndex, colIndex)}>
                            {cell}
                        </button>
                    {/each}
                {/each}
            </div>
        </div>
        {#if $game.bundled}
            <button id="checkout" on:click={checkoutBundle}>Checkout and Exit</button>
        {:else}
            <button id="checkout" on:click={checkoutSingle}>Checkout and Exit</button>
        {/if}
    {:else if GameState == 2}
    <h3>Walking to {config["locations"][curLocation[0]][curLocation[1]]}</h3>
    <h5>{dist*config["cellDistance"]/1000} seconds</h5>
    {:else if GameState == 3}
        <p>Correct!</p>
        <button id="ordersuccess" on:click={exit}>Go Back</button>
    {:else}
        <p>Incorrect</p>
        <button id="orderretry" on:click={start}>Try Again</button>
    {/if}
    <div style="display: inline;">
        <div>
            {#if $game.bundled}
                <h5>Bag1</h5>
            {:else}
                <h5>Bag</h5>
            {/if}
            <ul>
                {#each Object.keys(bag1) as key}
                    <li>{key}: {bag1[key]}</li>
                {/each}
            </ul>
        </div>
        {#if $game.bundled}
            <div>
                <h5>Bag2</h5>
                <ul>
                    {#each Object.keys(bag2) as key}
                        <li>{key}: {bag2[key]}</li>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>
</div>