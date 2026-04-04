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
  @Column({ type: 'uuid', nullable: false, unique: true })
  employee_id: string;

  // Связь с сотрудником (при удалении сотрудника удаляется и паспорт)
  @OneToOne(() => Employee, (employee) => employee.passport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Серия паспорта (обязательное поле)
  @Column({ type: 'varchar', length: 10, nullable: false })
  series: string;

  // Номер паспорта (обязательное поле)
  @Column({ type: 'varchar', length: 10, nullable: false })
  number: string;

  // Дата выдачи (необязательное поле)
  @Column({ type: 'date', nullable: true })
  issue_date: Date | null;

  // Код подразделения (необязательное поле)
  @Column({ type: 'varchar', length: 10, nullable: true })
  department_code: string | null;

  // Кем выдан (необязательное поле)
  @Column({ type: 'varchar', length: 255, nullable: true })
  issued_by: string | null;

  // Дата и время создания записи
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // Дата и время последнего обновления
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Дата мягкого удаления (NULL = запись активна)
  @Column({ type: 'timestamp', nullable: true, default: null })
  deleted_at: Date | null;
}