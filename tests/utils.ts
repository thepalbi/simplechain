import { expect } from "chai";
import { sortCharacter } from "../util";

describe("Utils#sortCharacters", function () {
	it("creates same strings for equal objects in differet order", function () {
		const objA = { hola: 1, ble: 2 };
		const objB = { ble: 2, hola: 1 };
		const a = sortCharacter(objA);
		const b = sortCharacter(objB);
		expect(a).to.be.equal(b);
	});

	it("create different string for different objects", function () {
		const a = sortCharacter({ hola: 1, perro: "holis" });
		const b = sortCharacter({ ble: 2, hola: 1 });
		expect(a).to.be.not.equal(b);
	});
});