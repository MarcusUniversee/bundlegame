<script>
    import { orders, currLocation, gameText } from "$lib/bundle.js"
    export let orderData;
    let selected = false;
    let index = 0;


    function select() {
        if (!selected) {
            //selects it
            if ($orders.length >= 2) {
                return;
            }
            index = $orders.length
            $orders.push(orderData)
            selected = true
        } else {
            $orders.splice(index, 1)
            selected = false
        }
        //change text
        if ($orders.length > 0) {
            if ($orders[0].city == $currLocation) {
                $gameText.selector = "Go to store"
            } else {
                $gameText.selector = "Travel to " + $orders[0].city + ". Then go to store"
            }
        } else {
            $gameText.selector = "Select a store"
        }
    }
</script>

<style>
    .order {
        margin: 2px;
        display: flex;
    }

    .order-content {
        width: 300px;
        height: 150px;
        text-align: center;
        border-radius: 3px; /* Rounded corners */
    }
    .unselected {
        background-color: darkgray;
    }
    .selected {
        background-color: gray;
    }
</style>

<div class="order">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="order-content" class:selected={selected} class:unselected={!selected} on:click={select}>
        <p>{orderData.store} for {orderData.name}</p>
        <div style="display: inline;">
            <div style="float:left">
                <p>{orderData.earnings}</p>
                <p>{orderData.city}</p>
            </div>
            <div style="float:right">
                {#each Object.keys(orderData.items) as item}
                    <p>{orderData.items[item]} - {item}</p>
                {/each}
            </div>
        </div>
    </div>
</div>