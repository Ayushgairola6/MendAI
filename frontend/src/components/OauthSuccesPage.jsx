import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
export default function OAuthSuccess({isLoggedIn,setIsLoggedIn,handelAccountDetails}) {
  const navigate = useNavigate();

  useEffect(()=>{
        const Verify = async ()=>{
          try{
          const response = await axios.get("https://mendai.onrender.com/api/verify/account",{withCredentials:true});
          if (response.data.message === "authorized") {
            setIsLoggedIn(true);
            handelAccountDetails(); 
          }
        }catch(error){
            throw new Error(error);
          }
        }
        Verify();
        if(isLoggedIn===true){
            navigate("/")
        }
      },[isLoggedIn])

  return (
    <div className="flex justify-center items-center h-screen text-xl">
      Redirecting you to your dashboard...
    </div>
  );
}
