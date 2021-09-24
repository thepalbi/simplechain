import { expect } from "chai";
import { Block } from "../blockchain/block";
import { hash as keccakHash } from "../util";

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
            expect(
                keccakHash(keccakHash(minedBlock.blockHeaders) + minedBlock.blockHeaders.number)
                <= blockTargetHash)
                .to.be.true;
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