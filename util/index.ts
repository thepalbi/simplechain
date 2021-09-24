import { keccak256 } from "js-sha3";

export function sortCharacter(data: any): string {
	return JSON.stringify(data).split("").sort().join("");
}

export function hash(data: any): string {
	let hash = keccak256.create();
	hash.update(sortCharacter(data));
	return hash.hex();
}