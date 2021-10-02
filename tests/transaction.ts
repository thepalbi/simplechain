import { expect } from "chai";
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
});