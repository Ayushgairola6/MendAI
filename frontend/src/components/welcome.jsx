// import "../index.css"

const Welcome = () => {

    return (<>
        <div className="h-screen bg-black flex items-center justify-center relative">
            <div className="text-white text-right font-serif p-4 rounded-xl relative  
        before:absolute before:content-[''] before:w-full before:h-full before:left-0 before:top-0 
        before:border-b before:border-purple-800 before:animate-ping before:rounded-xl">
                <h1 className="text-6xl md:text-7xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">Mendai</h1>
                <span className="text-xs md:text-sm lg:text-md text-gray-300">Your Friend in Need</span>
            </div>
        </div>



    </>)
}

export default Welcome;