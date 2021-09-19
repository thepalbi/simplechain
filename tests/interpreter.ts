import { expect } from "chai";
import { Interpreter, OpCode } from "..";

describe("Interpreter tests", () => {
    let int = new Interpreter();

    let generateCode = (a: number, b: number, arithOrCompOpCode: OpCode) =>
        [OpCode.PUSH, b, OpCode.PUSH, a, arithOrCompOpCode, OpCode.STOP];

    let cases: [number, number, OpCode, number, string?][] = [
        [1, 3, OpCode.ADD, 4],
        [3, 1, OpCode.SUB, 2],
        [3, 1, OpCode.DIV, 3],
        [3, 1, OpCode.LT, 0],
        [5, 1, OpCode.GT, 1],
        [1, 1, OpCode.AND, 1],
        [0, 1, OpCode.AND, 0, "False scneario"],
        [1, 0, OpCode.OR, 1],
        [10, 12, OpCode.EQ, 0],
        [12, 12, OpCode.EQ, 1, "Equal scneario"],
    ];
    cases.forEach(([a, b, arithOrCompOpCode, expectedRes, note]) => {
        it(`Operation: ${arithOrCompOpCode.toString()}${note !== undefined ? " - ".concat(note) : ""}`,
            () => {
                let result = new Interpreter().runCode(generateCode(a, b, arithOrCompOpCode));
                expect(result).to.equal(expectedRes);
            })
    });

    it("Push operation", () => {
        let code = [OpCode.PUSH, 5, OpCode.STOP];
        let res = new Interpreter().runCode(code);
        expect(res).to.equal(5);
    });
})