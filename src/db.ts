import {createPool,Pool, QueryResult} from 'mysql2/promise';
import { config } from 'dotenv';

config();

const sqlPool:Pool = createPool({
    host:process.env.MYSQL_HOST,
    user:process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database:process.env.MYSQL_DATABASE,
    waitForConnections:true,
    connectionLimit:10,
    queueLimit:0
})

const executeQuery = async ( sql:string,params:any[]=[]): Promise<QueryResult>=>{
  
    const connection = await sqlPool.getConnection();
    try{
        const [rows] = await connection.execute(sql,params);
        return rows;
    }finally{
        connection.release();
    }
}
export default executeQuery;