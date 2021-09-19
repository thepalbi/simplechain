import { expect } from "chai";
import { CodeSymbol, Interpreter, OpCode } from "..";

function runCodeAndExpectResult(code: CodeSymbol[], expectedResult: number) {
    let res = new Interpreter().runCode(code);
    expect(res).to.equal(expectedResult);
}

describe("Interpreter tests", () => {
    let int = new Interpreter();

    let generateCode = (a: number, b: number, arithOrCompOpCode: OpCode): CodeSymbol[] =>
        ["PUSH", b, "PUSH", a, arithOrCompOpCode, "PUSH"];

    let cases: [number, number, OpCode, number, string?][] = [
        [1, 3, "ADD", 4],
        [3, 1, "SUB", 2],
        [3, 1, "DIV", 3],
        [3, 1, "LT", 0],
        [5, 1, "GT", 1],
        [1, 1, "AND", 1],
        [0, 1, "AND", 0, "False scneario"],
        [1, 0, "OR", 1],
        [10, 12, "EQ", 0],
        [12, 12, "EQ", 1, "Equal scneario"],
    ];
    cases.forEach(([a, b, arithOrCompOpCode, expectedRes, note]) => {
        it(`Operation: ${arithOrCompOpCode.toString()}${note !== undefined ? " - ".concat(note) : ""}`,
            () => {
                let result = new Interpreter().runCode(generateCode(a, b, arithOrCompOpCode));
                expect(result).to.equal(expectedRes);
            })
    });

    it("Push operation", () =>
        runCodeAndExpectResult(["PUSH", 5, "STOP"], 5));

    it("JUMP alters return value", () =>
        runCodeAndExpectResult(["PUSH", 6, "JUMP", "PUSH", 5, "STOP", "PUSH", 4, "STOP"], 4));

    it("JUMPI takes jump", () =>
        runCodeAndExpectResult(["PUSH", 8, "PUSH", 1, "JUMPI", "PUSH", 5, "STOP", "PUSH", 4, "STOP"], 4));

    it("JUMPI doesnt takes jump", () =>
        runCodeAndExpectResult(["PUSH", 8, "PUSH", 0, "JUMPI", "PUSH", 5, "STOP", "PUSH", 4, "STOP"], 5));
})