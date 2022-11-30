import { randomBytes } from "./random-factory";
import { CryptoWASM } from "../wasm/crypto-wasm";
import { ISecretBoxFactory, ISecretBoxKey, SECRET_BOX_CONSTANTS } from "../interfaces/i-secret-box";

export class SecretBoxFactory implements ISecretBoxFactory {
    public constants = SECRET_BOX_CONSTANTS;

    public async key(): Promise<ISecretBoxKey> {
        await CryptoWASM.ready();
        return {
            sb_secret: randomBytes(SECRET_BOX_CONSTANTS.KEY_LENGTH)
        };
    }

    public async box(msg: Uint8Array, nonce: Uint8Array, key: ISecretBoxKey): Promise<Uint8Array> {
        await CryptoWASM.ready();
        return CryptoWASM.secretbox(msg, nonce, key.sb_secret);
    }

    public async open(box: Uint8Array, nonce: Uint8Array, key: ISecretBoxKey): Promise<Uint8Array> {
        await CryptoWASM.ready();
        return CryptoWASM.secretboxOpen(box, nonce, key.sb_secret);
    }

}
