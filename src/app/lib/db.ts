import mysql from 'mysql2/promise';


type ParamValue = string | number | boolean | null | Date | Buffer;

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

export async function query(sql: string, params?: ParamValue[] | ParamValue[][]) {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}


export async function queryWithValues<T extends ParamValue[]>(sql: string, params?: T) {
  return query(sql, params);
}