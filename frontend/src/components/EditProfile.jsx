import { useState, useRef,useEffect } from "react";
import Navbar from './Navbar';
import axios from 'axios';

const EditProfile = ({user}) => {

    const DateRef = useRef();
    const ImageRef = useRef();
    const [visible, setVisible] = useState(false);

   

    const AddImage = async (Image) => {
        console.log("Initiated")
        if (!Image ) return;
        const form = new FormData();
        form.append("image", Image)
        try {
            const response = await axios.post("http://localhost:8080/api/update/profile",  form , {
                withCredentials: true,
                headers:{
                    "Content-Type":"multipart/form-data"
                }
            });
            console.log(response.data);
        } catch (error) {
            console.log(error)
            // throw new Error(error);
        }
        
    }


    return (<>
        <div className="h-screen ">
            <h1  className="text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-purple-600 font-semibold text-2xl">{user?user.name:"Your"}'s DashBoard</h1>
            {/* the top profile data part */}
            <div className="flex items-center justify-start gap-10 border-t border-b border-gray-400 p-2">
                <div className="flex flex-col items-center justify-center gap-3">
                    <section onMouseEnter={() => {
                        setVisible(true)
                    }} onMouseLeave={() => setVisible(false)} className="relative h-30 w-30 rounded-full border border-sky-300 cursor-pointer">
                        <img className=" rounded-full h-full w-full  " src={user?user.image:"/"} alt={user?user.name:"/"} />

                        <div onClick={() => {
                            ImageRef.current.click()
                        }} className={`${visible === true ? "opacity-100" : "opacity-0"} transition-all  absolute top-0 left-0 flex  rounded-full h-full w-full bg-black/30`}>
                            <ul className='m-auto bg-black/70 text-white p-2 rounded-full'>
                                Add
                            </ul>
                        </div>
                    </section>
                    <input onChange={(event)=>{
                        if(event.target.files[0]){
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
                    <ul className="text-xl font-semibold">{user?user.name:"No found"}</ul>
                    <ul className="text-xl font-semibold">{user?user.email:"Not found"}</ul>
                    {/* <button style={{ background: "linear-gradient(to right , lime,skyblue)", }} className="px-2 py-1 cursor-pointer rounded-2xl shadow-sm shadow-gray-800 hover:scale-105 transition-all font-bold ">Update!</button> */}
                </div>

            </div>



        </div>
    </>)
}

export default EditProfile;