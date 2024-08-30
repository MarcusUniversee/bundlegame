<script>
    import { orders, currLocation, gameText } from "$lib/bundle.js"
    export let orderData;
    let selected = false;


    function select() {
        if (!selected) {
            //selects it
            if ($orders.length >= 2) {
                return;
            }
            $orders.push(orderData)
            selected = true
        } else {
            for (let i=0; i<$orders.length; i++) {
                if ($orders[i].id == orderData.id) {
                    $orders.splice(i, 1)
                    break;
                }
            }
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
        console.log($orders)
    }
</script>

<style>
    .order {
        margin: 2px;
        display: flex;
    }

    .order-content {
        width: 300px;
        height: 180px;
        text-align: center;
        border-radius: 3px; /* Rounded corners */
    }
    .unselected {
        background-color: darkgray;
    }
    .selected {
        background-color: gray;
    }
    .header {
        margin-top: 0.5em;
        margin-bottom: 0em;
    }
    .innerText {
        margin-top: 0.2em;
        margin-bottom: 0em;
    }
</style>

<div class="order">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="order-content" class:selected={selected} class:unselected={!selected} on:click={select}>
        <p class="header">{orderData.store} for {orderData.name}</p>
        <div style="display: inline;">
            <div style="float:left">
                <p class="innerText">{orderData.earnings}</p>
                <p class="innerText">{orderData.city}</p>
            </div>
            <div style="float:right">
                <p class="innerText">
                {#each Object.keys(orderData.items) as item}
                    {orderData.items[item]} - {item}<br>
                {/each}
                </p>
            </div>
        </div>
    </div>
</div>