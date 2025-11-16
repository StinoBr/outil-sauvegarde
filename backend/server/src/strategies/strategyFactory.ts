import { TypeSGBD } from '@prisma/client';
import type { DatabaseStrategy } from './types';
import { MysqlStrategy } from './mysqlStrategy';
import { PostgresStrategy } from './postgresStrategy';
import { MongoStrategy } from './mongoStrategy';
import { SqliteStrategy } from './sqliteStrategy';

export function buildStrategy(type: TypeSGBD): DatabaseStrategy {
  switch (type) {
    case TypeSGBD.MySQL:
      return new MysqlStrategy();
    case TypeSGBD.PostgreSQL:
      return new PostgresStrategy();
    case TypeSGBD.MongoDB:
      return new MongoStrategy();
    case TypeSGBD.SQLite:
      return new SqliteStrategy();
    default:
      throw new Error(`Type SGBD non supporté: ${type}`);
  }
}
