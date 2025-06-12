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
import Welcome from './components/welcome';
import Home from './components/Home';
import AppModal from './components/DownloadAppModal';
import ResetPassword from './components/ResetPassword';
function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [color, setColor] = useState("Light")
  const [delay, setDelay] = useState(false);
  const [isSeen, setSeen] = useState(false);

  //  function to fetch user details
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelay(true);
    }, 3500)
    return () => clearTimeout(timer);
  }, [])

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

    <Router >
      {delay === true ? <>
        <Navbar isSeen={isSeen} setSeen={setSeen} isLoggedIn={isLoggedIn} color={color} setColor={setColor} user={user} />

        <Routes>
          <Route path='/Register' element={<SignupPage handleGoogleLogin={handleGoogleLogin} />} />
          
            <Route path='/' element={<div className='bg-black'><InterFace color={color} user={user} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /></div>} />
          

          <Route path='/Login' element={<Login handleGoogleLogin={handleGoogleLogin} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/DashBoard" element={<EditProfile user={user} handelAccountDetails={handelAccountDetails} />} />
          <Route path='/oauth-success' element={<OAuthSuccess isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handelAccountDetails={handelAccountDetails} />} />
          <Route path='/Plans' element={<Pricing isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handelAccountDetails={handelAccountDetails} />} />
          <Route path='/ResetPassword' element={<ResetPassword color={color} user={user} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />

        </Routes></> : <Welcome delay={delay} setDelay={setDelay} />}
    </Router>


  </>
  )

}

export default App;
