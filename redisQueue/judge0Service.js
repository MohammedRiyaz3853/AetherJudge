const axios = require("axios");

const JUDGE0_URL = "http://localhost:2358";

async function submitToJudge0(code, language_id) {
    const response = await axios.post(
        `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
        {
            source_code: code,
            language_id: language_id,
            stdin: ""
        }
    );

    return response.data.token;
}

async function getResult(token) {
    while (true) {
        const res = await axios.get(
            `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`
        );

        if (res.data.status.id <= 2) {
            await new Promise(res => setTimeout(res, 1000));
            continue;
        }

        return res.data;
    }
}

module.exports = { submitToJudge0, getResult };