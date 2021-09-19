export type OpCode =
    "STOP" |
    "ADD" | "SUB" | "MUL" | "DIV" |
    "PUSH" |
    "LT" | "GT" | "EQ" | "AND" | "OR" |
    "JUMP"

export type CodeSymbol = OpCode | number

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
            case "STOP":
                throw new Error("Execution complete")

            // Arithmetic operations
            case "ADD":
            case "SUB":
            case "DIV":
            case "MUL":
            // Comparisons
            case "EQ":
            case "LT":
            case "GT":
            case "AND":
            case "OR":
                if (this.state.stack.length < 2) {
                    throw new Error("Not enough elements in stack");
                }

                // The top element is the second operand, and the 
                const a = this.state.stack.pop() as number;
                const b = this.state.stack.pop() as number;
                let result: number;
                if (opCode == "ADD") result = a + b;
                else if (opCode == "SUB") result = a - b;
                else if (opCode == "DIV") result = a / b;
                else if (opCode == "MUL") result = a * b;

                else if (opCode == "EQ") result = a === b ? 1 : 0;
                else if (opCode == "LT") result = a < b ? 1 : 0;
                else if (opCode == "GT") result = a > b ? 1 : 0;
                else if (opCode == "AND") result = (a === 1 && b === 1) ? 1 : 0;
                // Remaining: OR
                else result = (a === 1 || b === 1) ? 1 : 0;

                this.state.stack.push(result);
                break

            case "PUSH":
                this.state.programCounter++;
                const value = this.extractCurrentCodeSymbol();
                if (typeof value !== "number")
                    throw new Error("Cannot push non-number element");

                this.state.stack.push(value);
                break;

            case "JUMP":
                if (this.state.stack.length < 1) throw new Error("Empty stack");
                const destination = this.state.stack.pop() as number;
                this.state.programCounter = destination;
                this.state.programCounter--;
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