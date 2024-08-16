<script>
    import Bundlegame from "./bundlegame.svelte";
    import Singlegame from "./singlegame.svelte";
    import { game, elapsed, resetTimer, earned, currLocation } from "$lib/bundle.js";
	import Home from "./home.svelte";

    $: inSelect = $game.inSelect;
	$: inStore = $game.inStore;
    $: bundled = $game.bundled;

    let started = false;
    function start() {
        resetTimer();
        $game.inSelect = true;
        started = true;
    }
</script>

{#if started}
    <p><b>Time</b>: {$elapsed}s</p>
    <p><b>Earned</b>: ${$earned}</p>
    <p><b>Location</b>: {$currLocation}</p>
{/if}
{#if !started}
    <button on:click={start}>Start</button>
{:else if inSelect}
    <Home />
{:else if inStore}
    {#if bundled}
        <Bundlegame />
    {:else}
        <Singlegame />
    {/if}
{/if}