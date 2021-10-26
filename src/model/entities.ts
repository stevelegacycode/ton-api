import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'ton_indexer' })
export class TonIndexer {
    @PrimaryColumn({ type: 'varchar' })
    name!: string;

    @Column({ type: 'integer' })
    version!: number;

    @Column({ type: 'integer' })
    seq!: number;
}

export const allEntities = [TonIndexer];