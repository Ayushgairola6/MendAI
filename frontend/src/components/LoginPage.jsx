
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";

const Login = ({ isLoggedIn, setIsLoggedIn, handleGoogleLogin }) => {
  const Email = useRef();
  const Password = useRef();
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn]);

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
    <div className="h-screen flex items-center justify-center p-4" style={{ backgroundColor: "black" }}>
      <div className="w-full max-w-md rounded-xl  p-6 space-y-6 bg-black shadow-lg shadow-sky-700">
        <section className="">
          <h1 className="text-3xl font-bold text-white text-center">Welcome Back</h1>
          <p className="text-gray-300 text-center">Sign in to continue where you left off </p>
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
          <a href="#" className="text-sm hover:underline" style={{ color: "white" }}>
            Forgot password?
          </a>
        </div>

        {status === "idle" ? (
          <button
            onClick={handleLogin}
            type="submit"
            className="w-full bg-gradient-to-r from-sky-500 to-purple-500 text-white font-bold py-2 rounded-lg hover:from-purple-500 hover:to-sky-500 transition-all duration-500 ease-in-out cursor-pointer"
            style={{ backgroundColor: "gray", color: "white" }}
          >
            Login
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
          <div className="relative bg-black px-2 text-sm" style={{ color: "#ffffff" }}>
            OR
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full border py-2 rounded-lg font-bold bg-white text-black hover:bg-black hover:text-white cursor-pointer transition-all duration-300"
          >
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm" style={{ color: "white" }}>
          Don't have an account?{" "}
          <Link to="/Register" className="font-semibold hover:underline text-sky-600 underline" >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
