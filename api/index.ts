import express from "express";
import { Blockchain } from "../blockchain";
import { Block } from "../blockchain/block";

const app = express();
const blockchain = new Blockchain();

app.get("/blockchain", (req, res, next) => {
    const { chain } = blockchain;
    res.json({ chain });
});

app.get("/blockchain/mine", async (req, res, next) => {
    const lastBlock = blockchain.lastBlock();
    const block = Block.mineBlock({ lastBlock, beneficiary: "" });
    try {
        await blockchain.addBlock({ block });
        res.json({ block });
    } catch (error) {
        console.error("Failed to add mined block to chain: ", error);

        // TODO: Add better error API
        res.status(500).json({
            error,
            message: "Failed to add mined block to chain",
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log("Listening @ PORT = %d", PORT);
});