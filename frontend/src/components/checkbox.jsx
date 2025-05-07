import { useState } from "react"
const CheckBox = () => {
    const [selected, setSelected] = useState([]);

    const task = ["Create checkbox animation", "post the progress on peerlist", "Complete the whole UI animation challenge"]

    function handleCheck(task) {
        if(selected.includes(task)){
            const update = selected.filter((e)=>e!==task);
            setSelected(update)
        }else{
            setSelected((prev)=>[...prev,task]);
        }

    }

    return (<>
        <div className="h-screen bg-black text-white flex items-center justify-center p-2">
            <div className="border border-gray-500 p-4 rounded-xl">
                {task.map((tas, ind) => {
                    return <div  key={ind} className="flex items-center justify-between gap-6 ">
                        <input onClick={() => handleCheck(tas)} value={tas} className={`${selected.includes(tas)?"accent-blue-500  rotate-right  ":"accent-white rotate-left"} duration-200 transition-all ease-linear border-t`} type="checkbox" />
                        <ul className={`${selected.includes(tas) ? "line-through text-gray-400" : "text-white no-underline"} transition-all duration-400 ease-linear`}>{tas}</ul>
                    </div>
                })
                }
            </div>
        </div>
    </>)
}

export default CheckBox 