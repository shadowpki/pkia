import * as crypto from 'crypto'
import { Transaction } from './transaction'

//// TODO: Blocks should have more than one transaction within them

class Block {

  public nonce = Math.round(Math.random() * 999999999)

  constructor(
    public prevHash: string,
    public transactions: []Transaction,
  ) {}

  get hash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash('SHA256');
    hash.update(str).end();
    return hash.digest('hex');
  }
}

export { Block }
