import { MdOutlineEmail } from "react-icons/md";
import { TbPassword } from "react-icons/tb";
import { GiBeastEye } from "react-icons/gi";
import { MdError } from "react-icons/md";
import React, { useRef, useState, useEffect } from "react";
import axios from 'axios'
import { MdOutlineResetTv } from "react-icons/md";
const ResetPassword = () => {

    const Email = useRef();
    const PassWord = useRef();
    const ConfirmPassword = useRef();
    const [issue, setIssue] = useState(null)
    const [isInvalid, setIsInvalid] = useState(false);


    // Store timeout IDs so we can clear them on unmount
    const timeoutIds = useRef([]);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            timeoutIds.current.forEach(clearTimeout);
            timeoutIds.current = [];
        };
    }, []);

    const handleResetPassword = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (issue !== null) {
                setIssue(null);
            }
            if (Email.current.value === "" || PassWord.current.value === "" || ConfirmPassword.current.value === "") {
                setIssue("All fields are necessary");
                return;
            }
            if (PassWord.current.value !== ConfirmPassword.current.value) {
                setIsInvalid(true);
                const time = setTimeout(() => {
                    setIsInvalid(false);
                }, 3500);
                timeoutIds.current.push(time);
                return;
            }

            const data = {
                email: Email.current.value,
                PassWord: PassWord.current.value,
                ConfirmedPassword: ConfirmPassword.current.value
            };

            const response = await axios.post(`https://mendai.onrender.com/api/reset-password`, data, {
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            // console.log(response.data);
        } catch (error) {
            setIssue(error?.response?.data?.message);
            setIsInvalid(true);
            console.error(error?.response?.data?.message);

            const time = setTimeout(() => {
                setIsInvalid(false);
            }, 3500);
            timeoutIds.current.push(time);
        }
    }
    return (<>
        <div className="relative bg-black h-screen flex flex-col items-center justify-center gap-15 overflow-hidden">
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
            {/* error popup */}
            <div className={`absolute bottom-10 left-10 bg-gray-300 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 text-red-500 ${isInvalid === true ? "translate-x-0" : "-translate-x-300"} transition-all duration-700`}>
                <MdError /> {issue !== null ? issue : "Please check the data again !"}
            </div>
            {/* main section */}
            <div className="bg-gradient-to-br from-black to-white/10 shadow-2xl shadow-white/10 border border-gray-800 pb-10 px-6 rounded-xl w-4/5 md:w-xl grid grid-cols-1 gap-3 ">
            <h1 className=" text-2xl md:text-3xl  text-center text-gray-300 my-8">Reset Your Password</h1>

                <section className="grid grid-cols-1 gap-4">
                    <label className="text-gray-300 flex items-center justify-start gap-2" htmlFor=""><MdOutlineEmail color="mediumpurple" />Email Address  </label>
                    <input ref={Email} className={`border py-1 px-2 rounded-lg bg-white/15 text-white   ${issue !== null && Email.current.value === "" ? " border-red-600" : "border-gray-400"}`} type="email" name="" id="" placeholder="Your email address" />
                </section>
                <section className="grid grid-cols-1 gap-4 ">
                    <label className="text-gray-300 flex items-center justify-start gap-2" htmlFor=""><TbPassword color="mediumpurple" /> New Password</label>
                    <input ref={PassWord} className={`py-1 px-2 rounded-lg border bg-white/15 text-white  ${issue !== null && PassWord.current.value === "" ? " border-red-600" : "border-gray-400"}`} placeholder="Password" type="password" name="" id="" />
                </section>
                <section className="grid grid-cols-1 gap-4">
                    <label className="text-gray-300 flex items-center justify-start gap-2" htmlFor=""><GiBeastEye color="mediumpurple" /> Confirm Password</label>
                    <input ref={ConfirmPassword} className={`py-1 px-2 rounded-lg border bg-white/15 text-white  ${issue !== null && ConfirmPassword.current.value === "" ? " border-red-600" : "border-gray-400"}`} placeholder="Repeat Password" type="password" name="" id="" />
                </section>
                <button onClick={handleResetPassword} className="bg-white px-2 py-1 font-mono font-semibold text-black hover:bg-black hover:text-white border transition-all cursor-pointer rounded-xl mt-5 flex items-center justify-center gap-2">Reset <MdOutlineResetTv /></button>
            </div>
        </div>
    </>)
}

export default ResetPassword;