import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Department } from '../../departments/entities/department.entity';
import { Position } from '../../positions/entities/position.entity';

/**
 * Сущность «Кадровые операции» (таблица hr_operations)
  */
@Entity('hr_operations')
export class HrOperation {
  @PrimaryGeneratedColumn()
  id: number;

  // Внешний ключ для связи с сотрудником
  @Column({ type: 'uuid', nullable: false })
  employee_id: string;

  // Связь с сотрудником (у одного сотрудника может быть много операций)
  @ManyToOne(() => Employee, (employee) => employee.operations)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Тип операции: hire, change_salary, change_department, dismissal
  @Column({ type: 'varchar', length: 50, nullable: false })
  operation_type: string;

  // Внешний ключ на отдел (для hire/change_department)
  @Column({ type: 'integer', nullable: true })
  department_id: number | null;

  // Связь с отделом (при удалении отдела — поле становится NULL)
  @ManyToOne(() => Department, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  // Внешний ключ на должность (для hire)
  @Column({ type: 'integer', nullable: true })
  position_id: number | null;

  // Связь с должностью (при удалении должности — поле становится NULL)
  @ManyToOne(() => Position, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'position_id' })
  position: Position | null;

  // Новая зарплата (для hire/change_salary)
  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  salary: number | null;

  // Дата операции (когда произошло событие)
  @Column({ type: 'date', nullable: false })
  operation_date: Date;

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