import { GENESIS_DATA } from "../config";

interface BlockHeaders {
	parentHash: string
	beneficiary: string
	difficulty: number
	number: number
	timestamp: string
	nonce: number
}

interface BlockProps {
	blockHeaders: BlockHeaders
}

export class Block {
	private blockHeaders: BlockHeaders;

	constructor(props: BlockProps) {
		this.blockHeaders = props.blockHeaders;
	}

	static mineBlock(lastBlock: Block) {

	}

	static genesis() {
		return new Block(GENESIS_DATA);
	}
}