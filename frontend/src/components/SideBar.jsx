import React from 'react';
import { MdDownload } from 'react-icons/md';
import { MdDashboardCustomize } from "react-icons/md";
import { FaDollarSign } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { CiChat1, CiLogin } from "react-icons/ci";
import { FaAddressCard } from "react-icons/fa6";
import { Link } from 'react-router-dom'
import { IoClose } from 'react-icons/io5'
const Sidebar = ({ isVisible, setIsVisible, isLoggedIn }) => {
    return (<>
        <div onClick={() => setIsVisible(!isVisible)} className={`${isVisible === true ? "translate-x-0" : "-translate-x-100"} ease-initial duration-400 transition-all fixed left-0 top-0 h-full w-[20rem] bg-black flex items-center justify-start flex-col cursor-pointer gap-4 md:hidden lg:hidden border-r border-gray-500`}>
            <IoClose className='absolute right-4 top-4 animate-bounce' size={25} />
            <Link to='/' className='w-full hover:bg-white/15 mt-10 flex items-center justify-start gap-4 pl-6 py-3 hover:text-purple-600 transition-all duration-300'><CiChat1 size={22} className='hover:animate-bounce' />Chat</Link>
            {isLoggedIn === true ? <Link to='/DashBoard' className='w-full hover:bg-white/15  flex items-center justify-start gap-4 pl-6 py-3 hover:text-purple-600 transition-all duration-300'><MdDashboardCustomize size={22} className='hover:animate-bounce' />Account</Link> : <Link to='/Login' className='w-full hover:bg-white/15  flex items-center justify-start gap-4 pl-6 py-3 hover:text-teal-600'><CiLogin size={22} className='hover:animate-bounce' />Login</Link>}
            {isLoggedIn === false ? <Link to='/Register' className='w-full hover:bg-white/15  flex items-center justify-start gap-4 pl-6 py-3 hover:text-purple-600 transition-all duration-300'><FaAddressCard size={22} className='hover:animate-bounce' />Register</Link> : null}
            <Link to="/Plans" className='w-full hover:bg-white/15  flex items-center justify-start gap-4 pl-6 py-3 hover:text-purple-600 transition-all duration-300'>
                <FaDollarSign size={22} className='hover:animate-bounce' />
                Pricing</Link>
            <ul className='w-full hover:bg-white/15 flex items-center justify-start gap-4 pl-6 py-3 hover:text-purple-600 transition-all duration-300'><FaInstagram size={22} className='hover:animate-bounce' />Socials</ul>
            <ul className='w-full hover:bg-white hover:text-black flex items-center justify-start gap-4 pl-6 py-3  transition-all duration-300 absolute bottom-10'><MdDownload className='hover:text-sky-600 transition-all duration-300' size={22} /> Download Our App </ul>
        </div>
    </>)
}

export default Sidebar;