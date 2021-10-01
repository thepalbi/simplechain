import { expect } from "chai";
import { Account } from "../account";

describe("Account", function () {
    describe("verifySignature()", function () {
        let acct1 = new Account();
        let acct2 = new Account();
        let someData = { hola: 1, menta: "bebe" };
        it("Signing and verifying with same account", () => {
            const signature = acct1.sign(someData);
            expect(Account.verifySignature({
                publicKey: acct1.address,
                data: someData,
                signature: signature,
            })).to.be.true;
        });

        it("Signing with acct 1 and verifying with acct2 should fail", () => {
            const signature = acct1.sign(someData);
            expect(Account.verifySignature({
                publicKey: acct2.address,
                data: someData,
                signature: signature,
            })).to.be.false;
        });

        it("Signing with acct 1 and verifying different data should fail", () => {
            const signature = acct1.sign(someData);
            expect(Account.verifySignature({
                publicKey: acct1.address,
                data: { someOther: "data" },
                signature: signature,
            })).to.be.false;
        });
    });

    describe("toJSON()", function () {
        let acct1 = new Account();

        it("Serializing an account hides keyPair", function () {
            const serialized = acct1.toJSON();
            expect(Object.keys(serialized)).not.contains("keyPair");
            expect(serialized.address).to.be.equal(acct1.address);
            expect(serialized.balance).to.be.equal(acct1.balance);
        })
    });
});