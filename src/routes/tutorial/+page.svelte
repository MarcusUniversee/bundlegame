<script>
    import Bundlegame from "./bundlegame.svelte";
    import { game, elapsed, resetTimer, earned, currLocation, id, GameOver, orderList, ordersShown } from "$lib/tutorial/bundle.js";
	import Home from "./home.svelte";
	import { onMount } from "svelte";

    $: inSelect = $game.inSelect;
	$: inStore = $game.inStore;
    $: bundled = $game.bundled;

    let started = false;
    async function start() {
        resetTimer();
        $game.inSelect = true;
        started = true;
        $orderList = [
            {
                "name": "Alice",
                "id": "tutorialorder1",
                "store": "Safeway",
                "earnings": 2,
                "city": "Los Angeles",
                "amount": 2,
                "expire": 3,
                "items": {
                    "apple": 1,
                    "cherry": 1
                }
            },
            {
                "name": "Bob",
                "id": "tutorialorder2",
                "store": "Safeway",
                "earnings": 3,
                "city": "Los Angeles",
                "amount": 3,
                "expire": 3,
                "items": {
                    "apple": 2,
                    "grape": 1
                }
            },
            {
                "name": "Charlie",
                "id": "tutorialorder3",
                "store": "Whole Foods",
                "earnings": 5,
                "city": "Irvine",
                "amount": 6,
                "expire": 3,
                "items": {
                    "apple": 2,
                    "banana": 2,
                    "pear": 2
                }
            }
        ]
        
    }

</script>
{#if $GameOver}
    <h3>Game Over! You may close this window</h3>
{:else}
    {#if started}
        <p><b>Time</b>: {$elapsed}s</p>
        <p><b>Earned</b>: ${$earned}</p>
        <p><b>Location</b>: {$currLocation}</p>
    {/if}
    {#if !started}
        <button id="start" on:click={start}>Start</button>
    {:else if inSelect}
        <Home />
    {:else if inStore}
        <Bundlegame />
    {/if}
{/if}