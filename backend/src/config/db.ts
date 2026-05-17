import { PrismaClient } from '@prisma/client';

import path from 'path';

let databaseUrl = process.env.DATABASE_URL;

// Path to the bundled database
const bundledDbPath = path.join(__dirname, '../../prisma/quran.db');


databaseUrl = `file:${bundledDbPath}`;


console.log('Final DATABASE_URL:', databaseUrl);
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

export default prisma;

