import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";

const Login = ({isLoggedIn, setIsLoggedIn}) => {

  const Email = useRef();
  const Password = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn === true) {
      navigate("/");
    }
  }, [isLoggedIn]);



  async function handleLogin() {
    if (Email.current.value === "" || Password.current.value === "") {
      return;
    }

    const data = {
      email: Email.current.value,
      password: Password.current.value
    }
    if (!data) {
      return;
    }
    try {
      // with credentials so that cookies can be accepted and sent back to the server
      const response = await axios.post(`http://localhost:8080/api/Login`, data,{withCredentials:true});
      console.log(response.data);
      setIsLoggedIn(true);
    } catch (error) {
     if(error){
      console.log(error);
     }
    }
  }

  return (<div className="h-screen flex items-center justify-center p-4 bg-gray-100">
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
      <p className="text-gray-500 text-center">Sign in to continue</p>

      {/* Email Input */}
      <div className="space-y-4">
        <input ref={Email}
          className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          type="email"
          placeholder="Email"
        />

        {/* Password Input */}
        <input ref={Password}
          className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          type="password"
          placeholder="Password"
        />
      </div>

      {/* Forgot Password */}
      <div className="text-right">
        <a href="#" className="text-sm text-sky-500 hover:underline">
          Forgot password?
        </a>
      </div>

      {/* Login Button */}
      <button onClick={handleLogin} type="submit" className="w-full bg-sky-500 text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition">
        Login
      </button>

      {/* Divider */}
      <div className="relative text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t"></div>
        </div>
        <div className="relative bg-white px-2 text-gray-500 text-sm">or continue with</div>
      </div>

      {/* OAuth Buttons */}
      <div className="flex flex-col gap-3">
        <button className="w-full border py-2 rounded-lg font-bold hover:bg-gray-100 transition">
          Continue with Google
        </button>
        <button className="w-full border py-2 rounded-lg font-bold hover:bg-gray-100 transition">
          Continue with GitHub
        </button>
      </div>

      {/* Signup Link */}
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link to="/Register" className="text-sky-500 font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  </div>
  )
}

export default Login;