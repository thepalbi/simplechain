export function sortCharacter(data: any): string {
	return JSON.stringify(data).split("").sort().join("");
}