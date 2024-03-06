// import { createConnection } from 'mysql';

// const connection = createConnection({
//   host: process.env.NEXT_PUBLIC_DB_HOST,
//   port: 3306,
//   user: process.env.NEXT_PUBLIC_DB_USER,
//   password: process.env.NEXT_PUBLIC_DB_PASSWORD,
//   database: process.env.NEXT_PUBLIC_DB_DATABASE
// });

// export default connection;

import mysql from "mysql2/promise";

let pool;

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.NEXT_PUBLIC_DB_HOST,
      port: 3306,
      user: process.env.NEXT_PUBLIC_DB_USER,
      password: process.env.NEXT_PUBLIC_DB_PASSWORD,
      database: process.env.NEXT_PUBLIC_DB_DATABASE,
      waitForConnections: true, 
      connectionLimit: 10, 
      queueLimit: 0
    });
  }
  return pool.getConnection();
}

// async function createConnection() {
//   const connection = await mysql.createConnection({
//     host: process.env.NEXT_PUBLIC_DB_HOST,
//     port: 3306,
//     user: process.env.NEXT_PUBLIC_DB_USER,
//     password: process.env.NEXT_PUBLIC_DB_PASSWORD,
//     database: process.env.NEXT_PUBLIC_DB_DATABASE
//   });

//   return connection;
// }

// export default createConnection;

// import { MongoClient } from 'mongodb';

// const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
// const dbName = process.env.NEXT_PUBLIC_MONGODB_DB;

// let cachedClient = null;

// async function connection() {
//     if (cachedClient) {
//         return cachedClient;
//     }

//     const client = new MongoClient(uri, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     });

//     await client.connect();
//     const db = client.db(dbName);

//     cachedClient = db;
//     return db;
// }

// export default connection;
