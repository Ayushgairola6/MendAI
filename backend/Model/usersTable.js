import {pool} from '../Database.js';

export const CreateUsersTable = ()=>{
  try{
    const query = `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    dob DATE
)`;

     pool.query(query,(err,result)=>{
        if(err){
            console.log(err);
            return;
        }
        console.log("UsersTable has been created");
     })
  }catch(error){
    throw error;
  }
}
CreateUsersTable();