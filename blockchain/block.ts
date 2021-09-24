import { keccak256 } from "js-sha3";
import { GENESIS_DATA, MINE_RATE } from "../config";
import { hash as keccakHash } from "../util";

export interface TruncatedBlockHeaders {
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
		if (value.length > HASH_LENGTH || lastBlock.blockHeaders.difficulty === 0) {
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
				difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
				number: lastBlock.blockHeaders.number + 1,
				timestamp: timestamp
			};
			header = keccakHash(truncatedBlockHeaders);

			nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);

			underTargetHash = keccakHash(header + nonce);
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

		if ((timestamp - lastBlock.blockHeaders.timestamp) > MINE_RATE) {
			return difficulty - 1;
		}

		if (difficulty < 1) return 1;

		return difficulty + 1;
	}

	static genesis() {
		return new Block(GENESIS_DATA);
	}

	static validateBlock({ lastBlock, block }: { lastBlock?: Block, block: Block }): Promise<any> {
		return new Promise((resolve, reject) => {
			if (keccakHash(block) === keccakHash(Block.genesis())) {
				return resolve(null);
			}
			if (lastBlock === undefined) {
				return reject(new Error("Cannot validate block without lastBlock"));
			}
			if (keccakHash(lastBlock.blockHeaders) !== block.blockHeaders.parentHash) {
				return reject(new Error("Parent hash doesn't match last block headers"));
			}
			if (block.blockHeaders.number !== lastBlock.blockHeaders.number + 1) {
				return reject(new Error("Block number must be the following of lastBlock's number"));
			}
			if (Math.abs(lastBlock.blockHeaders.difficulty - block.blockHeaders.difficulty) > 1) {
				return reject(new Error("Difficulty can only change by 1 between blocks"));
			}

			// Mine block break condition
			const { nonce } = block.blockHeaders;
			let truncatedBlockHeaders: TruncatedBlockHeaders = block.blockHeaders;
			//@ts-ignore
			delete truncatedBlockHeaders.nonce;
			const headersHash = keccakHash(truncatedBlockHeaders);
			const underTargetHash = keccakHash(headersHash + nonce);
			if (underTargetHash > Block.calculateBlockTargetHash({ lastBlock })) {
				return reject(new Error("Block does not meet PoW requirement"));
			}

			return resolve(null);
		});
	}
}