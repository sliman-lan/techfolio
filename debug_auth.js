const http = require("http");

function post(path, data) {
    return new Promise((resolve, reject) => {
        const d = JSON.stringify(data);
        const options = {
            hostname: "localhost",
            port: 5000,
            path,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(d),
            },
        };

        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", (c) => (body += c));
            res.on("end", () => resolve({ statusCode: res.statusCode, body }));
        });

        req.on("error", (e) => reject(e));
        req.write(d);
        req.end();
    });
}

(async () => {
    try {
        console.log("Registering test user...");
        const reg = await post("/api/auth/register", {
            name: "DebugUser",
            email: "debuguser@example.com",
            password: "password123",
        });
        console.log("Register response:", reg.statusCode);
        console.log(reg.body);

        console.log("\nLogging in...");
        const login = await post("/api/auth/login", {
            email: "debuguser@example.com",
            password: "password123",
        });
        console.log("Login response:", login.statusCode);
        console.log(login.body);
    } catch (e) {
        console.error("Error:", e.message);
    }
})();
