'use strict';
import { AllowNull, Column, HasMany, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Contract } from './contract.model';
import { PROFILE_TYPE } from '../enums/enums';

@Table({ tableName: 'Profiles' })
export class Profile extends Model {
    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true
    })
    id: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    firstName: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    lastName: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    profession: string;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL(12, 2) })
    balance: string;

    @AllowNull(false)
    @Column({ type: DataType.ENUM(PROFILE_TYPE.CLIENT, PROFILE_TYPE.CONTRACTOR) })
    type: PROFILE_TYPE;

    @HasMany(() => Contract, 'ClientId')
    clientContracts: Contract[];

    @HasMany(() => Contract, 'ContractorId')
    contractorContracts: Contract[];
}
