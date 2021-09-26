import express from "express";
import { Blockchain } from "../blockchain";
import { Block } from "../blockchain/block";
import { PubSub } from "./pubsub";
import got from "got";

const app = express();
const blockchain = new Blockchain();
const pubSub = new PubSub(blockchain);

app.get("/blockchain", (req, res, next) => {
    const { chain } = blockchain;
    res.json({ chain });
});

app.get("/blockchain/mine", async (req, res, next) => {
    const lastBlock = blockchain.lastBlock();
    const block = Block.mineBlock({ lastBlock, beneficiary: "" });
    try {
        await blockchain.addBlock({ block });
        pubSub.broadcastBlock({block});
        res.json({ block });
    } catch (error) {
        console.error("Failed to add mined block to chain: ", error);
        next(error);
    }
});

// Error handling middleware
app.use(async (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Internal error: ", err);

    // TODO: Implement problem details here!
    res.status(500).json({
        message: err.message,
    });
});

const isPeer = process.argv.includes("--peer");
// If the --peer argv is present, pick a random port between 2000 and 3000
const PORT = isPeer 
    ? Math.floor(2000 + Math.random() * 1000)
    : 3000;

(async () => {
    if (isPeer) {
        console.log("New node! Bootstrapping chain!");
        await bootstrapChain();
    }

    app.listen(PORT, () => {
        console.log("Listening @ PORT = %d", PORT);
    });
})();

async function bootstrapChain() {
    const receivedChain = await got.get("http://localhost:3000/blockchain").json() as Blockchain;
    blockchain.replaceChain({chain: receivedChain});
    console.log("Blockchain bootstrapped with: ", JSON.stringify(receivedChain));
}