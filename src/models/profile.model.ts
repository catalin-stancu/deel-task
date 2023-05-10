'use strict';
import { AllowNull, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { PROFILE_TYPE } from '../enums/enums';
import { Contract } from './contract.model';

// We are using the built in feature of Optimistic locking from sequelize.
// An alternative would be an eTag
@Table({ tableName: 'Profiles', version: true })
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

      @AllowNull(false)
      @Column({
        type: DataType.INTEGER,
        defaultValue: 0
      })
        version: number;

    @HasMany(() => Contract, 'ClientId')
      clientContracts: Contract[];

    @HasMany(() => Contract, 'ContractorId')
      contractorContracts: Contract[];
}
