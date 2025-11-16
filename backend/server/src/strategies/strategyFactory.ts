import type { TypeSGBD } from '@prisma/client';
import { TypeSGBD as PrismaTypeSGBD } from '../utils/db';
import type { DatabaseStrategy } from './types';
import { MysqlStrategy } from './mysqlStrategy';
import { PostgresStrategy } from './postgresStrategy';
import { MongoStrategy } from './mongoStrategy';
import { SqliteStrategy } from './sqliteStrategy';

export function buildStrategy(type: TypeSGBD): DatabaseStrategy {
  switch (type) {
    case PrismaTypeSGBD.MySQL:
      return new MysqlStrategy();
    case PrismaTypeSGBD.PostgreSQL:
      return new PostgresStrategy();
    case PrismaTypeSGBD.MongoDB:
      return new MongoStrategy();
    case PrismaTypeSGBD.SQLite:
      return new SqliteStrategy();
    default:
      throw new Error(`Type SGBD non supporté: ${type}`);
  }
}
