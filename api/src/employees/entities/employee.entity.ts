import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
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

  @Column({ type: 'varchar', length: 100, nullable: false, name: 'surname' })
  surname: string;

  @Column({ type: 'varchar', length: 100, nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'patronymic' })
  patronymic: string | null;

  @Column({ type: 'date', nullable: true, name: 'birth_date' })
  birthDate: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null, name: 'deleted_at' })
  deletedAt: Date | null;

  // Связь 1:1 с паспортом (FK находится в Passport, поэтому @JoinColumn здесь не нужен)
  @OneToOne(() => Passport, (passport) => passport.employee, { cascade: true })
  passport: Passport;

  // Связь 1:1 с адресом (FK находится в Address, поэтому @JoinColumn здесь не нужен)
  @OneToOne(() => Address, (address) => address.employee, { cascade: true })
  address: Address;

  // Связь 1:N с файлами
  @OneToMany(() => File, (file) => file.employee)
  files: File[];

  // Связь 1:N с кадровыми операциями
  @OneToMany(() => HrOperation, (op) => op.employee)
  operations: HrOperation[];
}