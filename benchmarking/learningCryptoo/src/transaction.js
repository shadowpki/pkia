"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
class Transaction {
    constructor(amount, payer, recipient) {
        this.amount = amount;
        this.payer = payer;
        this.recipient = recipient;
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.Transaction = Transaction;
