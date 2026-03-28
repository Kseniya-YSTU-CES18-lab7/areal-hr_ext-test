import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

/**
 * Сущность Department (Отдел)
 */
@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn({ comment: 'Уникальный идентификатор отдела' })
  id: number;

  @Column({ type: 'integer', nullable: false, comment: 'ID организации (внешний ключ)' })
  organization_id: number;

  @ManyToOne(() => Organization, (org) => org.departments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'integer', nullable: true, comment: 'ID родительского отдела (для вложенности)' })
  parent_id: number | null;

  @ManyToOne(() => Department, (dept) => dept.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Department | null;

  @OneToMany(() => Department, (dept) => dept.parent)
  children: Department[];

  @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Название отдела' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: 'Примечание' })
  comment: string | null;

  @CreateDateColumn({ type: 'timestamp', comment: 'Дата и время создания записи' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: 'Дата и время последнего обновления' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true, default: null, comment: 'Дата мягкого удаления (NULL = активна)' })
  deleted_at: Date | null;
}