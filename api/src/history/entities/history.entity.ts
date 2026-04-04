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
  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  // Тип изменённой сущности (Organization, Department, Position, Employee, HROperation)
  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: false
  })
  entity_type: string;

  // ID изменённой записи (TEXT для поддержки UUID и SERIAL)
  @Column({ type: 'text', nullable: false })
  entity_id: string;

  // Название изменённого поля
  @Column({ type: 'varchar', length: 100, nullable: false })
  field_name: string;

  // Старое значение (NULL при создании записи)
  @Column({ type: 'text', nullable: true })
  old_value: string | null;

  // Новое значение (NULL при удалении записи)
  @Column({ type: 'text', nullable: true })
  new_value: string | null;

  // Тип операции: create, update, delete
  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: false
  })
  operation_type: string;

  // Дата и время создания записи (когда произошло изменение)
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // Дата и время последнего обновления (автоматически)
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}