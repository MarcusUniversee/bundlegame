import default_job from "./scripts/game_modes/default.json" with { type: "json" };

/* Job number indicator */
let job_number = 0;
const CURRENT_MODE = default_job;
const GAMES = CURRENT_MODE.games;

/* Queues N jobs */
export function queueNJobs(n) {
    const curr_job_number = job_number;
    const next_jobs = GAMES.slice(curr_job_number,curr_job_number + n);
    job_number = curr_job_number + n;
    return next_jobs
}

/* Queues N Random jobs */
export function queueNRandomJobs(n) {
    let next_jobs = [];
    for (let i = 0; i < n; i++) {
        next_jobs.push(queueRandomJob());
    }
    return next_jobs;
}

/* Queues the next job */
export function queueNextJob() {
    const next_job = GAMES[job_number++];
    console.log('queued job: ' + next_job['id'])
    return next_job;
}

/* Queues a random job */
export function queueRandomJob() {
    const next_job = GAMES[Math.floor(Math.random() * GAMES.length)];
    console.log('queued job: ' + next_job['id'])
    return next_job
}