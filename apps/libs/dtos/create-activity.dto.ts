import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
}

export enum EntityType {
  USER = 'USER',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
  CLASS = 'CLASS',
  SUBJECT = 'SUBJECT',
  ASSIGNMENT = 'ASSIGNMENT',
  GRADE = 'GRADE',
  ATTENDANCE = 'ATTENDANCE',
  SCHOOL_SETTINGS = 'SCHOOL_SETTINGS',
}

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(Role)
  @IsNotEmpty()
  userRole: Role;

  @IsString()
  @IsOptional()
  username?: string;

  @IsEnum(ActionType)
  @IsNotEmpty()
  action: ActionType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(EntityType)
  @IsNotEmpty()
  entityType: EntityType;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}
