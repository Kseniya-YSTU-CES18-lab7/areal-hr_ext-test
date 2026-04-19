// Файл импортируется в компонентах для валидации форм

/**
 * Тип для правила валидации Quasar
 */
export type ValidationRule = (val: any) => boolean | string

/**
 * Правило: поле обязательно
 */
export const required = (message = 'Поле обязательно'): ValidationRule => 
  (val) => !!val || message

/**
 * Правило: минимальная длина
 */
export const minLength = (min: number, message?: string): ValidationRule => 
  (val) => !val || val.length >= min || (message || `Минимум ${min} символов`)

/**
 * Правило: максимальная длина
 */
export const maxLength = (max: number, message?: string): ValidationRule => 
  (val) => !val || val.length <= max || (message || `Максимум ${max} символов`)

/**
 * Правило: только буквы и пробелы (для ФИО)
 */
export const onlyLetters: ValidationRule = 
  (val) => !val || /^[а-яА-ЯёЁa-zA-Z\s\-]+$/.test(val) || 'Только буквы, пробелы и дефис'

/**
 * Правило: валидный email
 */
export const email: ValidationRule = 
  (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Некорректный email'

/**
 * Правило: валидный телефон (Россия)
 */
export const phoneRu: ValidationRule = 
  (val) => !val || /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(val) || 'Некорректный телефон'

/**
 * Правило: дата не в будущем
 */
export const notFutureDate: ValidationRule = 
  (val) => !val || new Date(val) <= new Date() || 'Дата не может быть в будущем'

/**
 * Правило: дата не раньше 1900 года
 */
export const notTooOldDate: ValidationRule = 
  (val) => !val || new Date(val) >= new Date('1900-01-01') || 'Дата слишком старая'

// ============================================================
// НАБОРЫ ПРАВИЛ ДЛЯ ЧАСТО ИСПОЛЬЗУЕМЫХ ПОЛЕЙ
// ============================================================

/**
 * Набор правил для названия (организация, отдел, должность)
 */
export const nameRules = [
  required('Название обязательно'),
  minLength(3, 'Минимум 3 символа'),
  maxLength(255, 'Максимум 255 символов')
]

/**
 * Набор правил для комментария
 */
export const commentRules = [
  maxLength(1000, 'Максимум 1000 символов')
]

/**
 * Набор правил для фамилии
 */
export const surnameRules = [
  required('Фамилия обязательна'),
  minLength(2, 'Минимум 2 символа'),
  maxLength(100, 'Максимум 100 символов'),
  onlyLetters
]

/**
 * Набор правил для имени
 */
export const firstNameRules = [
  required('Имя обязательно'),
  minLength(2, 'Минимум 2 символа'),
  maxLength(100, 'Максимум 100 символов'),
  onlyLetters
]

/**
 * Набор правил для отчества
 */
export const patronymicRules = [
  minLength(2, 'Минимум 2 символа'),
  maxLength(100, 'Максимум 100 символов'),
  onlyLetters
]

/**
 * Набор правил для даты рождения
 */
export const birthDateRules = [
  required('Дата рождения обязательна'),
  notFutureDate,
  notTooOldDate
]

/**
 * Набор правил для серии паспорта
 */
export const passportSeriesRules = [
  minLength(4, 'Серия должна содержать 4 цифры'),
  maxLength(4, 'Серия должна содержать 4 цифры'),
  (val: string) => !val || /^\d{4}$/.test(val) || 'Только 4 цифры'
]

/**
 * Набор правил для номера паспорта
 */
export const passportNumberRules = [
  required('Номер обязателен'),
  minLength(6, 'Номер должен содержать 6 цифр'),
  maxLength(6, 'Номер должен содержать 6 цифр'),
  (val: string) => !val || /^\d{6}$/.test(val) || 'Только 6 цифр'
]

/**
 * Набор правил для адреса (область, город, улица)
 */
export const addressFieldRules = [
  required('Поле обязательно'),
  minLength(2, 'Минимум 2 символа'),
  maxLength(100, 'Максимум 100 символов')
]

/**
 * Набор правил для дома/корпуса/квартиры
 */
export const houseFieldRules = [
  required('Поле обязательно'),
  maxLength(20, 'Максимум 20 символов')
]