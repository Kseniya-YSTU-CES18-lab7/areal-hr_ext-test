import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

/**
 * Сущность «История изменений» (таблица history)
 */
@Entity('history')
export class History {
  @PrimaryGeneratedColumn()
  id!: number;

  // ID пользователя, который сделал изменение
  // Пока так, позже добавлю связь с users
  @Column({ 
    nullable: false, 
    name: 'user_id' 
  })
  userId!: string;

  // Связь с пользователем (много записей истории - один пользователь)
  @ManyToOne(() => User, (user) => user.history)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Тип изменённой сущности (Organization, Department, Position, Employee, HROperation, File)
  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: false,
    name: 'entity_type'
  })
  entityType!: string;

  // ID изменённой записи (TEXT для поддержки UUID и SERIAL)
  @Column({ type: 'text', nullable: false, name: 'entity_id' })
  entityId!: string;

  // Название изменённого поля
  @Column({ type: 'varchar', length: 100, nullable: false, name: 'field_name' })
  fieldName!: string;

  // Старое значение (NULL при создании записи)
  @Column({ type: 'text', nullable: true, name: 'old_value' })
  oldValue!: string | null;

  // Новое значение (NULL при удалении записи)
  @Column({ type: 'text', nullable: true, name: 'new_value' })
  newValue!: string | null;

  // Тип операции: create, update, delete
  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: false,
    name: 'operation_type'
  })
  operationType!: string;

  // Дата и время создания записи (когда произошло изменение)
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  @Expose()
  createdAt!: Date;

  // Дата и время последнего обновления (автоматически)
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  @Expose()
  updatedAt!: Date;
}