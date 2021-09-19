import { expect } from "chai";
import { CodeSymbol, Interpreter, OpCode } from "..";

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

    it("Push operation", () => {
        let code: CodeSymbol[] = ["PUSH", 5, "STOP"];
        let res = new Interpreter().runCode(code);
        expect(res).to.equal(5);
    });
})