import { keccak256 } from "js-sha3";
import { ec as EC } from "elliptic";

// SEC: Standards of Efficient Cryptography - Prime - 256 bits - Koblets Implementation # 1
export const ec = new EC("secp256k1");

export function sortCharacter(data: any): string {
	return JSON.stringify(data).split("").sort().join("");
}

export function hash(data: any): string {
	let hash = keccak256.create();
	hash.update(sortCharacter(data));
	return hash.hex();
}