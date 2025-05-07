import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import Navbar from './components/Navbar'
import InterFace from './components/Interface';
import SignupPage from './components/SignupPage'
import Login from './components/LoginPage';
import EditProfile from './components/EditProfile';
import OAuthSuccess from './components/OauthSuccesPage';
import Pricing from './components/Pricing'
// temporary files
import LoginForm from './components/TempLogin.jsx';
import SignupForm from './components/TempSignup.jsx';
import ChatForm from './components/TempChat.jsx';

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [color, setColor] = useState("Light")

  //  function to fetch user details
  async function handelAccountDetails() {
    const token = localStorage.getItem("auth_token");
    try {
      const response = await axios.get(`http://localhost:8080/api/account/data`, {
        withCredentials: true, headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUser(response.data.info);
    } catch (error) {
      throw new Error(error);
    }
  }

  // // verifying users account on reload to keep them logged IN
  useEffect(() => {
    const Verify = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/verify/account", { withCredentials: true });
        if (response.data.message === "authorized") {
          setIsLoggedIn(true);
        }
      } catch (error) {
        throw new Error(error);
      }
    }
    Verify();
    if (isLoggedIn === true) {
      handelAccountDetails();
    }
  }, [isLoggedIn])


  const handleGoogleLogin = () => {

    window.location.href = "http://localhost:8080/api/auth/google";
  }

  



  return (<>

    <Router>

      <Navbar isLoggedIn={isLoggedIn} color={color} setColor={setColor} user={user} />


      <Routes>


        <Route path='/Register' element={<SignupPage handleGoogleLogin={handleGoogleLogin} />} />
        <Route path='/' element={<InterFace color={color} user={user} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
        <Route path='/Login' element={<Login handleGoogleLogin={handleGoogleLogin} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/DashBoard" element={<EditProfile user={user} handelAccountDetails={handelAccountDetails} />} />
        <Route path='/oauth-success' element={<OAuthSuccess isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handelAccountDetails={handelAccountDetails} />} />
        <Route path='/Plans' element={<Pricing isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handelAccountDetails={handelAccountDetails} />} />

      </Routes>
    </Router>




  </>
  )

}

export default App;
