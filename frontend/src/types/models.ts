// Этот файл будет импортирован в services/organizations.ts - OrganizationsPage.vue

// === БАЗОВЫЕ ПОЛЯ ДЛЯ ВСЕХ СУЩНОСТЕЙ ===
// Используется в: Organization, Department, Position, Employee...
export interface BaseEntity {
  id: number | string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// === ОРГАНИЗАЦИИ ===
// Используется в: services/organizations.ts, OrganizationsPage.vue
export interface Organization extends BaseEntity {
  name: string;
  comment: string | null;
}

export interface OrganizationCreateDto {
  name: string;
  comment?: string;
}

export interface OrganizationUpdateDto {
  name?: string;
  comment?: string;
}

// === ОТДЕЛЫ ===
// Используется в: services/departments.ts, DepartmentsPage.vue
export interface Department extends BaseEntity {
  name: string;
  comment: string | null;
  organizationId: number;  // camelCase как на бэкенде 
  parentId: number | null;
  children?: Department[]; // для дерева
}

export interface DepartmentCreateDto {
  name: string;
  organizationId: number;
  parentId?: number | null;
  comment?: string;
}

export interface DepartmentUpdateDto {
  name?: string;
  parentId?: number | null;
  comment?: string;
}

// === ДОЛЖНОСТИ ===
// Используется в: services/positions.ts, PositionsPage.vue
export interface Position extends BaseEntity {
  name: string;
}

export interface PositionCreateDto {
  name: string;
}

export interface PositionUpdateDto {
  name?: string;
}

// === ОТВЕТ С ПАГИНАЦИЕЙ ===
// Используется во всех сервисах для getList-методов
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// === ОШИБКА ВАЛИДАЦИИ ===
// Используется в api.ts для обработки ошибок
export interface ValidationError {
  property: string;
  constraints: Record<string, string>;
}

export interface ApiError {
  statusCode: number;
  message: string | ValidationError[];
  error?: string;
  timestamp?: string;
  path?: string;
}

// === СОТРУДНИКИ ===
// Используется в: services/employees.ts, EmployeesPage.vue
export interface Employee extends BaseEntity {
  id: string;
  surname: string;
  firstName: string;
  patronymic: string | null;
  birthDate: string | null;
}

export interface EmployeeCreateDto {
  surname: string;
  firstName: string;
  patronymic?: string | null;
  birthDate?: string | null;
}

export interface EmployeeUpdateDto {
  surname?: string;
  firstName?: string;
  patronymic?: string | null;
  birthDate?: string | null;
}

// === ПАСПОРТА ===
// Используется в: services/passports.ts
export interface Passport extends BaseEntity {
  id: number;
  employeeId: string;
  series: string;
  number: string;
  issueDate: string | null;
  departmentCode: string | null;
  issuedBy: string | null;
}

export interface PassportCreateDto {
  employeeId: string;
  series: string;
  number: string;
  issueDate?: string | null;
  departmentCode?: string | null;
  issuedBy?: string | null;
}

export interface PassportUpdateDto {
  series?: string;
  number?: string;
  issueDate?: string | null;
  departmentCode?: string | null;
  issuedBy?: string | null;
}

// === АДРЕСА ===
// Используется в: services/addresses.ts
export interface Address extends BaseEntity {
  id: number;
  employeeId: string;
  region: string | null;
  locality: string | null;
  street: string | null;
  house: string | null;
  building: string | null;
  apartment: string | null;
}

export interface AddressCreateDto {
  employeeId: string;
  region?: string | null;
  locality?: string | null;
  street?: string | null;
  house?: string | null;
  building?: string | null;
  apartment?: string | null;
}

export interface AddressUpdateDto {
  region?: string | null;
  locality?: string | null;
  street?: string | null;
  house?: string | null;
  building?: string | null;
  apartment?: string | null;
}

// === ФАЙЛЫ ===
// Используется в: services/files.ts
export interface File extends BaseEntity {
  id: number;
  employeeId: string;
  title: string;
  filePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
}

export interface FileCreateDto {
  employeeId: string;
  title: string;
}

export interface FileUpdateDto {
  title?: string;
}

// === КАДРОВЫЕ ОПЕРАЦИИ ===
// Используется в: services/hr-operations.ts
export interface HrOperation extends BaseEntity {
  id: number;
  employeeId: string;
  departmentId: number | null;
  positionId: number | null;
  salary: number | null;
  operationDate: string;
  operationType: 'hire' | 'change_salary' | 'change_department' | 'dismissal';
}

export interface HrOperationCreateDto {
  employeeId: string;
  departmentId?: number | null;
  positionId?: number | null;
  salary?: number | null;
  operationDate: string;
  operationType: 'hire' | 'change_salary' | 'change_department' | 'dismissal';
}

export interface HrOperationUpdateDto {
  departmentId?: number | null;
  positionId?: number | null;
  salary?: number | null;
  operationDate?: string;
  operationType?: 'hire' | 'change_salary' | 'change_department' | 'dismissal';
}

// === ИСТОРИЯ ===
// Используется в: services/history.ts
export interface History extends BaseEntity {
  id: number;
  userId: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  operationType: 'create' | 'update' | 'delete';
}

export interface HistoryCreateDto {
  userId: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  oldValue?: string | null;
  newValue?: string | null;
  operationType: 'create' | 'update' | 'delete';
}

// === ФОРМЫ ДЛЯ КОМПОНЕНТОВ ===
// Эти типы используются в Vue-компонентах для форм
export interface OrganizationForm {
  id?: number;
  name: string;
  comment: string;
}

export interface DepartmentForm {
  id?: number;
  name: string;
  organizationId: number;
  parentId: number | null;
  comment: string;
}

export interface PositionForm {
  id?: number;
  name: string;
}

export interface EmployeeForm {
  id?: string;
  surname: string;
  firstName: string;
  patronymic: string;
  birthDate: string;
}