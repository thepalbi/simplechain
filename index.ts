export enum OpCode {
    STOP = "STOP",
    ADD = "ADD",
    SUB = "SUB",
    MUL = "MUL",
    DIV = "DIV",
    PUSH = "PUSH",
    LT = "LE",
    GT = "GT",
    EQ = "EQ",
    AND = "AND",
    OR = "OR"
}

type CodeSymbol = OpCode | number

interface InterpreterState {
    programCounter: number
    stack: number[]
    code: CodeSymbol[]
}

export class Interpreter {
    private state: InterpreterState;
    constructor() {
        this.state = {
            programCounter: 0,
            stack: [],
            code: []
        }
    }

    private extractCurrentCodeSymbol(): CodeSymbol {
        return this.state.code[this.state.programCounter];
    }

    private handleOpCode(opCode: CodeSymbol) {
        switch (opCode) {
            case OpCode.STOP:
                throw new Error("Execution complete")

            // Arithmetic operations
            case OpCode.ADD:
            case OpCode.SUB:
            case OpCode.DIV:
            case OpCode.MUL:
            // Comparisons
            case OpCode.EQ:
            case OpCode.LT:
            case OpCode.GT:
            case OpCode.AND:
            case OpCode.OR:
                if (this.state.stack.length < 2) {
                    throw new Error("Not enough elements in stack");
                }

                // The top element is the second operand, and the 
                const a = this.state.stack.pop() as number;
                const b = this.state.stack.pop() as number;
                let result: number;
                if (opCode == OpCode.ADD) result = a + b;
                else if (opCode == OpCode.SUB) result = a - b;
                else if (opCode == OpCode.DIV) result = a / b;
                else if (opCode == OpCode.MUL) result = a * b;

                else if (opCode == OpCode.EQ) result = a === b ? 1 : 0;
                else if (opCode == OpCode.LT) result = a < b ? 1 : 0;
                else if (opCode == OpCode.GT) result = a > b ? 1 : 0;
                else if (opCode == OpCode.AND) result = (a === 1 && b === 1) ? 1 : 0;
                // Remaining: OR
                else result = (a === 1 || b === 1) ? 1 : 0;

                this.state.stack.push(result);
                break

            case OpCode.PUSH:
                this.state.programCounter++;
                const value = this.extractCurrentCodeSymbol();
                if (typeof value !== "number")
                    throw new Error("Cannot push non-number element");

                this.state.stack.push(value);
                break;

            default:
                break;
        }
    }

    public runCode(code: CodeSymbol[]) {
        this.state.code = code;

        while (this.state.programCounter < this.state.code.length) {
            try {
                const opCode = this.extractCurrentCodeSymbol();
                this.handleOpCode(opCode);
                this.state.programCounter++;
            } catch (error) {
                return this.state.stack.pop();
            }
        }
    }
}