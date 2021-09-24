import { Block } from "./block";

export class Blockchain {
	private chain: Block[];
	constructor() {
		this.chain = [Block.genesis()];
	}

	addBlock({ block }: { block: Block }) {
		this.chain.push(block);
	}

	lastBlock(): Block {
		return this.chain[this.chain.length - 1];
	}
}

const chain = new Blockchain();
for (let i = 0; i < 1000; i++) {
	const lastBlock = chain.lastBlock();
	console.log("Parent hash: %s Difficulty: %d", lastBlock.blockHeaders.parentHash, lastBlock.blockHeaders.difficulty);
	const newBlock = Block.mineBlock({ lastBlock, beneficiary: "beneficiary" });
	chain.addBlock({ block: newBlock });
}

console.log(JSON.stringify(chain));