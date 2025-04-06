import { Link } from 'react-router-dom';
import { FaHome, FaRegEdit } from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';
const EditModal = ({ visible, setVisible }) => {
   return (<>
      <div onClick={() => setVisible(!visible)} className={`border border-blue-400 flex flex-col items-center justify-center gap-3 absolute transition-all top-20 right-15  p-2 w-[9rem] h-[9rem]  bg-black text-white rounded-xl  ${visible === true ? " opacity-100 " : " opacity-0 "}`} >
         <ul className='flex items-center justify-center gap-3 hover:scale-120 cursor-pointer transition-all border-b '>
            <Link to="/"  >
               Home
            </Link>
            <FaHome />
         </ul>
         <ul className='flex items-center justify-center gap-3 hover:scale-120 cursor-pointer transition-all border-b '>
            <Link to="/DashBoard"  >
               Edit Profile
            </Link>
            <FaRegEdit />
         </ul>
         <ul className='text-red-500 flex items-center justify-center gap-3 hover:scale-120 cursor-pointer transition-all border-b '>
            <Link to="/"  >
               Log out
            </Link>
            <MdLogout />
         </ul>

      </div>
   </>)
}

export default EditModal;