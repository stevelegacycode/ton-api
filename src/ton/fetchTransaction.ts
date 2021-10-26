import DataLoader from "dataloader";
import { Address, TonTransaction } from "ton";
import { tonClient } from "./tonClient";

const dl = new DataLoader<{ address: Address, lt: string, hash: string }, TonTransaction, string>(async (src) => {
    return await Promise.all(src.map(async (tx) => (await tonClient.getTransaction(tx.address, tx.lt, tx.hash))!));
}, { cacheKeyFn: (src) => src.address.toFriendly() + ':' + src.lt + ':' + src.hash });

export async function fetchTransaction(address: Address, lt: string, hash: string) {
    return dl.load({ address, lt, hash });
}