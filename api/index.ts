import express from "express";
import { Blockchain } from "../blockchain";
import { Block } from "../blockchain/block";
import { PubSub } from "./pubsub";

const app = express();
const blockchain = new Blockchain();
const pubSub = new PubSub();

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

// If the --peer argv is present, pick a random port between 2000 and 3000
const PORT = process.argv.includes("--peer") 
    ? Math.floor(2000 + Math.random() * 1000)
    : 3000;

app.listen(PORT, () => {
    console.log("Listening @ PORT = %d", PORT);
});