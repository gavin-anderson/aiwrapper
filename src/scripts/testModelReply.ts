import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { modelReplyService } from "../services/modelReplyService.js";

async function main() {
    const rl = readline.createInterface({ input, output });

    const from = await rl.question("From (optional): ");
    const msg = await rl.question("Message: ");

    const reply = await modelReplyService(msg, from || undefined);
    console.log("\n--- Reply ---");
    console.log(reply);

    rl.close();
}

main().catch((err) => {
    console.error("Test runner failed:", err);
    process.exit(1);
});
