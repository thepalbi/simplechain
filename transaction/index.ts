import { ec as elliptic } from "elliptic";
import { v4 as uuid } from "uuid";
import { Account } from "../account";

export enum TransactionType {
    CREATE_ACCOUNT,
    TRANSACT,
}

interface TransactionProps {
    id?: string,
    from?: string,
    to?: string,
    value?: number,
    data?: any,
    // FIXME: Maybe change the signature type to string if anything found how
    // https://www.tabnine.com/code/javascript/classes/elliptic/Signature
    signature?: elliptic.Signature,
}

type CreateTxProps = CreateTxTransactProps | CreateTxCreateAcctProps

type CreateTxTransactProps = {
    txType: TransactionType.TRANSACT,
    account: Account,
    to: string,
    value: number
}

type CreateTxCreateAcctProps = {
    txType: TransactionType.CREATE_ACCOUNT,
    account: Account,
}

export class Transaction {
    id: string;
    from: string;
    to: string;
    value: number;
    data: any;
    signature?: elliptic.Signature;

    constructor({ id, from, to, value, data, signature }: TransactionProps) {
        // CHANGEME: Don't like so much this defaults approach
        this.id = id || uuid();
        this.from = from || "-";
        this.to = to || "-";
        this.value = value || 0;
        this.data = data || "-";
        this.signature = signature;
    }

    static createTransaction(txProps: CreateTxProps): Transaction {
        if (txProps.txType == TransactionType.TRANSACT) {
            const transactionData = {
                id: uuid(),
                from: txProps.account.address,
                to: txProps.to,
                value: txProps.value,
                data: { type: TransactionType.TRANSACT }
            };
            return new Transaction({
                ...transactionData,
                signature: txProps.account.sign(transactionData)
            });
        } else {
            return new Transaction({
                data: {
                    type: TransactionType.CREATE_ACCOUNT,
                    accountData: txProps.account.toJSON(),
                }
            });
        }
    }
}