import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'ton_indexer' })
export class TonIndexerEntity {
    @PrimaryColumn({ type: 'varchar' })
    name!: string;

    @Column({ type: 'integer' })
    version!: number;

    @Column({ type: 'integer' })
    seq!: number;
}



@Entity({ name: 'ton_block' })
export class TonBlockEntity {
    @PrimaryColumn({ type: 'integer' })
    seq!: number;

    @Column({ type: 'integer' })
    stat_tx!: number;

    @Column({ type: 'integer' })
    stat_tx_mc!: number;

    @Column({ type: 'integer' })
    stat_tx_wc!: number;

    @Column({ type: 'integer' })
    stat_wallets!: number;
}


export const allEntities = [TonIndexerEntity, TonBlockEntity];