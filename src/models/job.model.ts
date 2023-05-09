'use strict';
import { AllowNull, Column, ForeignKey, BelongsTo, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Contract } from './contract.model';

@Table({ tableName: 'Jobs' })
export class Job extends Model {
    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true
    })
    id: number;

    @AllowNull(false)
    @Column({ type: DataType.TEXT })
    description: string;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL(12, 2) })
    price: string;

    @AllowNull(true)
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    paid?: boolean;

    @AllowNull(true)
    @Column({ type: DataType.DATE })
    paymentDate?: Date;

    @AllowNull(false)
    @ForeignKey(() => Contract)
    @Column({ type: DataType.INTEGER })
    ContractId: number;

    @BelongsTo(() => Contract)
    Contract: Contract;
}
