<!-- Leisure popup notice page -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { get } from 'svelte/store';
    import {
		game,
		earned,
		logHistory,
        LeisureTime,
        leisurePay,
        confirmedToStay,
        leisureStart,
        elapsed
	} from '$lib/stores.js';

    let timer;
    let earning;
    export let closePopup; 

    // Check user confirm to stay or leave leisure or no response
    const confirmStay = () => {
        confirmedToStay.set(true);
        clearTimeout(timer);
        closePopup();
        logHistory("confirm stay in leisure", null, 'Confirm to stay in leisure');
    };
  
    const cancelStay = async () => {
        $game.inChoices = true;
        confirmedToStay.set(false);
        const inLeisureTime = get(LeisureTime) - get(leisureStart);
        earning = parseFloat((inLeisureTime * leisurePay).toFixed(2));
        earned.update((n) => {
            const updatedValue = parseFloat((n + earning).toFixed(2));
            return updatedValue;
        });
        clearInterval(timer);
        logHistory("confirm leave leisure", [inLeisureTime, earning], 'Confirm to leave leisure, stayed for ' + inLeisureTime + 's, earned $' + earning);
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
    };

    const noResponse = async () => {
        $game.inChoices = true;
        confirmedToStay.set(false);
        const inLeisureTime = get(LeisureTime) - get(leisureStart);
        earning = parseFloat((inLeisureTime * leisurePay).toFixed(2));
        earned.update((n) => {
            const updatedValue = parseFloat((n + earning).toFixed(2));
            return updatedValue;
        });
        logHistory("didn't choose", [inLeisureTime, earning], 'Did not choose in 5s, forced to leave leisure, stayed for ' + inLeisureTime + 's, earned $' + earning);
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
						is_voluntary: false,
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
    };

    onMount(() => {
        timer = setTimeout(noResponse, 5000); // set a timer to trigger noResponse after 5 seconds
    });
    
</script>
  

 <div>
    <p>Are you still there? Click YES within 5 seconds to stay in leisure.</p>
    <button on:click={confirmStay}>YES</button>
    <button on:click={cancelStay}>NO</button>
</div>


<style>
    div {
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f8d7da;
      padding: 20px;
      width: 300px;
    }
  
    p {
      font-size: 16px;
      color: #721c24;
      margin-bottom: 15px;
      text-align: center;
    }
  
    button {
      padding: 10px;
      font-size: 16px;
      margin-right: 10px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  
</style>
  