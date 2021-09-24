import { expect } from "chai";
import { Block, TruncatedBlockHeaders } from "../blockchain/block";
import { SECONDS } from "../config";
import { hash as keccakHash } from "../util";

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