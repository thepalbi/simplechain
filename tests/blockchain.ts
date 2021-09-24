import { expect, use as chaiUse } from "chai";
import { Block, TruncatedBlockHeaders } from "../blockchain/block";
import { SECONDS } from "../config";
import { hash as keccakHash } from "../util";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);

describe("Block", function () {
    describe("calculateBlockTargetHash()", function () {
        it("Calculates block target hash for some value", function () {
            const result = Block.calculateBlockTargetHash({
                lastBlock: getBlockWithDifficulty({ difficulty: 15 })
            });
            expect(result).to.have.length(64);
        });

        it("Calculates block target hash with max hash value", function () {
            const result = Block.calculateBlockTargetHash({
                lastBlock: getBlockWithDifficulty({ difficulty: 1 })
            });
            expect(result).to.be.equal("f".repeat(64));
        });

        it("Calculates block target hash with value lead by zeros", function () {
            const result = Block.calculateBlockTargetHash({
                lastBlock: getBlockWithDifficulty({ difficulty: 1024 })
            });
            expect(result).to.have.length(64);
            expect(result.startsWith("0")).to.be.true;
        });

        it("Should be MAX_HASH_VALUE for difficulty zero", function () {
            const result = Block.calculateBlockTargetHash({
                lastBlock: getBlockWithDifficulty({ difficulty: 0 })
            });
            expect(result).to.be.equal("f".repeat(64));
        });
    });

    describe("mineBlock()", function () {
        let lastBlock: Block, minedBlock: Block;
        this.beforeEach(() => {
            lastBlock = Block.genesis();
            minedBlock = Block.mineBlock({
                lastBlock,
                beneficiary: "foo",
            });
        });

        it("Mined block has according block headers and validates challenge", function () {
            let blockTargetHash = Block.calculateBlockTargetHash({ lastBlock });
            // New block header assertions
            expect(minedBlock.blockHeaders.number).to.be.equal(lastBlock.blockHeaders.number + 1);
            expect(minedBlock.blockHeaders.parentHash).to.be.equal(keccakHash(lastBlock.blockHeaders));
            expect(minedBlock.blockHeaders.beneficiary).to.be.equal("foo");
            // Mine block break condition
            const { nonce } = minedBlock.blockHeaders;
            let truncatedBlockHeaders: TruncatedBlockHeaders = minedBlock.blockHeaders;
            //@ts-ignore
            delete truncatedBlockHeaders.nonce;
            const headersHash = keccakHash(truncatedBlockHeaders);
            const underTargetHash = keccakHash(headersHash + nonce);

            expect(underTargetHash <= blockTargetHash).to.be.true;
        });
    });

    describe("adjustDifficulty()", function () {
        let now: number, lastBlock: Block;

        this.beforeEach(() => {
            now = Date.now();
            lastBlock = getBlockWithDifficulty({ difficulty: 2, timestamp: now });
        });

        it("Increases difficulty if mining was too easy", () => {
            let newDifficulty = Block.adjustDifficulty({
                lastBlock: lastBlock,
                timestamp: now + 10
            });
            expect(newDifficulty).to.be.equal(lastBlock.blockHeaders.difficulty + 1);
        });

        it("Decrease difficulty if mining was too hard", () => {
            let newDifficulty = Block.adjustDifficulty({
                lastBlock: lastBlock,
                timestamp: now + SECONDS * 15
            });
            expect(newDifficulty).to.be.equal(lastBlock.blockHeaders.difficulty - 1);
        });

        it("Difficulty never gets below zero", () => {
            lastBlock = getBlockWithDifficulty({ difficulty: 0, timestamp: now })
            let newDifficulty = Block.adjustDifficulty({
                lastBlock: lastBlock,
                timestamp: now + 10
            });
            expect(newDifficulty).to.be.equal(1);
        });
    });

    describe("validateBlock()", function () {
        let lastBlock: Block, block: Block;
        this.beforeEach(() => {
            lastBlock = Block.genesis();
            block = Block.mineBlock({ lastBlock, beneficiary: "beneficiary" });
        });

        it("Genesis block is validated inmediately", async () => {
            await expect(Block.validateBlock({ block: Block.genesis() })).to.be.eventually.null;
        });

        it("Cannot validate non-genesis block without lastBlock", async () => {
            await expect(Block.validateBlock({ block })).to.be.rejectedWith("Cannot validate block without lastBlock")
        });

        it("Cannot validate block with wrong parent hash", async () => {
            block.blockHeaders.parentHash = "123";
            await expect(Block.validateBlock({ lastBlock, block })).to.be.rejectedWith("Parent hash doesn't match last block headers")
        });

        it("Cannot validate block with not subsequent number", async () => {
            block.blockHeaders.number = 10;
            await expect(Block.validateBlock({ lastBlock, block })).to.be.rejectedWith("Block number must be the following of lastBlock's number")
        });

        it("Cannot validate block with too different difficulty", async () => {
            block.blockHeaders.difficulty = 10;
            await expect(Block.validateBlock({ lastBlock, block })).to.be.rejectedWith("Difficulty can only change by 1 between blocks")
        });

        it("Cannot validate block that doesn't verify PoW condition", async () => {
            // Make targetHash more difference sensible
            lastBlock = block;
            lastBlock.blockHeaders.difficulty = 10;
            block = Block.mineBlock({ lastBlock, beneficiary: "beneficiary" });
            // Overwrite nonce to make PoW fail
            block.blockHeaders.nonce = 123139129;
            await expect(Block.validateBlock({ lastBlock, block })).to.be.rejectedWith("Block does not meet PoW requirement")
        });

        it("Subsequent chain is validated ok!", async () => {
            // Make results of lastBlock and block more significant
            lastBlock = block;
            block = Block.mineBlock({lastBlock, beneficiary: "beneficiary"});
            await expect(Block.validateBlock({ lastBlock, block })).to.be.eventually.null;
        });
    });
})

function getBlockWithDifficulty({ difficulty, timestamp }: { difficulty: number, timestamp?: number }): Block {
    return new Block({
        blockHeaders: {
            parentHash: "",
            beneficiary: "",
            difficulty: difficulty,
            number: 1,
            timestamp: timestamp != undefined ? timestamp : 1,
            nonce: 2,
        }
    })
}