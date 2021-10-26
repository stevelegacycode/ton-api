import { EntityManager } from "typeorm";
import { inTx } from "../inTx";
import { backoff, delay } from '@openland/patterns';
import { fetchBlock, TonBlock } from "../ton/fetchBlock";
import { indexBlockGeneric } from "./workers/indexBlockGeneric";
import { TonIndexer } from "../model/entities";

function startIndexer(name: string, version: number, handler: (tx: EntityManager, block: TonBlock) => Promise<void>) {
    backoff(async () => {
        while (true) {

            // Do iteration
            await inTx(async (tx) => {

                // Resolve cursor
                let seqno: number;
                let indexer = await tx.findOne(TonIndexer, { where: { name } });
                if (!indexer) {
                    seqno = 1;
                    await tx.insert(TonIndexer, { name, version, seq: 1 });
                } else if (indexer.version === version) {
                    seqno = indexer.seq + 1;
                    indexer.seq++;
                    await tx.save(indexer);
                } else if (indexer.version < version) {
                    seqno = 1;
                    indexer.seq = 1;
                    indexer.version = version;
                    await tx.save(indexer);
                } else {
                    throw Error('Incompatible version');
                }

                // Load block
                let block = await fetchBlock(seqno);

                // Handle
                await handler(tx, block);
            });

            // Delay
            await delay(1000);
        }
    });
}

export async function startIndexers() {
    console.log('Starting indexers');
    startIndexer('block_generic', 1, indexBlockGeneric);
}