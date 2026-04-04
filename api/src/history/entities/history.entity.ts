import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * Сущность «История изменений» (таблица history)
 */
@Entity('history')
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  // ID пользователя, который сделал изменение
  // Связь с User будет добавлена позже (неделя 5-6), когда создадим таблицу users
  @Column({ type: 'uuid', nullable: false, name: 'user_id' })
  userId: string;

  // Тип изменённой сущности (Organization, Department, Position, Employee, HROperation)
  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: false,
    name: 'entity_type'
  })
  entityType: string;

  // ID изменённой записи (TEXT для поддержки UUID и SERIAL)
  @Column({ type: 'text', nullable: false, name: 'entity_id' })
  entityId: string;

  // Название изменённого поля
  @Column({ type: 'varchar', length: 100, nullable: false, name: 'field_name' })
  fieldName: string;

  // Старое значение (NULL при создании записи)
  @Column({ type: 'text', nullable: true, name: 'old_value' })
  oldValue: string | null;

  // Новое значение (NULL при удалении записи)
  @Column({ type: 'text', nullable: true, name: 'new_value' })
  newValue: string | null;

  // Тип операции: create, update, delete
  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: false,
    name: 'operation_type'
  })
  operationType: string;

  // Дата и время создания записи (когда произошло изменение)
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Дата и время последнего обновления (автоматически)
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;
}