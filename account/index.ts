import { ec as elliptic } from "elliptic";
import { STARTING_BALANCE } from "../config";
import { ec, hash as keccakHash } from "../util";

interface SerializedAccount {
    address: string,
    balance: number,
}

// Account represents a balance account.
export class Account {
    keyPair: elliptic.KeyPair;
    address: string;
    balance: number;
    constructor() {
        this.keyPair = ec.genKeyPair();
        this.address = this.keyPair.getPublic("hex");
        this.balance = STARTING_BALANCE;
    }

    public sign(data: any): elliptic.Signature {
        return this.keyPair.sign(keccakHash(data));
    }

    public toJSON(): SerializedAccount {
        return {
            address: this.address,
            balance: this.balance,
        }
    }

    static verifySignature({ publicKey, data, signature }
        : { publicKey: string, data: any, signature: elliptic.Signature }): boolean {
        const keyFromPublic = ec.keyFromPublic(publicKey, "hex");
        return keyFromPublic.verify(keccakHash(data), signature);
    }
}