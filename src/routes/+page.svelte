<script>
    import Bundlegame from "./bundlegame.svelte";
    import { game, elapsed, resetTimer, earned, currLocation, id, logAction, GameOver, authUser, orderList, ordersShown } from "$lib/bundle.js";
    import { createUser } from "$lib/firebaseDB.js";
	import Home from "./home.svelte";
	import { onMount } from "svelte";
    import { queueNRandomOrders, queueNFixedOrders, getDistances } from "$lib/config.js";

    $: inSelect = $game.inSelect;
	$: inStore = $game.inStore;
    $: bundled = $game.bundled;
    let userInput = '';
    let userPass = '';

    let started = false;
    async function start() {
        //const auth = await authUser(userInput, userPass)
        //if (auth === 1) {
        resetTimer();
        createUser(userInput)
        $game.inSelect = true;
        $id = userInput
        started = true;
        $orderList = queueNFixedOrders(ordersShown)
        //} else {
            //alert("id and token do not match")
        //}
        
    }

    function handleClick(event) {
        if (event.target.id === 'start' || event.target.id === 'addtobag') {
            return;
        }
        if (event.target.tagName == 'BUTTON') {
            let action = {
                buttonID: event.target.id,
                buttonContent: event.target.textContent.trim()
            }
            logAction(action)
        }
    }

    onMount(() => {
        window.addEventListener('click', handleClick)
        return () => {
            console.log("listener removed")
            window.removeEventListener('click', handleButtonClick);
        };
    })
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
        <p>input your id</p>
        <input type="text" bind:value={userInput} placeholder="Enter" />
        <p>input your token (include dashes)</p>
        <input type="password" bind:value={userPass} placeholder="Enter" />
        <button id="start" on:click={start}>Start</button>
    {:else if inSelect}
        <Home />
    {:else if inStore}
        <Bundlegame />
    {/if}
{/if}