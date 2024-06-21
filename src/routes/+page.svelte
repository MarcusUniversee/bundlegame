<script>
	import '../app.css';
	import Home from './home.svelte';
	import Game from './game.svelte';
	import GameV2 from './gamev2.svelte'
	import Summary from './summary.svelte';
	import Final from './final.svelte';
	import Choices from './choice.svelte';
	import Leisure from './leisure.svelte';
	import {
		elapsed,
		game,
		earned,
		logHistory,
		resetTimer,
		currLocation,
		FullTimeLimit,
		LeisureTime,
		eatsJobsCompleted,
		driverJobsCompleted,
		normalized_driver_difficulty,
		normalized_ubereats_difficulty,
		setMode,
		mode,
		SAVED,
		RANDOM,
		setSessionId
	} from '$lib/stores.js';
	import {get} from 'svelte/store';

	$: inGame = $game.inGame;
	$: timeUp = $elapsed > FullTimeLimit;
	$: inSummary = $game.inSummary;
	$: inChoices = $game.inChoices
	$: inLeisure = $game.inLeisure;
	
	let started = false;
	let userName = '';
	let localMode = get(mode);

	async function initializeGame() {
		started = true;
		resetTimer();
		try {
			const response = await fetch('https://bobaapi.up.railway.app/api/games/66667c12a04e9d77a88e2581/sessions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					dataframe_ids: ['66667ce7a04e9d77a88e2589'],
					player: userName,
					access_key: '3866d256-1455-442a-a141-453def370653'
				})})
			const sessions = await response.json();
			const { _id } = sessions[0];
			console.log(sessions[0]);
			setSessionId(_id);
		} catch (err) {
			console.log(err);
		}

		logHistory("start game", userName, `${userName} started a game with ${FullTimeLimit} timeLimit`);
	}

	function goToWork() {
        $game.inChoices = false;
        $game.inLeisure = false;
	}

	function setLocalMode(choice) {
		localMode = choice;
	}
</script>

<!-- info shared on all pages -->
{#if !timeUp && started}
	<div class="hud">
		<h3 class:err={timeUp}>Time limit: {FullTimeLimit}</h3>
		<p><b>Time</b>: {$elapsed}s</p>
		<p><b>Total Jobs Completed</b>: {$eatsJobsCompleted + $driverJobsCompleted}</p>
		<p><b>Eats Jobs Completed</b>: {$eatsJobsCompleted}</p>
		<p><b>Driver Jobs Completed</b>: {$driverJobsCompleted}</p>
		<p><b>Leisure Time</b>: {$LeisureTime}s</p>
		<p><b>Earned</b>: ${$earned}</p>
		<p><b>Location</b>: {$currLocation}</p>
		<!-- TODO: Incentive Multiplier -->
		<!-- <p><b>Eats Difficulty Multiplier</b>: x{$normalized_ubereats_difficulty}</p>
		<p><b>Driver Difficulty Multiplier</b>: x{$normalized_driver_difficulty}</p> -->
		<p><b>Job Mode</b>: {get(mode).charAt(0).toUpperCase() + get(mode).slice(1)}</p>
		<p><i>Takes 5 seconds to go to {$currLocation === 'SF' ? 'Berkeley' : 'SF'}</i></p>
	</div>
{/if}

<!-- render different pages -->
{#if !started}
	<div class="page">
		<div class="game">
			<div class="synopsis">
				<h1>Welcome!</h1>
				<h2>Goal</h2>
				<p>
					Complete as many jobs as you can within the given time limit. Completing more jobs raises the difficulty of the 
					jobs you are shown, increasing the number of items per job.

					The two buttons indicates the sequence the jobs are shown. Saved jobs will always have the same next available job, 
					but random jobs will provide a game with a random job after completing the current job.
					
					<br>
					If you are tired of completing jobs, you have the option of switching to leisure mode. During leisure mode, you can 
					still earn money, but you must remain present or else you will be switched back to working mode.
					 
					<br>
					To start playing, enter your name.
				</p>
			</div>
			<!-- <div>
				<button on:click={() => { setMode(SAVED); setLocalMode(SAVED)}} disabled={localMode === SAVED}>Saved Jobs</button>
				<button on:click={() => { setMode(RANDOM); setLocalMode(RANDOM)}} disabled={localMode === RANDOM}>Random Jobs</button>
			</div> -->
			<p>Enter your name:</p>
			<input bind:value={userName} type="text" />
			<button on:click={() => { initializeGame(); goToWork(); }}>Start</button>
		</div>
	</div>
{:else if inChoices}
	<Choices />
{:else if inLeisure}
	<Leisure />
{:else if inGame && $currLocation !== ''}
	<GameV2 />
{:else if inSummary}
	<Summary />
{:else if timeUp}
	<Final />
{:else}
	<Home />
{/if}

{#if $currLocation === ''}
	<div class="traveling">Traveling ...</div>
{/if}

<!-- debug -->
<div>
	<!-- <i class="debug">history:</i>
	{JSON.stringify($history)} -->
	<!-- <p>uploaded: {$print}</p> -->
</div>


<style>
	.traveling {
		position: fixed;
		top: 0;
    	left: 0;
		height: 100vh;
		width: 100vw;
		z-index: 1000;
		text-align: center;
		font-size: 30px;
		/* z-index: 99999999999999999 !important; */
		background-color: rgba(128, 128, 128, 0.519);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.debug {
		margin-top: 100px;
	}
</style>
