import { FaInstagram, FaWhatsapp, FaGithub } from "react-icons/fa";
const Socials = ({ showSocials }) => {
  return (<>
    <div className={`border border-blue-400  font-bold items-center justify-center gap-3 absolute transition-all top-15 right-15  p-2 w-[9rem] h-fit  bg-black text-white rounded-xl  ${showSocials === true ? " flex " : " hidden "}`} >
      <a href="https://www.instagram.com/that_man_006/">
        <FaInstagram size={22} className="hover:scale-120 cursor-pointer transition-all" />
      </a>
      <a href="https://wa.me/8126687562"><FaWhatsapp size={22} className="hover:scale-120 cursor-pointer transition-all" /></a>
      <a href="https://github.com/Ayushgairola6"><FaGithub size={22} className="hover:scale-120 cursor-pointer transition-all" /></a>
    </div>
  </>)
}

export default Socials;