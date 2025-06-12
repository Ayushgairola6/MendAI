import { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

      const response = await axios.post(`http://localhost:8080/api/Register`, data, {
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
      {/* the issue slider */}
      <div className={`absolute bottom-10 left-10 bg-gray-300 py-3 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 text-red-500 ${issue !== null ? "translate-x-0" : "-translate-x-300"} transition-all duration-700`}>
        <span className="fixed top-1 right-1 cursor-pointer" ><MdClose onClick={()=>setIssue(null)} size={12} /></span>
        ! {issue !== null ? issue : null}
      </div>
      {/*  */}
      <div
        className="w-full max-w-md rounded-xl  p-6 space-y-6 shadow-lg shadow-sky-700"
        style={{ backgroundColor: "black" }}
      >
        <h1 className="text-2xl font-bold text-center" style={{ color: "white" }}>
          Create an Account
        </h1>
        <p className="text-[mediumpurple] text-center">ALICE , your friend in need !</p>

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
            className="w-full border border-sky-600 bg-sky-500  text-black font-semibold py-2 rounded-lg hover:bg-sky-600 duration-500 ease-in-out  transition-all cursor-pointer flex items-center justify-center gap-2 "
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
          <div className="relative bg-black px-2 text-sm" style={{ color: "white" }}>
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

        <p className="text-center font-semibold" style={{ color: "white" }}>
          Already have an Account?{" "}
          <Link to="/Login" className="underline text-sky-600" >
            Login
          </Link>
        </p>
      </div>
    </div >



  </>)
}

export default SignupPage;