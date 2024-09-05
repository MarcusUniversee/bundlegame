<script>
    import { get } from 'svelte/store';
    import { game, orders, gameText, currLocation, logOrder, orderList, ordersShown } from "$lib/bundle.js";
    import { queueNRandomOrders, queueNFixedOrders, getDistances } from "$lib/config.js";
    import Order from "./order.svelte";
    import { onMount } from "svelte";

    let waiting = false;
    let distances = getDistances($currLocation)
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

        const selOrderIds = selOrders.map(order => order["id"])
        let temp = $orderList.filter(order => !selOrderIds.includes(order["id"]));
        temp = temp.map(order => {
            return { ...order, "expire": order["expire"] - 1 };
        });
        temp = temp.filter(order => order.expire > 0);
        console.log(temp)
        $orderList = [...temp, ...queueNFixedOrders(ordersShown-temp.length)]

        if (selOrders[0].city != curLoc) {
            travel(selOrders[0].city, true)
        } else {
            gameWindow()
        }
    }

    function travel(city, visitStore) {
        //find index of city
        let index = distances["destinations"].indexOf(city)
        if (index == -1) {
            return;
        }
        duration = distances["distances"][index]
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
        const selOrders = get(orders)
        logOrder(selOrders[0])
        if (get(game).bundled) {
            //log second order
            logOrder(selOrders[1])
        }
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
        {#each distances["destinations"] as dest}
            <button id="travel" on:click={() => travel(dest, false)}>Travel to {dest}</button>
        {/each}
    </div>
{/if}
