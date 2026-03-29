import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Сущность «Должность», таблица positions в БД
 */
@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn({ comment: 'Уникальный идентификатор должности' })
  id: number;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false, 
    unique: true,
    comment: 'Название должности (уникальное)'
  })
  name: string;

  @CreateDateColumn({ 
    type: 'timestamp',
    comment: 'Дата и время создания записи'
  })
  created_at: Date;

  @UpdateDateColumn({ 
    type: 'timestamp',
    comment: 'Дата и время последнего обновления'
  })
  updated_at: Date;

  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    default: null,
    comment: 'Дата мягкого удаления (NULL = запись активна)'
  })
  deleted_at: Date | null;
}