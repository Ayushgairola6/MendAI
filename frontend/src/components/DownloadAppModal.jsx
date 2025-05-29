import { MdClose } from "react-icons/md";
import { useState } from "react";

const AppModal = ({ isSeen, setSeen }) => {

    return (<>
        <div className="absolute font-normal  top-20 left-20 py-6 px-5 rounded-lg bg-white/15">
            <MdClose onClick={() => {
                sessionStorage.setItem("hasSeenAppDownloadModal", true);
                setSeen(true);
            }} className=" absolute top-2 right-2  hover:bg-red-500 rounded-lg cursor-pointer transition-all duration-300" size={15} color="white" />
            <h1> Download Our App</h1>
            <span className="text-sky-400 cursor-pointer">click!</span>

        </div>
    </>)
}

export default AppModal;