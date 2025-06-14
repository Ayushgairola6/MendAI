import { useState, useRef, useEffect } from "react";
import Navbar from './Navbar';
import axios from 'axios';
import { FaHeart, FaRegEdit, FaUser } from "react-icons/fa";
import { motion } from 'framer-motion'
const EditProfile = ({ user, handelAccountDetails }) => {

    const DateRef = useRef();
    const ImageRef = useRef();
    const [visible, setVisible] = useState(false);
    const [uploading, setUploading] = useState('idle');


    const AddImage = async (Image) => {
        const token = localStorage.getItem("auth_token");
        if (!Image) return;
        const form = new FormData();
        form.append("image", Image)
        try {
            setUploading("pending");
            const response = await axios.post("https://mendai.onrender.com/api/update/profile", form, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.message = "Successfully uploaded your image") {
                handelAccountDetails();
                setUploading("idle");
            }
        } catch (error) {
            setUploading("idle");
            throw new Error(error);
        }

    }


    return (<>
        <div style={{  borderTop: "1px solid lightgray", color: "white" }} className="h-screen font-mono bg-black">
            {/* Top profile data part */}
            <div className="flex items-center justify-start gap-10 p-2 relative">
                <motion.ul whileTap={{ scale: 1.07 }} onClick={() => {
                    ImageRef.current.click()
                }} className="absolute right-2 top-2 p-2 rounded-full bg-white/10 shadow-xl shadow-purple-600/20 cursor-pointer hover:scale-110 transition-all duration-300">
                <FaRegEdit color="mediumpurple" /></motion.ul>

                <div className="flex flex-col items-center justify-center gap-3">
                    <section
                        onMouseEnter={() => setVisible(true)}
                        onMouseLeave={() => setVisible(false)}
                        className="relative h-25 w-25 rounded-xl border border-white cursor-pointer"
                    >
                        {/* Image Upload Loader */}
                        {uploading === "pending" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                <div className="h-10 w-10 border-4 border-t-white border-purple-600 rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* Profile Image */}
                        <img
                            className="rounded-xl h-full w-full"
                            src={user ? user.image : "/"}
                            alt={user ? user.name : "No image"}
                        />
                        {/* 
                        <span className="text-xs p-4 text-center text-gray-700">* hover/click on the image to add a new image</span> */}

                        <div
                            onClick={() => ImageRef.current.click()}
                            className={`${visible ? "opacity-100" : "opacity-0"} transition-all absolute top-0 left-0 flex rounded-lg h-full w-full bg-black/30`}
                        >
                            <ul className='m-auto bg-white/70 text-black font-bold p-2 rounded-lg'>
                                Add
                            </ul>
                        </div>
                    </section>

                    {/* Hidden File Input */}
                    <input
                        onChange={(event) => {
                            if (event.target.files[0]) {
                                setUploading(true);
                                AddImage(event.target.files[0]).finally(() => setUploading(false));
                                event.target.value = "";
                            }
                        }}
                        ref={ImageRef}
                        className="absolute top-0 left-0 hidden"
                        type="file"
                    />
                </div>

                <div className="flex flex-col items-start justify-start gap-1">
                    <ul className="text-md font-semibold flex items-center justify-center gap-1 text-gray-300">
                        <FaUser color="mediumpurple" />
                        {user ? user.name : "Not found"}
                    </ul>
                    <ul className="text-xs font-semibold text-[mediumpurple]">{user ? user.email : "Not found"}</ul>
                </div>
            </div>

            <div className=" text-center py-4 px-2 text-xs md:text-md">
                <h1 className="text-sm">Usage Overview (Analytics will be live soon) </h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                    <div className="bg-white/10 py-3 rounded-lg flex items-center justify-center gap-2">
                        <ul className="text-[mediumpurple]">Messages Sent-</ul>
                        <span>0</span>
                    </div>
                    <div className="bg-white/10 py-3 rounded-lg">
                        <ul className="text-[mediumpurple]">Last Login</ul>
                        <span>{ new Date().toISOString().split('T')[0]}</span>
                    </div>
                    <div className="bg-white/10 py-3 rounded-lg">
                        <ul className="text-[mediumpurple] line-clamp-2">About you</ul>
                        <span>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates, similique.</span>
                    </div>
                    <div className="bg-white/10 py-3 rounded-lg">
                        <ul className="text-[mediumpurple]">Interests</ul>
                        <span>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates, similique.</span>
                    </div>
                </div>
            </div>
        </div>

    </>)
}

export default EditProfile;