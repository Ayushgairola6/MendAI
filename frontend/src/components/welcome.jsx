// import "../index.css"
import { FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa6';


const Welcome = ({ delay, setDelay }) => {
    const stars = Array.from({ length: 25 });
    // text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600
    return (<>
        <div className="h-screen bg-black flex items-center justify-center relative">
           
            {/* the shooting stars */}
            <div className="absolute top-0 left-0 h-full w-full overflow-hidden z-0">
                {stars.map((_, i) => {
                    const left = Math.random() * 100;
                    const delay = Math.random() * 2;
                    const duration = 2 + Math.random() * 2;

                    return (
                        <motion.div
                            key={i}
                            className="absolute w-[1px] h-3 bg-sky-200 rounded-full rotate-10"
                            style={{ left: `${left}%`, top: -40 }}
                            initial={{ y: 0, opacity: 1 }}
                            animate={{ y: '100vh', opacity: 0 }}
                            transition={{
                                duration,
                                rotate: "45deg",
                                repeat: Infinity,
                                ease: 'easeIn',
                                delay
                            }}
                        />
                    );
                })}
            </div>
            {/* main container */}
            <motion.div initial={{ opacity: 0 }} animate={{ duration: 3, opacity: 1 }} className="text-white text-end main relative   p-4 rounded-xl">
                <h1 className="text-6xl">
                    {'MendAI'.split('').map((char, i) => (
                        <motion.span
                            key={i}
                            className="cursor-pointer inline-block"
                            initial={{ y: 0 }}
                            whileHover={{ y: 10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </h1>
                <span className="text-gray-400 text-sm heading flex items-center justify-end gap-2">Your Friend In need
                    <motion.ul whileHover={{ scale: 1.2, duration: 2 }}>
                        <FaHeart className='animate-pulse cursor-pointer' color='red' />
                    </motion.ul></span>
            </motion.div>
        </div >





    </>)
}

export default Welcome;