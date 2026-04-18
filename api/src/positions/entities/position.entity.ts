import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Сущность «Должность», таблица positions в БД
 * camelCase в коде, snake_case в БД через @Column({ name: '...' })
 */
@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn({ comment: 'Уникальный идентификатор должности' })
  id!: number;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false, 
    unique: true,
    comment: 'Название должности (уникальное)',
    name: 'name'  // опционально, для единообразия
  })
  name!: string;

  @CreateDateColumn({
    type: 'timestamp',
    comment: 'Дата и время создания записи',
    name: 'created_at'
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    comment: 'Дата и время последнего обновления',
    name: 'updated_at'
  })
  updatedAt!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
    comment: 'Дата мягкого удаления (NULL = запись активна)',
    name: 'deleted_at'
  })
  deletedAt!: Date | null;
}