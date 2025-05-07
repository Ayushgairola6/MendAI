import { useEffect, useState } from "react";
import { FaRegThumbsUp, FaRegThumbsDown, FaRegComments } from "react-icons/fa";
import Evil from '../assets/devil-svgrepo-com.svg'
import smile from '../assets/in-love-svgrepo-com.svg'
import cry from '../assets/cry-svgrepo-com.svg'
import shutup from '../assets/shut-up-svgrepo-com.svg'
import injured from '../assets/injuried-svgrepo-com.svg'
import { CiMenuKebab } from 'react-icons/ci';
import { FaMessage } from "react-icons/fa6";
import { MdExpandMore } from "react-icons/md";
import { SlUserFollow } from 'react-icons/sl';
import { Link } from 'react-router-dom'

const DetailedPost = () => {
    const [vibe, setVibe] = useState(false)
    const [cussReaction, setCurrReaction] = useState(null);
    const [showOption, setShowOptions] = useState(false);
    const [indicate, setIndicate] = useState(false);
    useEffect(() => {
        const reaction = JSON.parse(localStorage.getItem("user_reaction"));

        if (!reaction) return;
        setCurrReaction(reaction);

    }, [cussReaction])

    const reactions = [{
        id: 0,
        name: "naughty",
        link: Evil
    },
    {
        id: 1,
        name: "Wow",
        link: smile
    }, {
        id: 2,
        name: "Injured",
        link: injured
    }, {
        id: 3,
        name: "cry",
        link: cry
    }, {
        id: 4,
        name: "No Words",
        link: shutup
    }]


    function SaveReaction(e) {
        if (e) {
            setVibe(false)
            setCurrReaction(e.link)
            localStorage.setItem("user_reaction", JSON.stringify(e.link));
        }
    }

    return (<>
        {/* main container */}
        <div className="h-screen ">
            {/* the top most container that contains the user name and post data  */}
            <div className="w-full  h-full">
                <section className="flex items-center justify-between gap-2 py-2 px-4">
                    <div className="flex items-center justify-center flex-col gap-2">
                        <img className="h-25 w-25 rounded-full" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQX_XAKqFiXUPYKF2qXPFZcDmzQ7SoDJj_OiQ&s" alt="" />
                        <span className="font-bold text-green-800 text-2xl">@Sassy_Baka</span>
                    </div>

                    <span className="flex items-center justify-between px-4  gap-4  ">


                        <CiMenuKebab onMouseEnter={()=>setIndicate(true)} onMouseLeave={()=>setIndicate(false)} className="relative cursor-pointer" onClick={() => setShowOptions(!showOption)} size={30} />
                        {indicate === true ? <label className="text-white font-bold bg-black  text-sm py-1 px-3 rounded-full absolute right-10 top-5" htmlFor="menu">Menu</label> : null}
                        {showOption === true ?
                            <div onClick={() => setShowOptions(!showOption)} className="absolute right-20 top-20 bg-black text-white rounded-xl w-[10rem] p-3 font-bold  flex items-normal justify-center flex-col gap-4 z-99 cursor-pointer">
                                <ul className="flex items-center justify-evenly  px-3 transition-all duration-300 hover:bg-white rounded-full  hover:text-black " aria-label="Connect">Connect <FaMessage size={12} /></ul>
                                <ul className="flex items-center justify-evenly  px-3 transition-all duration-300 hover:bg-white rounded-full  hover:text-black " aria-label="Follow">Follow <SlUserFollow size={17} /></ul>
                                <ul className="flex items-center justify-evenly  px-3 transition-all duration-300 hover:bg-white rounded-full  hover:text-black " aria-label="More">More <MdExpandMore size={20} /></ul >
                            </div> : null}

                    </span>
                </section>
                <section className="w-full px-3 relative">
                    <img className="w-4/5 m-auto max-h-[25rem] rounded-xl " src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgTLUa8WItOo5pIFclksCDCRhcteghU1vLMw&s" alt="" />
                    <h1 className="absolute text-3xl font-bold text-gray-300 text-center w-full bottom-10 ">He Started Clapping When the Plane Landed</h1>
                </section>
                {/* this container contains the post body with reaction buttons */}
                <div className="p-2 w-full flex">
                    <p className="p-2 text-xl w-4/5 m-auto font-semibold">Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas autem dolore aut similique nesciunt deleniti, consequuntur qui temporibus reprehenderit, animi explicabo, ratione impedit magni a fugit minus necessitatibus debitis beatae? Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero, assumenda dolores dolorem eius repellendus iste sequi est! Mollitia, cupiditate placeat, dignissimos eum praesentium sequi doloribus neque temporibus, laudantium pariatur quis saepe necessitatibus beatae alias quaerat possimus quos. Omnis, soluta!</p>
                </div>
                <div className="flex items-center justify-center gap-5 p-4 relative cursor-pointer">
                    <button
                        onClick={() => setVibe(!vibe)}
                        className="hover:scale-105 transition-all duration-500 cursor-pointer flex items-center justify-center gap-1"
                    >
                        {cussReaction !== null ? <img className="h-8 hover:scale-125 transition-all duration-500" src={cussReaction} alt="" /> : <FaRegThumbsUp size={22} />}
                        <span className="text-xl">0</span>
                    </button>

                    {/* Icons appear above the main buttons */}
                    <div
                        className={`absolute flex items-center justify-center gap-2 bottom-16 ${vibe ? "flex" : "hidden"
                            } transition-all duration-500`}
                    >
                        {reactions.map((e, i) => (
                            <img
                                key={e.id}
                                onClick={() => SaveReaction(e)}
                                className="h-10 hover:scale-125 transition-all duration-500"
                                src={e.link}
                                alt={`reaction-${i}`}
                            />
                        ))}
                    </div>

                    <button className="hover:scale-125 transition-all duration-500 cursor-pointer flex items-center justify-center gap-1">
                        <FaRegThumbsDown size={28} />
                        <span className="text-xl">0</span>
                    </button>
                    <button className="hover:scale-125 transition-all duration-500 cursor-pointer flex items-center justify-center gap-1">
                        <FaRegComments size={28} />
                        <span className="text-xl">0</span>
                    </button>
                </div>

            </div>



        </div>
    </>)
}

export default DetailedPost;