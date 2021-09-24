import { keccak256 } from "js-sha3";
import { GENESIS_DATA } from "../config";
import { hash as keccakHash } from "../util";

interface TruncatedBlockHeaders {
	parentHash: string
	beneficiary: string
	difficulty: number
	number: number
	timestamp: string
}

interface BlockHeaders extends TruncatedBlockHeaders {
	nonce: number
}

interface BlockProps {
	blockHeaders: BlockHeaders
}

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt("f".repeat(HASH_LENGTH), 16);
const MAX_NONCE_VALUE = 2 ** 64;

export class Block {
	private blockHeaders: BlockHeaders;

	constructor(props: BlockProps) {
		this.blockHeaders = props.blockHeaders;
	}

	static calculateBlockTargetHash({ lastBlock }: { lastBlock: Block }): string {
		const value = (MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty).toString(16);
		if (value.length > HASH_LENGTH) {
			return "f".repeat(HASH_LENGTH);
		}

		return "0".repeat(HASH_LENGTH - value.length) + value;
	}

	static mineBlock({ lastBlock, beneficiary }: { lastBlock: Block, beneficiary: string }): Block | undefined {
		const target = Block.calculateBlockTargetHash({ lastBlock });
		let timestamp: number, truncatedBlockHeaders: TruncatedBlockHeaders, header: string, nonce: number;
		timestamp = Date.now();
		truncatedBlockHeaders = {
			parentHash: keccakHash(lastBlock.blockHeaders),
			beneficiary,
			difficulty: lastBlock.blockHeaders.difficulty + 1,
			number: lastBlock.blockHeaders.number + 1,
			timestamp: timestamp.toString()
		};
		header = keccakHash(truncatedBlockHeaders);
		nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);
		const underTargetHash = keccakHash(header + nonce);

		console.log("Target hash: %s", target);
		console.log("Under target hash: %s", underTargetHash);

		if (underTargetHash < target) {
			return new Block({
				blockHeaders: {
					...truncatedBlockHeaders,
					nonce: nonce,
				}
			});
		}
	}

	static genesis() {
		return new Block(GENESIS_DATA);
	}
}

const block = Block.mineBlock({
	lastBlock: Block.genesis(),
	beneficiary: "foo"
});
console.log("Block: %s", JSON.stringify(block));
