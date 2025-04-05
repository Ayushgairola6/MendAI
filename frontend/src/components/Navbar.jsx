import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdSettings } from 'react-icons/md';
import { FaLightbulb, FaSun,FaMoon } from 'react-icons/fa';
import EditModal from './EditProfileModal';
import Socials from './Sociala';
const Navbar = ({color,setColor,user}) => {

  const [visible, setVisible] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const [theme, setTheme] = useState(false);
  return <>

    <div className="bg-black px-6  py-2 text-white flex items-center justify-between sticky top-0 left-0 w-full z-999 font-bold text-sm">
      <img className='border-0 rounde-full h-10 w-10' src=".\src\assets\react.svg" alt="" />
      <div className='flex items-center justify-evenly gap-4'>
        <Link> <img className='border-0 rounded-full h-10 w-10' src={user?user.image:"/"} alt="/" /></Link>
        <Link onClick={() => {
          if (showSocials === true) {
            setShowSocials(false)
          }
          setVisible(!visible)
        }} className='relative flex items-center justify-center gap-1'>Account
        </Link>
        <EditModal visible={visible} />

        <Link onClick={() => {
          if (visible === true) {
            setVisible(false)
          }
          setShowSocials(!showSocials)
        }} className='relative'>Socials</Link>
        <Socials showSocials={showSocials} />
        {/* toggle theme */}
        <section onClick={(e) => {setTheme(!theme); 
          if(e.target.innerText==="Light" || e.target.innerText==="Dark"){
            setColor(e.target.innerText )
          }
        }}>
          <FaLightbulb   className='relative' size={20} />
          {theme === true ? <div className={`absolute bg-black top-20 right-15 p-2  rounded-lg`} >
            <ul  className='flex items-center justify-center mt-1 gap-2' >Dark <FaMoon /></ul>
            <ul  className='flex items-center justify-center mt-1 gap-2'>Light <FaSun/></ul>
          </div> : null}
        </section>

      </div>

    </div>


  </>
}

export default Navbar;