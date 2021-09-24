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

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt("f".repeat(HASH_LENGTH), 16);

export class Block {
	private blockHeaders: BlockHeaders;

	constructor(props: BlockProps) {
		this.blockHeaders = props.blockHeaders;
	}

	static calculateBlockTargetHash({ lastBlock }: {lastBlock: Block}): string {
		const value = (MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty).toString(16);
		if (value.length > HASH_LENGTH) {
			return "f".repeat(HASH_LENGTH);
		}

		return "0".repeat(HASH_LENGTH - value.length) + value;
	}

	static mineBlock(lastBlock: Block) {

	}

	static genesis() {
		return new Block(GENESIS_DATA);
	}
}