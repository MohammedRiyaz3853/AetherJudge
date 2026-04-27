const { getJob } = require("./queueService");
const { connectRedis } = require("./redisClient");
const pool = require("../src/db"); // ✅ DB connection
const { submitToJudge0, getResult } = require("./judge0Service");
async function processJob(job) {
    const submissionId = job.id;

    console.log("🚀 Processing job:", submissionId);

    try {
        // ✅ 1. mark processing
        await pool.query(
            "UPDATE submissions SET status=$1 WHERE id=$2",
            ["processing", submissionId]
        );

        console.log("🟡 Status → processing");

        // ✅ 2. send to Judge0
        const token = await submitToJudge0(job.code, job.language_id);
        console.log("🔑 Token:", token);

        // ✅ 3. get result
        const result = await getResult(token);
        console.log("📦 Result received");

        const output = result.stdout || result.stderr || "No output";

        // ✅ 4. store result in DB
        await pool.query(
            "UPDATE submissions SET status=$1, result=$2, judge0_token=$3 WHERE id=$4",
            ["completed", output, token, submissionId]
        );

        console.log("✅ Job completed:", submissionId);

    } catch (err) {
        console.error("❌ Worker ERROR:", err.response?.data || err.message);

        await pool.query(
            "UPDATE submissions SET status=$1 WHERE id=$2",
            ["failed", submissionId]
        );
    }
}
async function startWorker() {
    try {
        await connectRedis();

        console.log("👷 Worker started. PID:", process.pid);

        while (true) {
            try {
                const job = await getJob();

                if (!job) {
                    console.log("⏳ Waiting for jobs...");
                    await new Promise(res => setTimeout(res, 2000));
                    continue;
                }

                console.log("📥 Job received:", job.id);

                await processJob(job);

            } catch (err) {
                console.error("❌ WORKER LOOP ERROR:", err.message);
            }
        }

    } catch (err) {
        console.error("❌ FAILED TO START WORKER:", err.message);
    }
}

startWorker();