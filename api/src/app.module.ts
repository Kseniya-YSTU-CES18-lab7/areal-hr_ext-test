import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { OrganizationsModule } from './organizations/organizations.module';
import { PositionsModule } from './positions/positions.module';
import { DepartmentsModule } from './departments/departments.module';
import { join } from 'path';
import { EmployeesModule } from './employees/employees.module';
import { PassportsModule } from './passports/passports.module';
import { AddressesModule } from './addresses/addresses.module';
import { FilesModule } from './files/files.module';
import { HrOperationsModule } from './hr-operations/hr-operations.module';
import { HistoryModule } from './history/history.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Путь к .env в корне проекта
      envFilePath: [join(process.cwd(), '..', '.env')],
      load: [databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = config.get<TypeOrmModuleOptions>('database');
        
        if (!dbConfig) {
          throw new Error('Ошибка: конфигурация базы данных не найдена. Проверь .env файл');
        }
        
        return dbConfig;
      },
    }),

    OrganizationsModule,
    PositionsModule,
    DepartmentsModule,
    EmployeesModule,
    PassportsModule,
    AddressesModule,
    FilesModule,
    HrOperationsModule,
    HistoryModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [TypeOrmModule],
})
export class AppModule {}
