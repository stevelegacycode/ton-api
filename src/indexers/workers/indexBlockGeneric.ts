import { EntityManager } from "typeorm";
import { TonBlock } from "../../ton/fetchBlock";

export async function indexBlockGeneric(tx: EntityManager, block: TonBlock) {
    console.log('Indexing block: ' + block.seqno);
}