/**
 * Форматирует дату в читаемый русский формат
 * @param date - Date, ISO-строка или "YYYY-MM-DD"
 * @param format - 'date' (ДД.ММ.ГГГГ) или 'datetime' (ДД.ММ.ГГГГ ЧЧ:ММ)
 */
export function formatDate(
  date: Date | string | null | undefined, 
  format: 'date' | 'datetime' = 'date'
): string {
  if (!date) return '—';
  
  // Если пришла строка "YYYY-MM-DD" (без времени), добавляем время для корректного парсинга
  const dateString = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? `${date}T00:00:00`
    : date;
  
  const dateObj = new Date(dateString);
  
  // Проверка на невалидную дату
  if (isNaN(dateObj.getTime())) return '—';
  
  if (format === 'date') {
    return dateObj.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  return dateObj.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Форматирует дату строго в формате ДД.ММ.ГГГГ (для истории)
 */
export function formatDateStrict(date: Date | string | null): string {
  if (!date) return '—';
  
  const dateObj = typeof date === 'string' 
    ? new Date(date.includes('T') ? date : `${date}T00:00:00`)
    : date;
  
  if (isNaN(dateObj.getTime())) return '—';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}.${month}.${year}`;
}