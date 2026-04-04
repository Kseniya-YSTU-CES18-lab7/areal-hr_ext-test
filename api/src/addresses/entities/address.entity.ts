import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

/**
 * Сущность «Адрес регистрации» (таблица addresses)
 * Связь с сотрудником: 1:1
 */
@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  // Внешний ключ для связи с сотрудником (уникальный — 1:1)
  @Column({ type: 'uuid', nullable: false, unique: true, name: 'employee_id' })
  employeeId: string;

  // Связь с сотрудником (при удалении сотрудника удаляется и адрес)
  @OneToOne(() => Employee, (employee) => employee.address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Область/край (необязательное поле)
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'region' })
  region: string | null;

  // Населенный пункт (необязательное поле)
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'locality' })
  locality: string | null;

  // Улица (необязательное поле)
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'street' })
  street: string | null;

  // Дом (необязательное поле)
  @Column({ type: 'varchar', length: 20, nullable: true, name: 'house' })
  house: string | null;

  // Корпус (необязательное поле)
  @Column({ type: 'varchar', length: 20, nullable: true, name: 'building' })
  building: string | null;

  // Квартира (необязательное поле)
  @Column({ type: 'varchar', length: 20, nullable: true, name: 'apartment' })
  apartment: string | null;

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