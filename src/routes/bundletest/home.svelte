<script>
    import { game, orders, gameText, currLocation } from "$lib/bundle.js";
    import { queueNRandomOrders } from "$lib/config.js";
    import Order from "./order.svelte";

    let waiting = false;
    let orderList = queueNRandomOrders(4)

    function start() {
        if ($orders.length < 1) {
            alert("Please select 1 or 2 orders!")
            return;
        }
        if ($orders.length > 1) {
            if ($orders[0].store != $orders[1].store || $orders[0].city != $orders[1].city) {
                alert("Cannot bundle different stores/cities!")
                return;
            }
            $game.bundled = true;
        } else {
            $game.bundled = false;
        }
        orderList = queueNRandomOrders(4)
        if ($orders[0].city != $currLocation) {
            waiting = true;
            setTimeout(() => {
                waiting = false;
                $game.inStore = true;
                $game.inSelect= false;
            }, 2000)
        } else {
            $game.inStore = true;
            $game.inSelect= false;
        }
        
    }
</script>

<style>

</style>

{#if waiting}
    <p>Traveling to {$orders[0].city}. Travel duration: 2 seconds hard coded will change</p>
{:else}
    <div class="home">
        {#each orderList as order}
            <Order orderData={order} />
        {/each}
        <button on:click={start}>{$gameText.selector}</button>
    </div>
    <div>
        <button on:click={travel1}>{$gameText.location1}</button>
        <button on:click={travel2}>{$gameText.location2}</button>
    </div>
{/if}
