import { Link } from 'react-router-dom';
import { FaHome, FaRegEdit } from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';
const EditModal = ({ visible, setVisible }) => {
   return (<>
      <div onClick={() => setVisible(!visible)} className={`border border-blue-400 flex flex-col items-center justify-center gap-3 absolute transition-all top-15 right-30  p-2  bg-black text-white rounded-xl  ${visible === true ? " flex " : " hidden "}`} >
         <Link to="/" className='flex items-center justify-start gap-3  cursor-pointer transition-all hover:bg-white hover:text-black w-full rounded-xl py-1 px-4'>
            <ul   >
               Home
            </ul>
            <FaHome />
         </Link>
         <Link to="/DashBoard" className='flex items-center justify-start gap-3  cursor-pointer transition-all hover:bg-white hover:text-black w-full rounded-xl py-1 px-4 '>
            <ul   >
                Profile
            </ul>
            <FaRegEdit />
         </Link>
         <Link to="/" className='text-red-700 flex items-center justify-start gap-3  cursor-pointer transition-all hover:bg-white  w-full rounded-xl py-1 px-4  '>
            <ul   >
               Log out
            </ul>
            <MdLogout />
         </Link>

      </div>
   </>)
}

export default EditModal;