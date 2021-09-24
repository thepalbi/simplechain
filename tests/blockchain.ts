import { expect } from "chai";
import { Block } from "../blockchain/block";

describe("Block", function () {
    describe("calculateBlockTargetHash()", function () {
        it("Calculates block target hash for some value", function () {
            const result = Block.calculateBlockTargetHash({
                lastBlock: getBlockWithDifficulty(15)
            });
            expect(result).to.have.length(64);
        });

        it("Calculates block target hash with max hash value", function () {
            const result = Block.calculateBlockTargetHash({
                lastBlock: getBlockWithDifficulty(1)
            });
            expect(result).to.be.equal("f".repeat(64));
        });

        it("Calculates block target hash with value lead by zeros", function () {
            const result = Block.calculateBlockTargetHash({
                lastBlock: getBlockWithDifficulty(1024)
            });
            expect(result).to.have.length(64);
            expect(result.startsWith("0")).to.be.true;
        });
    });
})

function getBlockWithDifficulty(difficulty: number): Block {
    return new Block({
        blockHeaders: {
            parentHash: "",
            beneficiary: "",
            difficulty: difficulty,
            number: 1,
            timestamp: "",
            nonce: 2,
        }
    })
}