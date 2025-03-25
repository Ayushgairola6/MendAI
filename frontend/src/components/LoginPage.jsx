import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";

const Login = ({ isLoggedIn, setIsLoggedIn }) => {

  const Email = useRef();
  const Password = useRef();
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle")
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
      setStatus("pending")
      // with credentials so that cookies can be accepted and sent back to the server
      const response = await axios.post(`https://mendai.onrender.com/api/Login`, data, { withCredentials: true });
      console.log(response.data);
      setIsLoggedIn(true);
      setStatus("successs")
      if (isLoggedIn === true) {
        setStatus("idle")
      }
    } catch (error) {
      setStatus("idle")

      if (error) {
        console.log(error);
      }
    }
  }

  return (<div
    className="h-screen flex items-center justify-center p-4"
    style={{ backgroundColor: "#f7fafc" }} // Light gray background
  >
    <div
      className="w-full max-w-md rounded-xl shadow-lg p-6 space-y-6"
      style={{ backgroundColor: "#ffffff" }} // White background
    >
      <h1
        className="text-2xl font-bold text-center"
        style={{ color: "#000000" }} // Black text
      >
        Welcome Back
      </h1>
      <p
        className="text-gray-500 text-center"
        style={{ color: "#6b7280" }} // Medium gray text
      >
        Sign in to continue
      </p>

      {/* Email Input */}
      <div className="space-y-4">
        <input
          ref={Email}
          className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          type="email"
          placeholder="Email"
          style={{
            borderColor: "#d1d5db", // Light gray border
            color: "#000000", // Black text
            backgroundColor: "#ffffff", // White background
          }}
        />

        {/* Password Input */}
        <input
          ref={Password}
          className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          type="password"
          placeholder="Password"
          style={{
            borderColor: "#d1d5db", // Light gray border
            color: "#000000", // Black text
            backgroundColor: "#ffffff", // White background
          }}
        />
      </div>

      {/* Forgot Password */}
      <div className="text-right">
        <a
          href="#"
          className="text-sm hover:underline"
          style={{ color: "#0ea5e9" }} // Sky blue text
        >
          Forgot password?
        </a>
      </div>

      {/* Login Button */}
      {status === "idle" ? <button
        onClick={handleLogin}
        type="submit"
        className="w-full text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition"
        style={{
          backgroundColor: "#0ea5e9", // Sky blue background
          color: "#ffffff", // White text
        }}
      >
        Login
      </button> : <div className="flex items-center justify-center my-2"><div style={{ borderTop: "4px solid red" }} className="h-12 w-12 rounded-full animate-spin"></div></div>}

      {/* Divider */}
      <div className="relative text-center">
        <div className="absolute inset-0 flex items-center">
          <div
            className="w-full border-t"
            style={{ borderColor: "#d1d5db" }} // Light gray border
          ></div>
        </div>
        <div
          className="relative bg-white px-2 text-sm"
          style={{ color: "#6b7280" }} // Medium gray text
        >
          or continue with
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="flex flex-col gap-3">
        <button
          className="w-full border py-2 rounded-lg font-bold hover:bg-gray-100 transition"
          style={{
            borderColor: "#d1d5db", // Light gray border
            backgroundColor: "#ffffff", // White background
          }}
        >
          Continue with Google
        </button>
        <button
          className="w-full border py-2 rounded-lg font-bold hover:bg-gray-100 transition"
          style={{
            borderColor: "#d1d5db", // Light gray border
            backgroundColor: "#ffffff", // White background
          }}
        >
          Continue with GitHub
        </button>
      </div>
      {/* Signup Link */}
      <p
        className="text-center text-sm"
        style={{ color: "#6b7280" }} // Medium gray text
      >
        Don't have an account?{" "}
        <Link
          to="/Register"
          className="font-semibold hover:underline"
          style={{ color: "#0ea5e9" }} // Sky blue text
        >
          Sign up
        </Link>
      </p>
    </div>
  </div>

  )
}

export default Login;