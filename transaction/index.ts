import { expect } from "chai";
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

interface ValidateTransactionProps {
    transaction: Transaction
}

export class Transaction {
    id: string;
    from: string;
    to: string;
    value: number;
    data: any;
    signature?: elliptic.Signature;

    private constructor({ id, from, to, value, data, signature }: TransactionProps) {
        // CHANGEME: Don't like so much this defaults approach
        this.id = id || uuid();
        this.from = from || "-";
        this.to = to || "-";
        this.value = value || 0;
        this.data = data;
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

    static validateStandardTransaction({ transaction }: ValidateTransactionProps) {
        return new Promise((resolve, reject) => {
            const { id, from, signature } = transaction;
            const transactionData = { ...transaction };
            delete transactionData.signature;

            if (!signature) {
                return reject(new Error(`Transaction ${id} has an undefined signature.`));
            }

            if (!Account.verifySignature({
                publicKey: from,
                data: transactionData,
                signature: signature,
            })) {
                return reject(new Error(`Transaction ${id} signature is not valid.`));
            }

            resolve(null);
        });
    }

    static validateCreateAccountTransaction({ transaction }: ValidateTransactionProps) {
        return new Promise((resolve, reject) => {
            const expectedAccountDataFields = Object.keys(new Account().toJSON());
            const fields = Object.keys(transaction.data.accountData);

            if (fields.length !== expectedAccountDataFields.length) {
                return reject(new Error(
                    `Transaction ${transaction.id} account data has an incorrect number of fields`
                ));
            }

            fields.forEach(field => {
                if (!expectedAccountDataFields.includes(field)) {
                    return reject(new Error(`Field ${field} is unexpected for account data.`));
                }
            })

            return resolve(null);
        });
    }
}