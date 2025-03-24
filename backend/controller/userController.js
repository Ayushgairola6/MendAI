import { pool } from "../Database.js";


export const GetAccountData = (req,res)=>{
    try {
        const UserId = req.user.userId;
        
        if(!UserId){
            return res.status(400).json({success:true,message:"No session Id found"});
        }
       
        const query = `SELECT * FROM users WHERE id = $1`;
        pool.query(query,[UserId],(err,result)=>{
            if(err){
                return res.status(500).json({success:false,message:"Internal server error! "})
            }
            if(result.rows.length>0){
                console.log(result.rows);
                return res.status(200).json({success:true,message:result.rows[0]});
            }else{
                return res.status(404).json({success:true,message:"User not found!"});
            }
        })


    } catch (error) {
        console.log(error);
    }
}