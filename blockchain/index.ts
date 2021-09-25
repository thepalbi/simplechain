import { Block } from "./block";

export class Blockchain {
	public readonly chain: Block[];
	constructor() {
		this.chain = [Block.genesis()];
	}

	async addBlock({ block }: { block: Block }) {
		try {
			await Block.validateBlock({ lastBlock: this.lastBlock(), block });
			this.chain.push(block);
		} catch (error) {
			throw error;
		}
	}

	lastBlock(): Block {
		return this.chain[this.chain.length - 1];
	}
}