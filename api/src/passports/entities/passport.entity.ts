import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

/**
 * Сущность «Паспортные данные» (таблица passports)
 * Связь с сотрудником: 1:1
 */
@Entity('passports')
export class Passport {
  @PrimaryGeneratedColumn()
  id: number;

  // Внешний ключ для связи с сотрудником (уникальный — 1:1)
  @Column({ type: 'uuid', nullable: false, unique: true, name: 'employee_id' })
  employeeId: string;

  // Связь с сотрудником (при удалении сотрудника удаляется и паспорт)
  @OneToOne(() => Employee, (employee) => employee.passport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Серия паспорта (обязательное поле)
  @Column({ type: 'varchar', length: 10, nullable: false, name: 'series' })
  series: string;

  // Номер паспорта (обязательное поле)
  @Column({ type: 'varchar', length: 10, nullable: false, name: 'number' })
  number: string;

  // Дата выдачи (необязательное поле)
  @Column({ type: 'date', nullable: true, name: 'issue_date' })
  issueDate: Date | null;

  // Код подразделения (необязательное поле)
  @Column({ type: 'varchar', length: 10, nullable: true, name: 'department_code' })
  departmentCode: string | null;

  // Кем выдан (необязательное поле)
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'issued_by' })
  issuedBy: string | null;

  // Дата и время создания записи
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Дата и время последнего обновления
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Дата мягкого удаления (NULL = запись активна)
  @Column({ type: 'timestamp', nullable: true, default: null, name: 'deleted_at' })
  deletedAt: Date | null;
}