import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { History } from '../../history/entities/history.entity';

export type UserRole = 'admin' | 'manager';

/**
 * Сущность «Пользователь» (таблица users)
 * camelCase в коде, snake_case в БД через @Column({ name: '...' })
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, nullable: false, name: 'surname' })
  surname!: string;

  @Column({ type: 'varchar', length: 100, nullable: false, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'patronymic' })
  patronymic!: string | null;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: false, 
    unique: true,
    name: 'login' 
  })
  login!: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false,
    select: false, // Не возвращать пароль в запросах
    name: 'password' 
  })
  password!: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: false,
    default: 'manager',
    name: 'role' 
  })
  role!: UserRole;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    default: null, 
    name: 'deleted_at' 
  })
  deletedAt!: Date | null;

  // Связь 1:N с историей изменений
  @OneToMany(() => History, (history) => history.user)
  history!: History[];
}