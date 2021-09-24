import { keccak256 } from "js-sha3";
import { GENESIS_DATA, MINE_RATE } from "../config";
import { hash as keccakHash } from "../util";

interface TruncatedBlockHeaders {
	parentHash: string
	beneficiary: string
	difficulty: number
	number: number
	timestamp: number
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
	public blockHeaders: BlockHeaders;

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

	static mineBlock({ lastBlock, beneficiary }: { lastBlock: Block, beneficiary: string }): Block {
		const target = Block.calculateBlockTargetHash({ lastBlock });
		let timestamp: number, truncatedBlockHeaders: TruncatedBlockHeaders, header: string, nonce: number, underTargetHash: string;
		do {
			timestamp = Date.now();
			truncatedBlockHeaders = {
				parentHash: keccakHash(lastBlock.blockHeaders),
				beneficiary,
				difficulty: Block.adjustDifficulty({lastBlock, timestamp}),
				number: lastBlock.blockHeaders.number + 1,
				timestamp: timestamp
			};
			header = keccakHash(truncatedBlockHeaders);

			nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);

			underTargetHash = keccakHash(header + nonce);
			console.log("Target hash: %s", target);
			console.log("Under target hash: %s", underTargetHash);
		} while (underTargetHash > target);

		return new Block({
			blockHeaders: {
				...truncatedBlockHeaders,
				nonce: nonce,
			}
		});
	}

	static adjustDifficulty({ lastBlock, timestamp }: { lastBlock: Block, timestamp: number }) {
		let { difficulty } = lastBlock.blockHeaders;

		if (difficulty < 1) return 1;

		if ((timestamp - lastBlock.blockHeaders.timestamp) > MINE_RATE) {
			return difficulty - 1;
		}

		return difficulty + 1;
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
