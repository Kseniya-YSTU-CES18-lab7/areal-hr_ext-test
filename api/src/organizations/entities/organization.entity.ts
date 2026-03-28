import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Сущность «Организация», таблица organizations в БД
 */

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn({ comment: 'Уникальный идентификатор организации' })
  id: number;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false,
    comment: 'Полное наименование организации'
  })
  name: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: 'Произвольные заметки об организации'
  })
  comment: string | null;

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