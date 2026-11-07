import {PrismaBetterSQLite3} from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
const g=globalThis as unknown as {db:PrismaClient};
export const db=g.db||new PrismaClient({adapter:new PrismaBetterSQLite3({url:"file:./prisma/tomtube.db"})}); if(process.env.NODE_ENV!=='production')g.db=db;
