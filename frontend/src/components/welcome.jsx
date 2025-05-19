// import "../index.css"
const Welcome = () => {
// text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600
    return (<>
        <div className="h-screen bg-black flex items-center justify-center relative">
    <div className="text-white text-right font-serif p-4 rounded-xl relative">
        <h1 className="logo p-3 rounded-xl text-6xl md:text-7xl lg:text-9xl animate-fade-in animate-float animate-scale-up">
            Mendai
        </h1>
        <span className=" text-xs md:text-xs lg:text-md text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-purple-400 animate-slide-in animate-gradient">
            Your Friend in Need
        </span>
    </div>
</div>





    </>)
}

export default Welcome;