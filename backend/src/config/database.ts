import { createPool } from "mysql2/promise";
// import dotenv from "dotenv";
// dotenv.config();

console.log(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);

export const connect = async () => {
  // @ts-ignore
  const connection = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    //@ts-ignore
    port: process.env.DB_PORT || 3306,
  });

  return connection;
};
