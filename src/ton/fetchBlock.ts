import DataLoader from "dataloader";
import { Address, TonTransaction } from "ton";
import { fetchTransaction } from "./fetchTransaction";
import { tonClient } from "./tonClient";

type TonShardDef = {
    workchain: number;
    shard: string;
    seqno: number;
};

export type TonShard = {
    workchain: number;
    shard: string;
    seqno: number;
    transactions: { address: Address, tx: TonTransaction }[];
}

export type TonBlock = {
    seqno: number;
    shards: TonShard[];
}

const shardsLoader = new DataLoader<number, TonShardDef[]>(async (src) => {
    return await Promise.all(src.map(async (seqno) => {
        return await tonClient.getWorkchainShards(seqno);
    }));
});

const shardLoader = new DataLoader<TonShardDef, TonShard, string>(async (src) => {
    return Promise.all(src.map(async (def) => {
        let tx = await tonClient.getShardTransactions(-1, 0, '-9223372036854775808');
        let transactions = await Promise.all(tx.map(async (v) => ({ address: v.account, tx: await fetchTransaction(v.account, v.lt, v.hash) })));
        return {
            workchain: def.workchain,
            seqno: def.seqno,
            shard: def.shard,
            transactions
        }
    }));
}, { cacheKeyFn: (src) => src.workchain + ':' + src.shard + ':' + src.shard });

const blockLoader = new DataLoader<number, TonBlock>(async (src) => {
    return Promise.all(src.map(async (seqno) => {

        // Load shard defs
        let shardDefs = await shardsLoader.load(seqno);
        shardDefs = [{ workchain: -1, seqno, shard: '-9223372036854775808' }, ...shardDefs];

        // Load shards
        let shards = await Promise.all(shardDefs.map((shard) => {
            return shardLoader.load(shard);
        }));

        return {
            seqno,
            shards
        };
    }));
});

export function fetchBlock(seqno: number) {
    return blockLoader.load(seqno);
}