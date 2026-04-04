import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

/**
 * Сущность «Файлы» (таблица files)
 * Связь с сотрудником: N:1 (у одного сотрудника может быть много файлов)
 */
@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  // Внешний ключ для связи с сотрудником
  @Column({ type: 'uuid', nullable: false })
  employee_id: string;

  // Связь с сотрудником (при удалении сотрудника удаляются и его файлы)
  @ManyToOne(() => Employee, (employee) => employee.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Оригинальное имя файла (обязательное поле)
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  // Путь к файлу на сервере (обязательное поле)
  @Column({ type: 'varchar', length: 500, nullable: false })
  file_path: string;

  // MIME-тип файла (например, image/jpeg) — необязательное поле
  @Column({ type: 'varchar', length: 100, nullable: true })
  mime_type: string | null;

  // Размер файла в байтах — необязательное поле
  @Column({ type: 'bigint', nullable: true })
  size_bytes: number | null;

  // Дата и время загрузки файла
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // Дата мягкого удаления (NULL = запись активна)
  @Column({ type: 'timestamp', nullable: true, default: null })
  deleted_at: Date | null;
}