
import { Link, Links, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";
import { PiArrowBendDoubleUpRight } from "react-icons/pi";
import { FaGoogle } from "react-icons/fa";
const Login = ({ isLoggedIn, setIsLoggedIn, handleGoogleLogin }) => {
  const Email = useRef();
  const Password = useRef();
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");

  // useEffect(() => {
  //   if (isLoggedIn) {
  //     navigate("/");
  //   }
  // }, [isLoggedIn]);

  async function handleLogin() {
    if (Email.current.value === "" || Password.current.value === "") {
      return;
    }

    const data = {
      email: Email.current.value,
      password: Password.current.value,
    };

    if (!data) {
      return;
    }

    try {
      setStatus("pending");
      const response = await axios.post(`https://mendai.onrender.com/api/Login`, data, { withCredentials: true });
      localStorage.setItem("auth_token", response.data.token);
      setIsLoggedIn(true);
      setStatus("success");

      if (isLoggedIn) {
        setStatus("idle");
      }
    } catch (error) {
      setStatus("idle");
      console.log(error);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center p-4  bg-black relative" >
      <div class="
  fixed left-0 top-10  
  h-[400px] w-[200px]  
  opacity-40  
  bg-[radial-gradient(circle_at_center,_rgba(124,58,237,0.7),_rgba(124,58,237,0)_70%)]  
  blur-[90px]  
  rounded-full  
  mix-blend-mode-lighten  
  z-[2]  
"></div>

      {/* <!-- Electric Indigo (Center) --> */}
      <div class="
  fixed right-90 top-3  
  h-[400px] w-[300px]  
  opacity-40  
  bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.7),_rgba(99,102,241,0)_70%)]  
  blur-[90px]  
  rounded-full  
  mix-blend-mode-lighten  
  z-[1] 
  animate-pulse 
"></div>

      {/* <!-- Sky Blue (Right) --> */}
      <div class=" hidden md:block
  fixed right-0 top-1/3  
  h-[400px] w-[300px]  
  opacity-40  
  bg-[radial-gradient(circle_at_center,_rgba(56,182,240,0.6),_rgba(56,182,240,0)_70%)]  
  blur-[100px]  
  rounded-full  
  mix-blend-mode-lighten  
  z-[2]  
"></div>
      <div className="w-full max-w-md rounded-xl  p-6 space-y-6 bg-gradient-to-br from-black to-white/10 shadow-xl shadow-white/5">
        <section className="">
          <h1 className="text-3xl font-bold text-white text-center">Welcome Back</h1>
          <p className="text-[mediumpurple] text-center font-mono my-2">Sign in to continue where you left off !</p>
        </section>


        <div className="space-y-4">
          <input
            ref={Email}
            className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:outline-none"
            type="email"
            placeholder="Email"
            style={{ borderColor: "#ffffff", color: "white", backgroundColor: "black" }}
          />
          <input
            ref={Password}
            className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:outline-none"
            type="password"
            placeholder="Password"
            style={{ borderColor: "#ffffff", color: "white", backgroundColor: "black" }}
          />
        </div>

        <div className="text-right">
          <Link to="/ResetPassword" className="text-sm hover:underline font-mono" style={{ color: "white" }}>
            Forgot password?
          </Link>
        </div>

        {status === "idle" ? (
          <button
            onClick={handleLogin}
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700  
              text-white  
              py-2  
              rounded-lg  
              font-medium  
              transition-all  
              shadow-lg shadow-indigo-500/20  
              hover:shadow-indigo-500/40   w-full flex items-center justify-center gap-2 font-mono" >
            Login <PiArrowBendDoubleUpRight />
          </button>
        ) : (
          <div className="flex items-center justify-center my-2">
            <div style={{ borderTop: "4px solid white" }} className="h-12 w-12 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "#ffffff" }}></div>
          </div>
          <div className="relative bg-black px-2 text-sm" style={{ color: "gray" }}>
            OR
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full border py-2 rounded-lg font-bold bg-white text-black hover:bg-black hover:text-white cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 font-mono"
          >
            Continue with Google <FaGoogle />
          </button>
        </div>

        <p className="text-center text-sm" style={{ color: "white" }}>
          Don't have an account?{" "}
          <Link to="/Register" className="font-semibold hover:underline text-indigo-600 cursor-pointer font-mono" >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
