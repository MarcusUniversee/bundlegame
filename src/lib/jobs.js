import default_job from "./scripts/game_modes/default.json" with { type: "json" };

/* Job number indicator */
let job_index = Array(default_job.length).fill(0);
const CURRENT_MODE = default_job;
const GAMES = default_job.map(obj => obj["games"]);

/* Queues N jobs */
export function queueNJobs(n) {
    const next_jobs = [];
    for (let i = 0; i < job_index.length;i++) {
        next_jobs.push(GAMES[i][job_index[i]++]);
    }
    return next_jobs;
}

/* Queues N Random jobs */
export function queueNRandomJobs(n) {
    const next_jobs = [];
    for (let i = 0; i < job_index.length;i++) {
        const g = GAMES[i]
        next_jobs.push(g[Math.floor(Math.random() * g.length)]);
    }
    return next_jobs;
}

/* Queues the next job */
export function queueNextJob(index) {
    const next_job = GAMES[index][job_index[index]++];
    console.log('queued job: ' + next_job['id'])
    return next_job;
}

/* Queues a random job */
export function queueRandomJob(index) {
    const g = GAMES[index]
    const next_job = g[Math.floor(Math.random() * g.length)]
    console.log('queued job: ' + next_job['id'])
    return next_job
}