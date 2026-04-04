import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Passport } from '../../passports/entities/passport.entity';
import { Address } from '../../addresses/entities/address.entity';
import { File } from '../../files/entities/file.entity';
import { HrOperation } from '../../hr-operations/entities/hr-operation.entity';

/**
 * Сущность «Сотрудник» (таблица employees)
  */

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  surname: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  patronymic: string | null;

  @Column({ type: 'date', nullable: true })
  birth_date: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  deleted_at: Date | null;

  // Паспортные данные (1:1)
  @OneToOne(() => Passport, (passport) => passport.employee, { cascade: true })
  @JoinColumn()
  passport: Passport;

  // Адрес регистрации (1:1)
  @OneToOne(() => Address, (address) => address.employee, { cascade: true })
  @JoinColumn()
  address: Address;

  // Файлы сотрудника (1:N)
  @OneToMany(() => File, (file) => file.employee)
  files: File[];

  // Кадровые операции (1:N)
  @OneToMany(() => HrOperation, (op) => op.employee)
  operations: HrOperation[];
}