"use strict";
var OpCode;
(function (OpCode) {
    OpCode["STOP"] = "STOP";
    OpCode["ADD"] = "ADD";
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
            case OpCode.ADD:
                if (this.state.stack.length < 2) {
                    throw new Error("Not enough elements in stack");
                }
                var a = this.state.stack.pop();
                var b = this.state.stack.pop();
                this.state.stack.push(a + b);
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
var int = new Interpreter();
var code = [OpCode.PUSH, 1, OpCode.PUSH, 2, OpCode.ADD, OpCode.STOP];
console.log(int.runCode(code));
