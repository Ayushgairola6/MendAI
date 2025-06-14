import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdSettings } from 'react-icons/md';
import { FaLightbulb, FaSun, FaMoon, FaAddressCard } from 'react-icons/fa';
import EditModal from './EditProfileModal';
import Socials from './Sociala';
import { RiMenu4Fill } from "react-icons/ri";
import { CiLogin } from "react-icons/ci";
import { FaInstagram } from "react-icons/fa";
import Sidebar from './SideBar';
import { MdDownload } from 'react-icons/md';
import { motion } from 'framer-motion';
import AppModal from './DownloadAppModal';
import { FaUserAstronaut } from 'react-icons/fa6';
const Navbar = ({ color, setColor, user, isLoggedIn, isSeen, setSeen }) => {

  const [visible, setVisible] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const [theme, setTheme] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currTab, setCurrTab] = useState("Chat")
  return <>

    <div onClick={() => {
      visible === true ? setVisible(false) : null;
    }} className="bg-black px-6  py-2 text-white flex items-center justify-between sticky top-0 left-0 w-full z-999 font-mono text-sm ">

      <Sidebar isVisible={showSidebar} setIsVisible={setShowSidebar} isLoggedIn={isLoggedIn} />
      <Link to="/" className='font-mono text-xl '>ALICE</Link>
      {/* menu button and user image */}
      <motion.ul whileTap={{ scale: 1.18 }} className='flex items-center justify-center gap-3 flex-row-reverse md:hidden lg:hidden cursor-pointer '><RiMenu4Fill onClick={() => setShowSidebar(!showSidebar)} size={!user ? 24 : 42} />
        {isLoggedIn === true ? <Link to="/DashBoard" className='h-4/5 w-4/5  rounded-lg '> {user?.image ? <img className='border-0 rounded-lg h-10 w-10  ' src={user ? user.image : ""} alt="/" /> : <FaUserAstronaut size={22} />}</Link> : null}

      </motion.ul>

      {/* large screen navlinks */}
      <div className='hidden md:flex lg:flex items-center justify-evenly gap-3 p-1 relative'>



        {isLoggedIn === true ? <Link to="/DashBoard" className='h-full w-full  rounded-lg '> {user?.image ? <img className='border-0 rounded-lg h-10 w-10  ' src={user ? user.image : ""} alt="/" /> : <FaUserAstronaut size={22} />}</Link> : null}

        <Link onClick={() => setCurrTab("Chat")} className={`w-full  rounded-xl  px-3  transition-all duration-500  flex items-center justify-center gap-2  py-2 ${currTab === "Chat" ? "bg-white text-black" : "bg-white/5 text-white "}`} to="/">Chat </Link
        >
        <Link onClick={() => setCurrTab("Plans")} className={`w-full  rounded-xl  px-3  transition-all duration-500  flex items-center justify-center gap-2  py-2  ${currTab === "Plans" ? "bg-white text-black" : "bg-white/5 text-white "}`} to="/Plans">Plans </Link>

        {isLoggedIn === true ? <ul onClick={() => {
          if (showSocials === true) {
            setShowSocials(false)
          }
          setVisible(!visible)
          setCurrTab("Account")
        }} className={`relative   rounded-xl  px-3  transition-all duration-500  flex items-center justify-center gap-2  py-2  ${currTab === "Account" ? "bg-white text-black" : "bg-white/5 text-white "} cursor-pointer`}>Account
        </ul>

          : (<>
            <Link className='w-full hover:bg-white rounded-xl  px-3 hover:text-black transition-all duration-500  flex items-center justify-center gap-2  py-2' to="/Login">Login </Link>

            <Link to='/Register' className='w-full hover:bg-white rounded-xl transition-all duration-500 px-3 hover:text-black  flex items-center justify-center gap-2  py-2'>Register</Link></>)}

        <EditModal setVisible={setVisible} visible={visible} />
        <Link onClick={() => {
          if (visible === true) {
            setVisible(false)
          }
          setShowSocials(!showSocials)
          setCurrTab("Socials")
        }} className={`relative flex items-center justify-center gap-2  ${currTab === "Socials" ? "bg-white text-black" : "bg-white/5 text-white "} hover:bg-white rounded-xl  px-3 hover:text-black transition-all duration-500  py-2`}>Socials</Link>
        {/* <Link to="/Plans">Premium</Link> */}
        <Socials showSocials={showSocials} />
        {/* toggle theme */}


      </div>

    </div>


  </>
}

export default Navbar;