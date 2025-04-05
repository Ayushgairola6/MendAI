import React,{useState,useEffect} from 'react';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import './App.css';
import axios from 'axios';
import Navbar from './components/Navbar'
import InterFace from './components/Interface';
import SignupPage from './components/SignupPage'
import Login from './components/LoginPage';
import EditProfile from './components/EditProfile';
import OAuthSuccess from './components/OauthSuccesPage';
function App() {

   const [isLoggedIn,setIsLoggedIn] = useState(false);
   const [user,setUser] = useState(null);
  const [color,setColor] = useState("Light")

  //  function to fetch user details
async  function handelAccountDetails (){
  try{  
    const response = await axios.get(`http://localhost:8080/api/account/data`,{withCredentials:true});
    console.log(response.data)
    setUser(response.data.info);
  }catch(error){
    throw new Error(error);
  }
  }

  // verifying users account on reload to keep them logged IN
    useEffect(()=>{
      const Verify = async ()=>{
        try{
        const response = await axios.get("http://localhost:8080/api/verify/account",{withCredentials:true});
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
 
 
    const handleGoogleLogin =()=>{
     
      window.location.href = "http://localhost:8080/api/auth/google";
     }


  return (<>
   
   <Router>

   <Navbar color={color} setColor={setColor} user={user}/>
    
    <Routes>
      <Route path='/Register' element={<SignupPage handleGoogleLogin={handleGoogleLogin}/>}/>
      <Route path='/' element={<InterFace color={color} user={user} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>}/>
     <Route path='/Login' element={<Login handleGoogleLogin={handleGoogleLogin} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>}/>
     <Route path="/DashBoard" element={<EditProfile user={user}/>} />
     <Route path='/oauth-success' element={<OAuthSuccess isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handelAccountDetails={handelAccountDetails}/>}/>
      </Routes>
  </Router> 





    </>
  )
  
}

export default App;
