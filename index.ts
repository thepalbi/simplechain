export enum OpCode {
    STOP = "STOP",
    ADD = "ADD",
    SUB = "SUB",
    MUL = "MUL",
    DIV = "DIV",
    PUSH = "PUSH"
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

            case OpCode.ADD:
            case OpCode.SUB:
            case OpCode.DIV:
            case OpCode.MUL:
                if (this.state.stack.length < 2) {
                    throw new Error("Not enough elements in stack");
                }

                // The top element is the second operand, and the 
                const b = this.state.stack.pop() as number;
                const a = this.state.stack.pop() as number;
                let result: number;
                if (opCode == OpCode.ADD)
                    result = a + b;
                else if (opCode == OpCode.SUB)
                    result = a - b;
                else if (opCode == OpCode.DIV)
                    result = a / b;
                else
                    result = a * b;

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