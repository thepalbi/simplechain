import { expect } from "chai";
import { hash, sortCharacter } from "../util";

describe("Utils", function () {
	describe("sortCharacters()", function () {
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

	describe("hash()", function () {
		it("Produces a keccak256 hash for some object", function () {
			const obj = { hola: 1, hola2: "ble" };
			const h = hash(obj);
			expect(h).to.be.equal("714af2682d112e08c511311382dcd41b7f0ca45c2e989b2d92abfbc3e7a534f1");
		});

		it("Produces same hash for equal but not ordered fields objects", function () {
			const obj1 = { hola: 1, hola2: "ble" };
			const obj2 = { hola2: "ble", hola: 1, };
			const h1 = hash(obj1);
			const h2 = hash(obj2);
			expect(h1).to.be.not.empty;
			expect(h2).to.be.not.empty;
			expect(h1).to.be.equal(h2);
		});

		it("Produces different hash for unequal objects", function () {
			const obj1 = { hola: 1, hola2: "ble" };
			const obj2 = { hola3: "bla", hola: 1, };
			const h1 = hash(obj1);
			const h2 = hash(obj2);
			expect(h1).to.be.not.empty;
			expect(h2).to.be.not.empty;
			expect(h1).not.to.be.equal(h2);
		});
	});
});