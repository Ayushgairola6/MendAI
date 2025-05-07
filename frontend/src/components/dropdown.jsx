import React, { useState } from 'react';
import { CiMenuBurger, CiHome, CiMail, CiSettings } from 'react-icons/ci';
import { IoIosClose } from "react-icons/io";
import { IoPersonOutline } from "react-icons/io5";
import { MdClose, MdQuickreply } from 'react-icons/md';

const DropDown = () => {

    const [isVisible, setIsVisible] = useState(false);
    return (<>
        <div className='flex items-center justify-between px-6 py-2'>
            <div className='flex items-center justify-center flex-col '>
                <ul onClick={() => setIsVisible(!isVisible)} className='bg-gray-300 p-2 rounded-full relative  text-gray-700 hover:text-black cursor-pointer'>{isVisible === false ? <CiMenuBurger size={18}  /> : <MdClose size={18}  />}</ul>
                <ul className={`bg-gray-300 p-2 rounded-full absolute ${isVisible == true ? "top-8" : "top-2 -z-10"} transition-all ease-in-out duration-400 text-gray-700 hover:text-black cursor-pointer`}><CiHome size={18} /></ul>
                <ul className={`bg-gray-300 p-2 rounded-full absolute ${isVisible === true ? "top-14" : " top-2 -z-10"} transition-all ease-in-out duration-400 text-gray-700 hover:text-black cursor-pointer`}><CiMail size={18} /></ul>
                <ul className={`bg-gray-300 p-2 rounded-full absolute ${isVisible === true ? "top-20" : " top-2 -z-10"} transition-all ease-in-out duration-400 text-gray-700 hover:text-black cursor-pointer`}><IoPersonOutline size={18} /></ul>
                <ul className={`bg-gray-300 p-2 rounded-full absolute ${isVisible === true ? "top-27" : " top-2 -z-10"} transition-all ease-in-out duration-400 text-gray-700 hover:text-black cursor-pointer`}><CiSettings size={18} /></ul>

            </div>
            <ul><MdQuickreply size={18} /></ul>
        </div>

    </>)
}

export default DropDown
