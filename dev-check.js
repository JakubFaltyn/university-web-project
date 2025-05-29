const http = require("http");

function checkServer(port, name) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
            console.log(`✅ ${name} server is running on port ${port} (status: ${res.statusCode})`);
            resolve(true);
        });

        req.on("error", (err) => {
            console.log(`❌ ${name} server is NOT running on port ${port} (${err.code})`);
            resolve(false);
        });

        req.setTimeout(5000, () => {
            console.log(`⏰ ${name} server timeout on port ${port}`);
            req.abort();
            resolve(false);
        });
    });
}

async function checkDevelopmentEnvironment() {
    console.log("🔍 Checking development environment...\n");

    const nextApp = await checkServer(3000, "Next.js");
    const authServer = await checkServer(3001, "OpenAuth");

    console.log("\n📊 Development Status:");
    console.log(`Next.js App: ${nextApp ? "✅ Running" : "❌ Not running"}`);
    console.log(`OpenAuth Server: ${authServer ? "✅ Running" : "❌ Not running"}`);

    if (nextApp && authServer) {
        console.log("\n🎉 All services are running! You can access:");
        console.log("🌐 Main App: http://localhost:3000");
        console.log("🔐 Auth Server: http://localhost:3001");
    } else {
        console.log('\n⚠️  Some services are not running. Run "pnpm dev" to start all services.');
    }
}

checkDevelopmentEnvironment();
