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