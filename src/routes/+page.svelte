<script>
    import Bundlegame from "./bundlegame.svelte";
    import { game, elapsed, resetTimer, earned, currLocation, id, logAction, GameOver, authUser, orderList, ordersShown, startTimer, finishedOrders } from "$lib/bundle.js";
    import { createUser, generateCompleteId } from "$lib/firebaseDB.js";
	import Home from "./home.svelte";
	import { onMount } from "svelte";
    import { queueNRandomOrders, queueNFixedOrders, getDistances } from "$lib/config.js";

    $: inSelect = $game.inSelect;
	$: inStore = $game.inStore;
    $: bundled = $game.bundled;
    let userInput = '';
    let userPass = '';

    let started = false;
    let completed = ""
    async function start() {
        const auth = await authUser(userInput, userPass)
        if (auth === 1) {
            startTimer();
            resetTimer();
            createUser(userInput)
            $game.inSelect = true;
            $id = userInput
            started = true;
            $orderList = queueNFixedOrders(ordersShown)
            completed = generateCompleteId(userInput)
        } else {
            alert("id and token do not match")
        }
        
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
        } else if (event.target.classList.contains("order-content")) {
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
            window.removeEventListener('click', handleClick);
        };
    })
</script>
{#if $GameOver}
    <h3>Game Over!</h3>
    <h4>Your Stats:</h4>
    <ul>
        <li>Earnings: {$earned}</li>
        <li>Finished Orders: {$finishedOrders.length}</li>
    </ul>
    <p>Please copy the following code back into Qualtrics survey: <b>{completed}</b></p>

    <h5>You may close this page once you have succesfully continued to the next step in the survey</h5>
{:else}
    <h4>Please do not refresh or close the page!</h4>
    {#if started}
        {#if $elapsed}
        <p><b>Time</b>: {$elapsed}s</p>
        {:else}
        <p><b>Time</b>: 0s</p>
        {/if}
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