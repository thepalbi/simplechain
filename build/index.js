"use strict";
var OpCode;
(function (OpCode) {
    OpCode["STOP"] = "STOP";
    OpCode["ADD"] = "ADD";
    OpCode["SUB"] = "ADD";
    OpCode["MUL"] = "ADD";
    OpCode["DIV"] = "DIV";
    OpCode["PUSH"] = "PUSH";
})(OpCode || (OpCode = {}));
var Interpreter = /** @class */ (function () {
    function Interpreter() {
        this.state = {
            programCounter: 0,
            stack: [],
            code: []
        };
    }
    Interpreter.prototype.extractCurrentCodeSymbol = function () {
        return this.state.code[this.state.programCounter];
    };
    Interpreter.prototype.handleOpCode = function (opCode) {
        switch (opCode) {
            case OpCode.STOP:
                throw new Error("Execution complete");
            case (OpCode.ADD, OpCode.SUB, OpCode.DIV, OpCode.MUL):
                if (this.state.stack.length < 2) {
                    throw new Error("Not enough elements in stack");
                }
                var a = this.state.stack.pop();
                var b = this.state.stack.pop();
                var result = void 0;
                if (opCode == OpCode.ADD)
                    result = a + b;
                else if (opCode == OpCode.SUB)
                    result = a - b;
                else if (opCode == OpCode.DIV)
                    result = a / b;
                else
                    result = a * b;
                this.state.stack.push(result);
                break;
            case OpCode.PUSH:
                this.state.programCounter++;
                var value = this.extractCurrentCodeSymbol();
                if (typeof value !== "number")
                    throw new Error("Cannot push non-number element");
                this.state.stack.push(value);
                break;
            default:
                break;
        }
    };
    Interpreter.prototype.runCode = function (code) {
        this.state.code = code;
        while (this.state.programCounter < this.state.code.length) {
            try {
                var opCode = this.extractCurrentCodeSymbol();
                this.handleOpCode(opCode);
                this.state.programCounter++;
            }
            catch (error) {
                return this.state.stack.pop();
            }
        }
    };
    return Interpreter;
}());
var code = [OpCode.PUSH, 1, OpCode.PUSH, 2, OpCode.ADD, OpCode.STOP];
console.log("Result of 1 ADD 2: %d", new Interpreter().runCode(code));
code = [OpCode.PUSH, 1, OpCode.PUSH, 2, OpCode.SUB, OpCode.STOP];
console.log("Result of 1 SUB 2: %d", new Interpreter().runCode(code));
code = [OpCode.PUSH, 1, OpCode.PUSH, 2, OpCode.DIV, OpCode.STOP];
console.log("Result of 1 DIV 2: %d", new Interpreter().runCode(code));
code = [OpCode.PUSH, 1, OpCode.PUSH, 2, OpCode.MUL, OpCode.STOP];
console.log("Result of 1 MUL 2: %d", new Interpreter().runCode(code));
