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
  @Column({ type: 'uuid', nullable: false, name: 'employee_id' })
  employeeId: string;

  // Связь с сотрудником (при удалении сотрудника удаляются и его файлы)
  @ManyToOne(() => Employee, (employee) => employee.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Оригинальное имя файла (обязательное поле)
  @Column({ type: 'varchar', length: 255, nullable: false, name: 'title' })
  title: string;

  // Путь к файлу на сервере (обязательное поле)
  @Column({ type: 'varchar', length: 500, nullable: false, name: 'file_path' })
  filePath: string;

  // MIME-тип файла (например, image/jpeg) — необязательное поле
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'mime_type' })
  mimeType: string | null;

  // Размер файла в байтах — необязательное поле
  @Column({ type: 'bigint', nullable: true, name: 'size_bytes' })
  sizeBytes: number | null;

  // Дата и время загрузки файла
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Дата мягкого удаления (NULL = запись активна)
  @Column({ type: 'timestamp', nullable: true, default: null, name: 'deleted_at' })
  deletedAt: Date | null;
}