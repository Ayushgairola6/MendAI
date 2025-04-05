import { FaInstagram,FaWhatsapp,FaGithub } from "react-icons/fa";
const Socials = ({showSocials})=>{
    return(<>
           <div  className={`border border-blue-400 flex font-bold items-center justify-center gap-3 absolute transition-all top-15 right-15  p-2 w-[9rem] h-fit  bg-black text-white rounded-xl  ${showSocials===true?" opacity-100 ":" opacity-0 "}`} >
           <FaInstagram size={22} className="hover:scale-120 cursor-pointer transition-all"/>
           <FaWhatsapp  size={22} className="hover:scale-120 cursor-pointer transition-all"/>
           <FaGithub  size={22} className="hover:scale-120 cursor-pointer transition-all"/>
      </div>
    </>)
}

export default Socials;