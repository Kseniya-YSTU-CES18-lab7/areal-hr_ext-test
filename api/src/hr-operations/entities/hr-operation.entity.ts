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
  id!: number;

  // Внешний ключ для связи с сотрудником
  @Column({ type: 'uuid', nullable: false, name: 'employee_id' })
  employeeId!: string;

  // Связь с сотрудником (у одного сотрудника может быть много операций)
  @ManyToOne(() => Employee, (employee) => employee.operations)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  // Тип операции: hire, change_salary, change_department, dismissal
  @Column({ type: 'varchar', length: 50, nullable: false, name: 'operation_type' })
  operationType!: string;

  // Внешний ключ на отдел (для hire/change_department)
  @Column({ type: 'integer', nullable: true, name: 'department_id' })
  departmentId!: number | null;

  // Связь с отделом (при удалении отдела — поле становится NULL)
  @ManyToOne(() => Department, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department!: Department | null;

  // Внешний ключ на должность (для hire)
  @Column({ type: 'integer', nullable: true, name: 'position_id' })
  positionId!: number | null;

  // Связь с должностью (при удалении должности — поле становится NULL)
  @ManyToOne(() => Position, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'position_id' })
  position!: Position | null;

  // Новая зарплата (для hire/change_salary)
  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true, name: 'salary' })
  salary!: number | null;

  // Дата операции (когда произошло событие)
  @Column({ type: 'date', nullable: false, name: 'operation_date' })
  operationDate!: Date;

  // Дата и время создания записи
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Дата и время последнего обновления
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Дата мягкого удаления (NULL = запись активна)
  @Column({ type: 'timestamp', nullable: true, default: null, name: 'deleted_at' })
  deletedAt!: Date | null;
}