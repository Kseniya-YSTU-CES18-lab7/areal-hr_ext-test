import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Конфигурация Multer для загрузки файлов
 * - Уникальные имена файлов (UUID)
 * - Ограничение по типам и размеру
 * - Сохранение в папку uploads/
 */
export const multerConfig = {
  // Хранилище: диск
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Определяем папку по типу файла
      const uploadPath = file.mimetype.startsWith('image/') 
        ? 'uploads/passports' 
        : 'uploads/documents';
      cb(null, join(process.cwd(), uploadPath));
    },
    filename: (req, file, cb) => {
      // Уникальное имя: UUID + оригинальное расширение
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  
  // Фильтр файлов: разрешённые MIME-типы
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Недопустимый тип файла: ${file.mimetype}. Разрешены: ${allowedMimeTypes.join(', ')}`), false);
    }
  },
  
  // Ограничение размера: 10 МБ
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
};