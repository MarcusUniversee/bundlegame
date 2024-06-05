<script>
	/* Archive ./card.svelte after full migration */
	import Card from './cardv2.svelte'
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { logHistory, jobs, game, generateDataV2 } from '$lib/stores.js';
  
	function switchToLeisure() {
		$game.inLeisure = true;
		// console.log(get(get(game).prevGames));
	}
	/* generate the data for the log history */
	generateDataV2();
	// generateData();

	// update job data, log history
	onMount(() => {
		console.log($jobs);
		const jobStrings = $jobs.map(
			(job) =>
				`i:(${job.index}) ${job.type} - ${job.city}: ${job.waitTime} waitTime, ${job.timeLimit} timeLimit`
			);
		const joblists = $jobs.map(
				(job) =>
				[job.index, job.waitTime, job.timeLimit]
			)
		logHistory("enter home screen", joblists, `Entered home screen, displayed jobs: ${JSON.stringify(jobStrings)}`);
	});
</script>

<div class="button-container">
	<button on:click={switchToLeisure}>Switch to Leisure</button>
</div>
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