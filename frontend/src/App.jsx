import React,{useState,useEffect} from 'react';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import './App.css';
import axios from 'axios';
import Navbar from './components/Navbar'
import InterFace from './components/Interface';
import SignupPage from './components/SignupPage'
import Login from './components/LoginPage';
function App() {

   const [isLoggedIn,setIsLoggedIn] = useState(false);
   const [user,setUser] = useState(null);
  //  function to fetch user details
async  function handelAccountDetails (){
  try{  
    const response = await axios.get(`https://mendai.onrender.com/api/account/data`,{withCredentials:true});
    setUser(response.data.message);
  }catch(error){
    throw new Error(error);
  }
  }

  // verifying users account on reload to keep them logged IN
    useEffect(()=>{
      const Verify = async ()=>{
        try{
        const response = await axios.get("https://mendai.onrender.com/api/verify/account",{withCredentials:true});
        if(response.data.message==="authorized"){
          setIsLoggedIn(true);
        }
      }catch(error){
          throw new Error(error);
        }
      }
      Verify();
      if(isLoggedIn===true){
        handelAccountDetails();
      }
    },[isLoggedIn])

  return (<>
  <Router>
    <Routes>
      <Route path='/Register' element={<SignupPage />}/>
      <Route path='/' element={<InterFace user={user} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>}/>
     <Route path='/Login' element={<Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>}/>
      </Routes>
  </Router>
    </>
  )
  
}

export default App;
