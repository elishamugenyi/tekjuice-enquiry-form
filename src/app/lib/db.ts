import { createPool } from '@vercel/postgres';

export const db = createPool({
    connectionString: process.env.DATABASE_URL, //use the main connection URL
    ssl: {
        rejectUnauthorized: false, //required for neonDB
    },
});

//Test connection