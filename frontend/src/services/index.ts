// Экспортируем все сервисы сразу, удобнее для импорта

export { api } from '../boot/axios'
export { organizationsService } from './organizations'
export { departmentsService } from './departments'
export { positionsService } from './positions'
export { employeesService } from './employees'
export { passportsService } from './passports'
export { addressesService } from './addresses'
export { filesService } from './files'
export { hrOperationsService } from './hr-operations'
export { historyService } from './history'