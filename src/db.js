const { Pool } = require("pg");

const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "aetherjudge",
  password: "admin123",
  port: 5433,
});

module.exports = pool;