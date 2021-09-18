enum OpCode {
    STOP = "STOP",
    ADD = "ADD",
    PUSH = "PUSH"
}

type CodeSymbol = OpCode | number

interface InterpreterState {
    programCounter: number
    stack: number[]
    code: CodeSymbol[]
}

class Interpreter {
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
                if (this.state.stack.length < 2) {
                    throw new Error("Not enough elements in stack");
                }

                const a = this.state.stack.pop() as number;
                const b = this.state.stack.pop() as number;
                this.state.stack.push(a + b);
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

const int = new Interpreter();
let code: CodeSymbol[] = [OpCode.PUSH, 1, OpCode.PUSH, 2, OpCode.ADD, OpCode.STOP];
console.log(int.runCode(code));