<script>
	import { game, endGame, logHistory, seenWords, addToSeenWords, session_id, elapsed } from '$lib/stores.js';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	/* GAME STATE */
	let timePassed = 0.0;
	let stepsLeft = $game.numSteps;
	let timeLimit = $game.timeLimit;
	let job = $game.title;
	let hardLimit = $game.hardLimit;
	let hasUnfamiliarItems = $game.hasUnfamiliarItems;
	let wordBank = $game.currGameWords;
	let currentWord = wordBank[wordBank.length - stepsLeft];
	console.log(wordBank, currentWord, stepsLeft);
	let earned = 0;
	let penalty = 0;
	
	let mistakes = 0;

	/* User Input (reactive ui elem) */
	let userInput = '';
	let status = 'Type!';
	let displayStatus = 'Type!';

	function round(value, decimals) {
		return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
	}

	/* Start Timer */
	onMount(() => {
		logHistory(
			"start job", [job, stepsLeft, timeLimit, hardLimit], `Task ${job} was started with: ${stepsLeft} steps, ${timeLimit} timeLimit, ${hardLimit} hardLimit`
		);
		setInterval(() => {
			if (stepsLeft > 0) {
				timePassed++;
			}
		}, 1000);
	});

	async function checkGuess() {
		if (stepsLeft <= 0) return;
		const userAnswer = userInput.toLowerCase();

		if (userAnswer === currentWord) {
			logHistory("guess result", [stepsLeft, true, currentWord], `(${stepsLeft}) Correct Guess: ${currentWord}`);
			displayStatus = 'Correct!';
			userInput = '';
			stepsLeft--;
			console.log($seenWords);
			if (!$seenWords.has(currentWord)) {
				addToSeenWords(currentWord);
			}
			currentWord = wordBank[wordBank.length - stepsLeft];
		} else {
			logHistory("guess result", [stepsLeft, false, currentWord, userAnswer], `(${stepsLeft}) Incorrect Guess: ${currentWord}, mistyped ${userAnswer}`);
			displayStatus = 'Incorrect. Try again.';
			mistakes++;
		}
		const access_key = '88d02f62-2963-4052-b218-6eada5fcd757'
		const dataframe_id = '667638b1b9b90e568ff9f140'
		try {
			const response = await fetch(`https://bobaapi.up.railway.app/api/sessions/${get(session_id)}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					access_key,
					action: {
						correct_action: currentWord,
						user_action: userAnswer,
						game_id: $game.id,
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
		setTimeout(() => {
        	displayStatus = 'Type!';
    	}, 400);
	}

	// Detect keys pressed (record copy paste)
	function handleKeyUp(event) {
		if (event.key === 'Enter') {
			checkGuess();
		}
		if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
			logHistory("copy paste", currentWord, 'Paste action detected');
		}
	}

	function finish() {
		// const penalty = 0;
		penalty = timePassed > timeLimit ? Math.min(timePassed - timeLimit, $game.earnings) : 0;
		if (timePassed < hardLimit) {
			console.log("time pass" + timePassed)
			earned = $game.earnings - penalty;
		} else {
			earned = 0;
		}
		
		console.log(earned);
		logHistory(
			"finish job", 
			[mistakes, earned, timePassed], 
			`Ended with: ${mistakes} mistakes, 
			${earned} earned, 
			${timePassed} in game time passed`, 
			hasUnfamiliarItems ? 'game had unfamiliar items and normal items' : 'game had only familiar items',
			`Eats Jobs Completed ${$game.eatsJobsCompleted}`,
			`Driver Jobs Completed ${$game.driverJobsCompleted}`
		);

		const gameState = {};

		gameState.title = job;
		gameState.status = 'finished';
		gameState.mistakes = mistakes;
		gameState.earning = $game.earnings - penalty;
		gameState.time = timePassed;
		gameState.hardLimit = hardLimit;

		endGame(earned, gameState, $game.isUberEats);
	}

	// reactive element
	$: {
		status = displayStatus;

		if (stepsLeft <= 0) {
			finish();
		}

		if (timePassed >= hardLimit) {
			finish();
		}
	}
</script>

<div class="page">
	<div class="game">
		<h3>{job}</h3>
		<h3 class:err={timePassed > timeLimit}>
			Timer: {timeLimit - timePassed}
			<!-- (Debug time taken: {timePassed}) -->
		</h3>
		<p>Task Left: {stepsLeft}</p>
		<!-- show image corresponding to the current word -->
		<img id="input-img" src="./images/{currentWord}.jpg" alt="img" />
		<p hidden={$seenWords.has(currentWord)}>Hint: The Item is {currentWord}</p>
		<input bind:value={userInput} type="text" placeholder="Input" on:keydown={handleKeyUp} />
		<div class="status">{status}</div>
	</div>
</div>

<style>
	img {
		display: block;
		margin: auto;
		height: 250px;
	}
</style>
