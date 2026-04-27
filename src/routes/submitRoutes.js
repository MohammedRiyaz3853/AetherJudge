const express = require("express");
const router = express.Router();

const { addJob } = require("../../redisQueue/queueService");
const pool = require("../db"); // ✅ ADD THIS

router.post("/submit", async (req, res) => {
    try {
        const { code, language, problemId = 1, userId = 1 } = req.body;

        const languageMap = {
            python: 71,
            cpp: 54,
            java: 62
        };

        // ✅ VALIDATION
        if (!code || code.trim() === "") {
            return res.status(400).json({ error: "Code is required" });
        }

        if (!language || !languageMap[language]) {
            return res.status(400).json({ error: "Invalid language" });
        }

        // 🔥 1. STORE IN DB FIRST
        const dbResult = await pool.query(
            `INSERT INTO submissions (user_id, problem_id, code, language, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [userId, problemId, code, language, "pending"]
        );

        const submissionId = dbResult.rows[0].id;

        // 🔥 2. PUSH TO REDIS
        const job = {
            id: submissionId, // ❗ NOT Date.now anymore
            code,
            language_id: languageMap[language]
        };

        await addJob(job);

        console.log("✅ Job stored + queued:", submissionId);

        res.json({
            message: "Job queued",
            submissionId
        });

    } catch (err) {
        console.error("❌ SUBMIT ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;