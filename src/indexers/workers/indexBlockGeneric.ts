import { EntityManager } from "typeorm";
import { TonBlock } from "../../ton/fetchBlock";

export async function indexBlockGeneric(tx: EntityManager, blocks: TonBlock[]) {
    for (let b of blocks) {
        console.log('Indexing block: ' + b.seqno);
    }
}