import { useRef ,useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import dotenv from 'dotenv';
// dotenv.config();

const SignupPage = ({isLoggedIn,setIsLoggedIn}) => {

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
      const response = await axios.post(`http://localhost:8080/api/Register`, data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
      throw new Error("error while creating an account!")
    }
  }
  return (<>
    {/* main container */}


    <div className="h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Create an Account</h1>
        <p className="text-gray-500 text-center">Start your journey with us</p>

        {/* Name Inputs */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <input ref={FirstName}
              className="w-1/2 border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              type="text"
              placeholder="First Name"
            />
            <input ref={LastName}
              className="w-1/2 border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              type="text"
              placeholder="Last Name"
            />
          </div>

          {/* Email Input */}
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

        {/* Register Button */}
        <button type="submit" onClick={handleSignup} className="w-full bg-sky-500 text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition">
          Register
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
        <p className="text-center font-semibold">Already have an Account! <Link className="text-blue-600 underline" to="/Login">Login</Link></p>

      </div>
    </div>

  </>)
}

export default SignupPage;