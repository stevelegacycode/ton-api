import { EntityManager } from "typeorm";
import { TonBlockEntity } from "../../model/entities";
import { TonBlock } from "../../ton/fetchBlock";

export async function indexBlockTx(tx: EntityManager, blocks: TonBlock[]) {
    await Promise.all(blocks.map(async (block) => {

        // Calculate stats
        let stat_tx = 0;
        let stat_tx_mc = 0;
        let stat_tx_wc = 0;
        for (let s of block.shards) {
            stat_tx += s.transactions.length;
            if (s.workchain === -1) {
                stat_tx_mc += s.transactions.length;
            }
            if (s.workchain === 0) {
                stat_tx_wc += s.transactions.length;
            }
        }

        // Update block stats
        let bl = await tx.findOne(TonBlockEntity, block.seqno);
        if (!bl) {
            await tx.insert(TonBlockEntity, {
                seq: block.seqno,
                stat_tx,
                stat_tx_mc,
                stat_tx_wc
            });
        } else {
            bl.stat_tx = stat_tx;
            bl.stat_tx_mc = stat_tx_mc;
            bl.stat_tx_wc = stat_tx_wc;
            await tx.save(bl);
        }
    }));
}