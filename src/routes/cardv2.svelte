<script>
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { startGameV2, logHistory, currLocation, elapsed, generateSingleDataV2, jobs, eatsJobsCompleted, driverJobsCompleted, session_id, game } from '$lib/stores.js';
	
	// time duration of each task
	const SECONDS_PER_JOB_UBER = 2;
	const SECONDS_PER_JOB_UBEREats = 3;

	// Original ExpirationTime is 20
	export const expirationTime = 5;

	export let jobData;
	export let color;
	export let timeRemaining; // Default set to 1000 to not start job prematurely

	let countdown = jobData.trueWaitTime;

	let previousWaitTime = jobData.trueWaitTime; 
	
	$: if (jobData.trueWaitTime !== previousWaitTime && jobData.ready === false) {
		countdown = jobData.trueWaitTime; // reset the countdown to the new waitTime
		previousWaitTime = jobData.trueWaitTime; 
	}
	
	let curTime = null;
	let unsubscribeElapsed;
	

	onMount(() => {
		// Start the subscription to the elapsed store
		const urlParams = new URLSearchParams(window.location.search);
		const continousQueue = urlParams.has('continuousQueue');
		const inLeisure = $game.inLeisure;

		unsubscribeElapsed = elapsed.subscribe(async $elapsed => {
			if (jobData.trueWaitTime > 0 && (!inLeisure || continousQueue)) {
				countdown--;
			}

			if (jobData.ready) {
				timeRemaining = expirationTime - (get(elapsed) - curTime);
			}

			if (countdown == 0 && !jobData.ready) {
				/* Sets the job to ready once we reach the coundown */
				updateJobState(jobData.id, true, false);
				curTime = get(elapsed); // sets the time the card became available
				logHistory("job available", [jobData.index, `${jobData.job_type} - ${jobData.city}`], `i:(${jobData.index}) Job ${`${jobData.job_type} - ${jobData.city}`} now available`);
			} else if (jobData.ready && !jobData.expired && get(elapsed) - curTime >= expirationTime) {
				updateJobState(jobData.id, false, true);
				curTime = null;
				logHistory("job expire", [jobData.index, `${jobData.job_type} - ${jobData.city}`], `i:(${jobData.index}) Job ${`${jobData.job_type} - ${jobData.city}`} has expired`);
				try {
					const response = await fetch(`https://bobaapi.up.railway.app/api/sessions/${get(session_id)}`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							access_key,
							action: {
								game_id: jobData.id,
								action: 'unqueue',
								game_time: elapsed
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
		});
	});

	onDestroy(() => {
		unsubscribeElapsed();
	});

	/* Update the ready or expired state of job with id */
	function updateJobState(id, ready, expired) {
		jobs.update(allJobs => {
			const jobIndex = allJobs.findIndex(job => job.id === id);
			if (jobIndex !== -1) {
				allJobs[jobIndex] = { ...allJobs[jobIndex], ready, expired };
				if (expired) {
					/* Replaces job with new generated job */
					allJobs[jobIndex] = {
						...generateSingleDataV2(jobIndex), 
						ready: false, 
						expired: false};
					jobData = allJobs[jobIndex];
					countdown = allJobs[jobIndex].trueWaitTime;
				}
			}
			return allJobs;
		});
	}

	// regenerate new data for picked job
	function resetJob(id) {
		updateJobState(id, false, true);
	}

	async function start() {
		// console.log('DEBUG:', countdown, countdown <= 0);
		if (jobData.ready) {
			const access_key = '88d02f62-2963-4052-b218-6eada5fcd757'
			const dataframe_id = '6676312cb9b90e568ff9f130'
			try {
				const response = await fetch(`https://bobaapi.up.railway.app/api/sessions/${get(session_id)}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						access_key,
						action: {
							chosen: jobData,
							otherChoices: get(jobs),
							gameTime: $elapsed
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

			let hardLimit = jobData.trueTimeLimit * 2;

			if ($currLocation !== jobData.city) {
				currLocation.set('');
				/* Sets to city, moving to the other city takes 5 seconds */
				setTimeout(() => {
					currLocation.set(jobData.city);
				}, 5000);
				startGameV2(
					`${jobData.job_type} - ${jobData.city}`, 
					jobData.trueEarnings, 
					jobData.trueItemsCount, 
					jobData.trueTimeLimit, 
					hardLimit, 
					jobData.hasUnfamiliarItems, 
					eatsJobsCompleted, 
					driverJobsCompleted, 
					jobData.itemSequence,
				);
				resetJob(jobData.id)
			}
			startGameV2(
				`${jobData.job_type} - ${jobData.city}`, 
				jobData.trueEarnings, 
				jobData.trueItemsCount, 
				jobData.trueTimeLimit, 
				hardLimit, 
				jobData.hasUnfamiliarItems, 
				eatsJobsCompleted, 
				driverJobsCompleted, 
				jobData.itemSequence);
			resetJob(jobData.id)
			
		}
	}
</script>

<div class="card">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="card-content" class:ready={jobData.ready} style="background: {color};" on:click={start}>
		<h2>{`${jobData.job_type} - ${jobData.city}`}</h2>

		<i>
			<p>Avg Wait Time: {jobData.avgWait}</p>
			<p>Avg Earnings: ${jobData.avgEarnings}</p>
			<p>Avg Number of Items: {jobData.avgItemsCount}</p>
		</i>

		{#if !jobData.ready}
			<br />
			<p>
				<i>Not ready</i>
				<!-- {countdown} -->
			</p>
			<!-- <h4>{countdown}</h4> -->
		{:else}
			{#if jobData.type === 'UberEats'}
				<p>There are {jobData.trueItemsCount} items</p>
			{:else}
				<p>There are {jobData.trueItemsCount} blocks</p>
			{/if}
			{#if jobData.hasUnfamiliarItems}
				<p>Has Unfamiliar Items!</p>
			{/if}
			Ready!
			{#if timeRemaining && timeRemaining > 0}
				<p>{timeRemaining} seconds left to accept job!</p>
			{/if}
			<!-- Expire in {expirationTime}s -->
		{/if}
			
	</div>
</div>
