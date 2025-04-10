import { useState, useRef, useEffect } from "react";
import Navbar from './Navbar';
import axios from 'axios';
import { FaHeart } from "react-icons/fa";
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
            const response = await axios.post("https://mendai.onrender.com0/api/update/profile", form, {
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
        <div style={{backgroundColor:"black",borderTop:"1px solid lightgray",color:"white"}} className="h-screen ">
          
            {/* the top profile data part */}
            <div className="flex items-center justify-start gap-10 p-2">
                <div className="flex flex-col items-center justify-center gap-3">
                    <section onMouseEnter={() => {
                        setVisible(true)
                    }} onMouseLeave={() => setVisible(false)} className="relative h-30 w-30 rounded-full border border-sky-300 cursor-pointer">
                        <img className=" rounded-full h-full w-full  " src={user ? user.image : "/"} alt={user ? user.name : "/"} />
                        <span className="text-xs p-4 text-center text-red-700">* hover/click on the image to add a new image</span>
                        <div onClick={() => {
                            ImageRef.current.click()
                        }} className={`${visible === true ? "opacity-100" : "opacity-0"} transition-all  absolute top-0 left-0 flex  rounded-full h-full w-full bg-black/30`}>
                            <ul className='m-auto bg-white/70 text-black font-bold p-2 rounded-full'>
                                Add
                            </ul>
                        </div>
                    </section>
                    <input onChange={(event) => {
                        if (event.target.files[0]) {
                            AddImage(event.target.files[0]);
                            event.target.value = "";
                        }
                    }} ref={ImageRef} className="absolute top-0 left-0 hidden" type="file" />
                    {/* <div className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-lg">
                        <label className="font-semibold " htmlFor="Date">03/29/2025</label>
                        <input ref={DateRef} className="cursor-pointer border border-gray-400 p-1 rounded-xl" type="date" />
                    </div> */}

                </div>

                <div className="flex flex-col items-center justify-center gap-3">
                    <ul className="text-xl font-semibold flex items-center justify-center gap-2"><FaHeart color="red"/>{user ? user.name : "No found"} </ul>
                    <ul className="text-sm font-semibold">{user ? user.email : "Not found"}</ul>
                    {/* <button style={{ background: "linear-gradient(to right , lime,skyblue)", }} className="px-2 py-1 cursor-pointer rounded-2xl shadow-sm shadow-gray-800 hover:scale-105 transition-all font-bold ">Update!</button> */}
                </div>

            </div>
            <div className="h-[50vh] flex items-center justify-center text-2xl font-bold ">
                New features and options will be live soon!
            </div>


        </div>
    </>)
}

export default EditProfile;