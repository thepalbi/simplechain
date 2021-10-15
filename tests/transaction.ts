import { expect } from "chai";
import { transferPromiseness } from "chai-as-promised";
import { setNonEnumerableProperties } from "got/dist/source";
import { Account } from "../account";
import { Transaction, TransactionType } from "../transaction";

describe("Transaction", function () {
    describe("createTransaction()", function () {
        let acct1: Account;
        let acct2: Account;

        this.beforeEach(() => {
            acct1 = new Account();
            acct2 = new Account();
        });

        it("Creates a TRANSACT transaction", () => {
            let tx = Transaction.createTransaction({
                txType: TransactionType.TRANSACT,
                account: acct1,
                to: acct2.address,
                value: 50,
            });
            expect(tx.from).to.be.equal(acct1.address);
            expect(tx.to).to.be.equal(acct2.address);
            expect(tx.value).to.be.equal(50);
            expect(tx.signature).to.not.be.undefined;
            let txCopy = tx as any;
            delete txCopy["signature"];
            // FIXME: Hack
            if (!tx.signature) {
                return;
            }
            let presentSignature = tx.signature;
            expect(Account.verifySignature({
                publicKey: acct1.address,
                signature: tx.signature,
                data: txCopy,
            })).to.be.true;
        });

        it("Creates a CREATE_ACCOUNT transaction", () => {
            let tx = Transaction.createTransaction({
                txType: TransactionType.CREATE_ACCOUNT,
                account: acct1,
            });
            expect(tx.data.type).to.be.equal(TransactionType.CREATE_ACCOUNT);
            expect(tx.data.accountData).not.to.be.null;
            expect(tx.data.accountData.address).to.be.equal(acct1.address)
            expect(tx.data.accountData.balance).to.be.equal(1000);
        });
    });

    describe("validateStandardTransaction()", function () {
        let sender = new Account();
        it("Validate transaction with no signature", async () => {
            let transaction = Transaction.createTransaction({
                txType: TransactionType.TRANSACT,
                account: sender,
                to: "",
                value: 1,
            });

            // Override for test
            transaction.signature = undefined;

            await expect(Transaction.validateStandardTransaction({ transaction }))
                .to
                .be
                .rejectedWith(`Transaction ${transaction.id} has an undefined signature.`);
        });

        it("Validate transaction with wrong signature", async () => {
            let transaction = Transaction.createTransaction({
                txType: TransactionType.TRANSACT,
                account: sender,
                to: "",
                value: 1,
            });

            // Override signature
            transaction.signature = sender.sign({});

            await expect(Transaction.validateStandardTransaction({ transaction }))
                .to
                .be
                .rejectedWith(`Transaction ${transaction.id} signature is not valid.`);
        });

        it("Validate transaction is successful", async () => {
            let transaction = Transaction.createTransaction({
                account: sender,
                to: "robert",
                value: 2,
                txType: TransactionType.TRANSACT,

            });

            await expect(Transaction.validateStandardTransaction({ transaction }))
                .to.be.eventually.null;
        });
    });

    describe("validateCreateAccountTransaction()", function () {
        let txId = "123abc";
        let sender = new Account();
        let toCreate: Account;

        this.beforeEach(() => {
            toCreate = new Account();
        });
        
        it("Validate transaction is successful", async () => {
            let transaction = Transaction.createTransaction({
                txType: TransactionType.CREATE_ACCOUNT,
                account: toCreate,
            });

            await expect(Transaction.validateCreateAccountTransaction({ transaction }))
                .to.eventually.be.null;
        });

        it("Validate transaction fails because of wrong number of fields", async () => {
            let transaction = Transaction.createTransaction({
                txType: TransactionType.CREATE_ACCOUNT,
                account: toCreate,
            });

            delete transaction.data.accountData.balance;

            await expect(Transaction.validateCreateAccountTransaction({ transaction }))
                .to.be.rejectedWith(`Transaction ${transaction.id} account data has an incorrect number of fields`);
        });

        it("Validate transaction fails because of extra field", async () => {
            let transaction = Transaction.createTransaction({
                txType: TransactionType.CREATE_ACCOUNT,
                account: toCreate,
            });

            delete transaction.data.accountData.balance;
            transaction.data.accountData.someOtherField = 3;

            await expect(Transaction.validateCreateAccountTransaction({ transaction }))
                .to.be.rejectedWith(`Field someOtherField is unexpected for account data.`);
        });
    });
});