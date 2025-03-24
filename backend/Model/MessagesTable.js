import {pool} from '../Database.js';

export const CreateMessagesTable = ()=>{
  try{
    
    const query = `CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(800) NOT NULL,
    user_id INT,  -- Can be NULL for AI messages
    message TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'model')),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`
    
    
    
     pool.query(query,(err,result)=>{
  if(err){
    console.log(err)
    console.log("Table creation error")
    return;
  }
  console.log(result.rows)
  console.log("Updated MEssages table has been created")
})
  }catch(error){
    throw error;
  }
}
CreateMessagesTable();