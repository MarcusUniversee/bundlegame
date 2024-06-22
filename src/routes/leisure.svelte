<script>
    import { onMount, onDestroy } from "svelte";
    import { get, writable } from 'svelte/store';
    import Popup from "./popup.svelte";
    import { game, 
            confirmedToStay, 
            leisurePay, 
            LeisureTime, 
            earned, 
            logHistory, 
            leisureStart,
            elapsed
         } from '$lib/stores.js';
        
    let showPopup = writable(false);
    let interval;
    let leisureinterval;
    
    // Initialize leisureStart and LeisureTime
    leisureStart.set(get(LeisureTime));
    // Debug
    $: if ($showPopup) {
        console.log('Popup should now be visible.');
    } else {
        console.log('Popup is inactivated')
    }
    
    function showThePopup() {
        showPopup.set(true);
    }

    function hidePopup() {
        showPopup.set(false);
        // Set confirmedToStay to false again so the popup will reappear
        confirmedToStay.set(false);
    }

    onMount(() => {
        setTimeout(showThePopup, 20000);
        // Show Popup every 20s
        interval = setInterval(showThePopup, 20000);

        // Increment leisure time 
        leisureinterval = setInterval(() => {
            LeisureTime.update(n => n + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(leisureinterval);
        };
    });

    // Choose to leave leisure, go to work
    async function switchToWork() {
        $game.inChoices = false;
        $game.inLeisure = false;
        confirmedToStay.set(false);
        const inLeisureTime = get(LeisureTime) - get(leisureStart);
        const earning = parseFloat(( inLeisureTime * leisurePay).toFixed(2));
        earned.update((n) => {
            const updatedValue = parseFloat((n + earning).toFixed(2));
            return updatedValue;
        });
        logHistory("switch to work", [inLeisureTime, earning], 'Confirm to leave leisure, stayed for ' + inLeisureTime + 's, earned $' + earning);

        const access_key = '88d02f62-2963-4052-b218-6eada5fcd757'
		const dataframe_id = '667631afb9b90e568ff9f138'
		try {
			const response = await fetch(`https://bobaapi.up.railway.app/api/sessions/${get(session_id)}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					access_key,
					action: {
						current_view: 'Leisure',
						next_view: 'Work',
						is_voluntary: true,
						game_time: $elapsed
					},
					dataframe_id,
				})
			});

			const responseJson = await response.json()
			console.log(responseJson);
			console.log(`Logged Action: ${JSON.stringify(responseJson)}`)
		} catch (err) {
			console.log(err);
		}
    }
    
</script>
  
<div class="container">
    {#if $showPopup}
        <Popup closePopup={hidePopup}/>
    {:else}
        <p>Enjoy your leisure time!</p>
        <p>You earn ${leisurePay.toFixed(2)} every second</p> 
    {/if}
    <button on:click={switchToWork}>Switch to Work</button>
</div>

  
<style>
    .container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center; 
    }
  
    p {
        margin: 0 0 10px 0;
        font-size: 16px;
        color: #4a4a4a;
    }
  
    button {
      padding: 10px 20px;
      font-size: 16px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
      z-index: 1000;
    }
</style>

  