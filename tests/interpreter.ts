import {expect} from "chai";
import { Interpreter, OpCode } from "..";

describe("Interpreter tests", () => {
    let int = new Interpreter();

    let generateCode = (arithOpCode: OpCode) => 
        [OpCode.PUSH, 3, OpCode.PUSH, 1, arithOpCode, OpCode.STOP];

    let cases: [OpCode, number][] = [
        [OpCode.ADD, 4],
        [OpCode.SUB, 2],
        [OpCode.DIV, 3],
        [OpCode.MUL, 3]
    ];
    cases.forEach(([arithOpCode, expectedRes]) => {
        it(`Arithmetic operations: ${arithOpCode.toString()}`, () => {
            let result = new Interpreter().runCode(generateCode(arithOpCode));
            expect(result).to.equal(expectedRes);
        })
    })
})