import { Block } from "./block";

export class Blockchain {
	public chain: Block[];
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

	async replaceChain({ chain }: { chain: Blockchain }) {
		for (let i = 0; i < chain.chain.length; i++) {
			let block = chain.chain[i];
			let lastBlock = i - 1 < 0 ? undefined : chain.chain[i - 1];
			await Block.validateBlock({lastBlock, block});
			console.log("*------- validated block #%d", block.blockHeaders.number);
		}
		this.chain = chain.chain;
	}
}