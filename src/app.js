const express = require("express");
const cors = require("cors");

const { connectRedis } = require("../redisQueue/redisClient");
const submitRoutes = require("./routes/submitRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api", submitRoutes);

const PORT = 5000;

const startServer = async () => {
    await connectRedis(); // ✅ FIX

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();