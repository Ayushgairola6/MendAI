import { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { FaHourglassHalf } from "react-icons/fa6";
import { PiArrowBendUpRightThin } from "react-icons/pi";
import axios from 'axios';
import dotenv from 'dotenv';
import { MdClose, MdError } from "react-icons/md";
// dotenv.config();

const SignupPage = ({ isLoggedIn, setIsLoggedIn, handleGoogleLogin }) => {
  const [status, setStatus] = useState("idle")
  const [issue, setIssue] = useState(null);
  const FirstName = useRef();
  const LastName = useRef();
  const Email = useRef();
  const Password = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn === true) {
      navigate("/");
    }
  }, [isLoggedIn]);


  async function handleSignup() {
    if (FirstName.current.value === "" || LastName.current.value === "" || Email.current.value === "" || Password.current.value === "") {
      alert("All fields are necessary");
      return;
    }
    //  object of all collected data
    const data = {
      firstname: FirstName.current.value,
      lastname: LastName.current.value,
      email: Email.current.value,
      password: Password.current.value,
    }
    console.log(data, "input data object");
    if (!data) {
      return;
    }

    try {
      setStatus("pending")

      const response = await axios.post(`https://mendai.onrender.com/api/Register`, data, {
        withCredentials: true
      });
      console.log(response.data);
      setStatus("successs")
      setTimeout(() => {
        setStatus('idle');
      }, 3000)
    } catch (error) {
      setStatus('idle');
      setIssue(error?.response?.data?.message)
      throw new Error("error while creating an account!")
    }
  }
  return (<>
    {/* main container */}


    <div
      className="h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundColor: "black" }}
    >
      {/* the gradient patches */}
      {/* <!-- Deep Purple (Left) --> */}
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

      {/*  */}
      {/* the issue slider */}
      <div className={`absolute bottom-10 left-10 bg-gray-300 py-3 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 text-red-500 ${issue !== null ? "translate-x-0" : "-translate-x-300"} transition-all duration-700`}>
        <span className="fixed top-1 right-1 cursor-pointer" ><MdClose onClick={() => setIssue(null)} size={12} /></span>
        ! {issue !== null ? issue : null}
      </div>
      {/*  */}
      <div
        className="w-full max-w-md rounded-xl bg-gradient-to-br from-black to-white/10  p-6 space-y-6 shadow-xl shadow-white/5"

      >
        <h1 className="text-2xl font-bold text-center" style={{ color: "white" }}>
          Welcome to your personal space
        </h1>
        <p className="text-[mediumpurple] text-center font-mono"> Where you will never be unheard !</p>

        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <input
              ref={FirstName}
              className="w-1/2 border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              type="text"
              placeholder="First Name"
              style={{ borderColor: "white", backgroundColor: "black", color: "white" }}
            />
            <input
              ref={LastName}
              className="w-1/2 border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              type="text"
              placeholder="Last Name"
              style={{ borderColor: "white", backgroundColor: "black", color: "white" }}
            />
          </div>

          <input
            ref={Email}
            className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            type="email"
            placeholder="Email"
            style={{ borderColor: "white", backgroundColor: "black", color: "white" }}
          />

          <input
            ref={Password}
            className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            type="password"
            placeholder="Password"
            style={{ borderColor: "white", backgroundColor: "black", color: "white" }}
          />
        </div>

        {status === "idle" ? (
          <button
            type="submit"
            onClick={handleSignup}
            className="bg-indigo-600 hover:bg-indigo-700  
  text-white  
   py-2  
  rounded-lg  
  font-medium  
  transition-all  
  shadow-lg shadow-indigo-500/20  
  hover:shadow-indigo-500/40   w-full flex items-center justify-center gap-2 font-mono"
          >
            Register <PiArrowBendUpRightThin size={22} className="" />
          </button>
        ) : (
          <button
            type="submit"
            className="w-full bg-green-300 text-black border border-green-600 font-bold py-2 rounded-lg  trnsition-all ease-in-out  transition-all cursor-pointer animate-pulse duration-500 flex items-center justify-center gap-2"
          >
            Please wait...  <FaHourglassHalf size={16} className="animate-spin" />
          </button>
        )}

        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "white" }}></div>
          </div>
          <div className="relative bg-black  px-2 text-sm" style={{ color: "gray" }}>
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

        <p className="text-center " style={{ color: "gray" }}>
          Already have an Account?{" "}
          <Link to="/Login" className="underline text-indigo-600 cursor-pointer font-mono" >
            Login
          </Link>
        </p>
      </div>
    </div >



  </>)
}

export default SignupPage;