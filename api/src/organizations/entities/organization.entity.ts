import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Department } from '../../departments/entities/department.entity';

/**
 * Сущность «Организация», таблица organizations в БД
 * Используем camelCase в коде, snake_case в БД через @Column({ name: '...' })
 */
@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn({ comment: 'Уникальный идентификатор организации' })
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Полное наименование организации',
    name: 'name'
  })
  name!: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Произвольные заметки об организации',
    name: 'comment'
  })
  comment!: string | null;

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

  // Связь с отделами (1:n)
  @OneToMany(() => Department, (department) => department.organization)
  departments!: Department[];
}