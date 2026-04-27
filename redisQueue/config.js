module.exports = {
    // For Docker: use "redis://redis:6379@default:judge0_secure_redis_password_2026"
    // For Local: use "redis://127.0.0.1:6379"
    REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    QUEUE_NAME: "code_submission_queue",

    // Judge0
    JUDGE0_URL: "http://localhost:2358",

    // Scaling
    MIN_WORKERS: 2,
    MAX_WORKERS: 10
};