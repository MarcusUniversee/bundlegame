<script>
	/* Archive ./card.svelte after full migration */
	import Card from './cardv2.svelte'
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { logHistory, jobs, game, generateDataV2, earned, elapsed, session_id } from '$lib/stores.js';
  
	async function switchToLeisure() {
		$game.inLeisure = true;
		// console.log(get(get(game).prevGames));

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
						current_view: 'Work',
						next_view: 'Leisure',
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
	/* generate the data for the log history */
	generateDataV2();
	// generateData();

	const urlParams = new URLSearchParams(window.location.search);
	const isWorkOnly = urlParams.has('workOnly');
	const continousQueue = urlParams.has('continuousQueue');
	// update job data, log history
	onMount(async () => {
		if (isWorkOnly) {
			// Increment leisure time 
			const waitingInterval = setInterval(() => {
				earned.update((n) => parseFloat((n + 0.01).toFixed(2)));
			}, 1000);
	
			return () => {
				clearInterval(waitingInterval);
			};
		}
	});

</script>


{#if !isWorkOnly}
	<div class="button-container">
		<button on:click={switchToLeisure}>Switch to Leisure</button>
	</div>
{/if}
<div class="choices">
	<!-- each job is a Card element in card.svelte -->

	<Card jobData={$jobs[3]} color="#ecb98d" />
	<Card jobData={$jobs[2]} color="#eea7cf" />
	<Card jobData={$jobs[1]} color="#96f0c8" />
	<Card jobData={$jobs[0]} color="#89bbed" />
</div>

<style>
.button-container {
	text-align: center;
	margin-top: 20px;
}

button {
	padding: 10px 20px;
	background-color: #007bff;
	color: #fff;
	border: none;
	border-radius: 5px;
	cursor: pointer;
	font-size: 16px;
}

button:hover {
	background-color: #0056b3;
}
</style>