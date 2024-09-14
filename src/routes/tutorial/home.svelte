<script>
    import { get } from 'svelte/store';
    import { game, orders, gameText, currLocation, orderList, ordersShown } from "$lib/tutorial/bundle.js";
    import Order from "./order.svelte";

    let waiting = false;
    let duration = 0;
    let travelingTo = ""

    function start() {
        const selOrders = get(orders)
        const curGame = get(game)
        const curLoc = get(currLocation)
        if (selOrders.length < 1) {
            alert("Please select 1 or 2 orders!")
            return;
        }
        if (selOrders.length > 1) {
            if (selOrders[0].store != selOrders[1].store || selOrders[0].city != selOrders[1].city) {
                alert("Cannot bundle different stores/cities!")
                return;
            }
            curGame.bundled = true;
        } else {
            curGame.bundled = false;
        }

        if (selOrders[0].city != curLoc) {
            travel(selOrders[0].city, true)
        } else {
            gameWindow()
        }
    }

    function travel(city, visitStore) {
        //find index of city
        duration = 5
        waiting = true;
        travelingTo = city;
        setTimeout(() => {
            waiting = false;
            currLocation.set(city)
            if (visitStore) {
                gameWindow()
            }
        }, duration * 1000)
    }

    function gameWindow() {
        //log first order
        $game.inStore = true;
        $game.inSelect= false;
    }
</script>

<style>

</style>

{#if waiting}
    <p>Traveling to {travelingTo}. Travel duration: {duration}</p>
{:else}
    <div class="home">
        {#each $orderList as order}
            <Order orderData={order} />
        {/each}
        <button id="startorder" on:click={start}>{$gameText.selector}</button>
    </div>
    <div>
        {#if $currLocation == "Los Angeles"}
            <button id="travel" on:click={() => travel("Irvine", false)}>Travel to Irvine</button>
        {:else}
        <button id="travel" on:click={() => travel("Los Angeles", false)}>Travel to Los Angeles</button>
        {/if}
    </div>
{/if}
