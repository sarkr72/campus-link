import { createConnection } from 'mysql';

const connection = createConnection({
  host: process.env.NEXT_PUBLIC_DB_HOST,
  port: 3306,
  user: process.env.NEXT_PUBLIC_DB_USER,
  password: process.env.NEXT_PUBLIC_DB_PASSWORD,
  database: process.env.NEXT_PUBLIC_DB_DATABASE
});

export default connection;
  