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
const Navbar = ({ color, setColor, user, isLoggedIn }) => {

  const [visible, setVisible] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const [theme, setTheme] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  return <>

    <div className="bg-black px-6  py-2 text-white flex items-center justify-between sticky top-0 left-0 w-full z-999 font-bold text-sm">
      <Sidebar isVisible={showSidebar} setIsVisible={setShowSidebar} isLoggedIn={isLoggedIn} />
      <Link to="/" className='font-serif text-2xl'>ALICE</Link>
      <ul onClick={() => setShowSidebar(!showSidebar)} className='block md:hidden lg:hidden'><RiMenu4Fill size={30} /></ul>
      <div className='hidden md:flex lg:flex items-center justify-evenly gap-3 p-1'>

        {isLoggedIn === true ? <Link className='h-full w-full border rounded-full border-lime-600'> <img className='border-0 rounded-full h-10 w-10  ' src={user ? user.image : "/"} alt="/" /></Link> : null}
        <Link className='w-full hover:bg-white rounded-xl  px-3 hover:text-black transition-all duration-500  flex items-center justify-center gap-2  py-2' to="/">Chat </Link>
        {isLoggedIn === true ? <Link onClick={() => {
          if (showSocials === true) {
            setShowSocials(false)
          }
          setVisible(!visible)
        }} className='relative   hover:bg-white rounded-xl  px-3 hover:text-black transition-all duration-500  flex items-center justify-center gap-2  py-2'>Account
        </Link>
          : (<>
            <Link className='w-full hover:bg-white rounded-xl  px-3 hover:text-black transition-all duration-500  flex items-center justify-center gap-2  py-2' to="/Login">Login </Link>
            <Link to='/Register' className='w-full hover:bg-white rounded-xl transition-all duration-500 px-3 hover:text-black  flex items-center justify-center gap-2  py-2'>Register</Link></>)}
        <EditModal setVisible={setVisible} visible={visible} />
        <Link onClick={() => {
          if (visible === true) {
            setVisible(false)
          }
          setShowSocials(!showSocials)
        }} className='relative flex items-center justify-center gap-2 hover:bg-white rounded-xl  px-3 hover:text-black transition-all duration-500  py-2'>Socials</Link>
        {/* <Link to="/Plans">Premium</Link> */}
        <Socials showSocials={showSocials} />
        {/* toggle theme */}
        <section onClick={(e) => {
          setTheme(!theme);
          if (e.target.innerText === "Light" || e.target.innerText === "Dark") {
            setColor(e.target.innerText)
          }
        }}>
          {/* <FaLightbulb className='relative' size={20} />
          {theme === true ? <div className={`absolute bg-black top-20 right-15 p-2  rounded-lg`} >
            <ul className='flex items-center justify-center mt-1 gap-2' >Dark <FaMoon /></ul>
            <ul className='flex items-center justify-center mt-1 gap-2'>Light <FaSun /></ul>
          </div> : null} */}
        </section>

      </div>

    </div>


  </>
}

export default Navbar;