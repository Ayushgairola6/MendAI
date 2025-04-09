import { useRef, useEffect,useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import dotenv from 'dotenv';
// dotenv.config();

const SignupPage = ({ isLoggedIn, setIsLoggedIn ,handleGoogleLogin}) => {
  const [status, setStatus] = useState("idle")

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

      const response = await axios.post(`http://localhost:8080/api/Register`, data);
      console.log(response.data);
      setStatus("successs")
      setTimeout(() => {
        setStatus('idle');
      }, 3000)
    } catch (error) {
      setStatus('idle');

      console.log(error);
      throw new Error("error while creating an account!")
    }
  }
  return (<>
    {/* main container */}


    <div
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
      Create an Account
    </h1>
    <p
      className="text-gray-500 text-center"
      style={{ color: "#6b7280" }} // Medium gray text
    >
      Start your journey with us
    </p>

    {/* Name Inputs */}
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <input
          ref={FirstName}
          className="w-1/2 border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          type="text"
          placeholder="First Name"
          style={{
            borderColor: "#d1d5db", // Light gray border
            backgroundColor: "#ffffff", // White background
            color: "#000000", // Black text
          }}
        />
        <input
          ref={LastName}
          className="w-1/2 border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          type="text"
          placeholder="Last Name"
          style={{
            borderColor: "#d1d5db", // Light gray border
            backgroundColor: "#ffffff", // White background
            color: "#000000", // Black text
          }}
        />
      </div>

      {/* Email Input */}
      <input
        ref={Email}
        className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        type="email"
        placeholder="Email"
        style={{
          borderColor: "#d1d5db", // Light gray border
          backgroundColor: "#ffffff", // White background
          color: "#000000", // Black text
        }}
      />

      {/* Password Input */}
      <input
        ref={Password}
        className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        type="password"
        placeholder="Password"
        style={{
          borderColor: "#d1d5db", // Light gray border
          backgroundColor: "#ffffff", // White background
          color: "#000000", // Black text
        }}
      />
    </div>

    {/* Register Button */}
    {status === "idle" ? (
      <button
        type="submit"
        onClick={handleSignup}
        className="w-full bg-sky-500 text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition"
        style={{
          backgroundColor: "#0ea5e9", // Sky blue background
          color: "#ffffff", // White text
        }}
      >
        Register
      </button>
    ) : (
      <div className="flex items-center justify-center my-2">
        <div
          className="h-12 w-12 rounded-full animate-spin"
          style={{ borderTop: "4px solid #ff0000" }} // Red border for spinner
        ></div>
      </div>
    )}

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
      <button onClick={handleGoogleLogin}
        className="w-full border py-2 rounded-lg font-bold hover:bg-gray-100 transition"
        style={{
          borderColor: "#d1d5db", // Light gray border
          backgroundColor: "#ffffff", // White background
          color: "#000000", // Black text
        }}
      >
        Continue with Google
      </button>
      <button
        className="w-full border py-2 rounded-lg font-bold hover:bg-gray-100 transition"
        style={{
          borderColor: "#d1d5db", // Light gray border
          backgroundColor: "#ffffff", // White background
          color: "#000000", // Black text
        }}
      >
        Continue with GitHub
      </button>
    </div>
    <p
      className="text-center font-semibold"
      style={{ color: "#000000" }} // Black text
    >
      Already have an Account!{" "}
      <Link
        className="text-blue-600 underline"
        to="/Login"
        style={{ color: "#2563eb" }} // Blue text for link
      >
        Login
      </Link>
    </p>
  </div>
</div>


  </>)
}

export default SignupPage;