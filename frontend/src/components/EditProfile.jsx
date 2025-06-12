import { useState, useRef, useEffect } from "react";
import Navbar from './Navbar';
import axios from 'axios';
import { FaHeart, FaRegEdit } from "react-icons/fa";
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
            const response = await axios.post("http://localhost:8080/api/update/profile", form, {
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
        <div style={{ backgroundColor: "black", borderTop: "1px solid lightgray", color: "white" }} className="h-screen ">
            {/* Top profile data part */}
            <div className="flex items-center justify-start gap-10 p-2 relative">
                <ul onClick={()=>{
                    ImageRef.current.click()
                }} className="absolute right-5 top-5 p-2 rounded-full bg-white/25 cursor-pointer hover:scale-110 transition-all duration-300"><FaRegEdit /></ul>

                <div className="flex flex-col items-center justify-center gap-3">
                    <section
                        onMouseEnter={() => setVisible(true)}
                        onMouseLeave={() => setVisible(false)}
                        className="relative h-30 w-30 rounded-full border border-white cursor-pointer"
                    >
                        {/* Image Upload Loader */}
                        {uploading === "pending" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                <div className="h-10 w-10 border-4 border-t-white border-gray-600 rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* Profile Image */}
                        <img
                            className="rounded-full h-full w-full"
                            src={user ? user.image : "/"}
                            alt={user ? user.name : "No image"}
                        />
                        {/* 
                        <span className="text-xs p-4 text-center text-gray-700">* hover/click on the image to add a new image</span> */}

                        <div
                            onClick={() => ImageRef.current.click()}
                            className={`${visible ? "opacity-100" : "opacity-0"} transition-all absolute top-0 left-0 flex rounded-full h-full w-full bg-black/30`}
                        >
                            <ul className='m-auto bg-white/70 text-black font-bold p-2 rounded-full'>
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

                <div className="flex flex-col items-center justify-center gap-3">
                    <ul className="text-xl font-semibold flex items-center justify-center gap-2 text-gray-300">
                        {/* <FaHeart color="red" /> */}
                        {user ? user.name : "Not found"}
                    </ul>
                    <ul className="text-sm font-semibold">{user ? user.email : "Not found"}</ul>
                </div>
            </div>

            <div className="h-screen text-center flex items-center justify-center text-xl font-sans ">
                New features and options will be live soon!
            </div>
        </div>

    </>)
}

export default EditProfile;