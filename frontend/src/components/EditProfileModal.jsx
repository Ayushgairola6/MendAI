import { Link } from 'react-router-dom';
import { FaHome, FaRegEdit } from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';
const EditModal = ({ visible, setVisible }) => {
   return (<>
      <div
         onClick={() => setVisible(!visible)}
         className={`border border-gray-700 shadow-xl shadow-white/10 flex-col items-center justify-center gap-3 absolute top-15 right-30 bg-black text-white rounded-lg transition-all duration-300 overflow-hidden ${visible
               ? "opacity-100 pointer-events-auto h-auto py-3"
               : "opacity-0 pointer-events-none h-0 py-0"
            }`}
      >
         <Link to="/" className='flex items-center justify-start gap-3 cursor-pointer transition-all hover:bg-white/5 hover:text-[mediumpurple] w-full py-1 px-4'>
            <FaHome />
            <ul>Home</ul>
         </Link>
         <Link to="/DashBoard" className='flex items-center justify-start gap-3 cursor-pointer transition-all hover:bg-white/5 hover:text-[mediumpurple] w-full py-1 px-4'>
            <FaRegEdit />
            <ul>Profile</ul>
         </Link>
      </div>
   </>)
}

export default EditModal;