import { Block } from "./block";

export class Blockchain {
	private chain: Block[];
	constructor() {
		this.chain = [Block.genesis()];
	}
}

const blockchain = new Blockchain();
console.log(JSON.stringify(blockchain));