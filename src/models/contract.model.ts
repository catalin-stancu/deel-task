'use strict';
import { AllowNull, Column, ForeignKey, HasMany, BelongsTo, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Profile } from './profile.model';
import { Job } from './job.model';

@Table({ tableName: 'Contracts' })
export class Contract extends Model {
    @PrimaryKey
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true
    })
      id: number;

    @AllowNull(false)
    @Column({ type: DataType.TEXT })
      terms: string;

    @AllowNull(false)
    @Column({ type: DataType.ENUM('new', 'in_progress', 'terminated') })
      status: string;

    @AllowNull(false)
    @ForeignKey(() => Profile)
    @Column({ type: DataType.INTEGER })
      ClientId: number;

    @AllowNull(false)
    @ForeignKey(() => Profile)
    @Column({ type: DataType.INTEGER })
      ContractorId: number;

    @BelongsTo(() => Profile, 'ClientId')
      Client: Profile;

    @BelongsTo(() => Profile, 'ContractorId')
      Contractor: Profile;

    @HasMany(() => Job, 'ContractId')
      Jobs: Job[];
}
