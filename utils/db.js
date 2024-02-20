import { createConnection } from 'mysql';

const connection = createConnection({
  host: "seniorprojectsql.cru0e6m8wvz4.us-east-2.rds.amazonaws.com",
  user: "admin",
  password: "Spring_2024",
  database: "seniorprojectsql"
});

export default connection;
  