import { useEffect, useRef, useState } from "react";

const SlidingAnimation = () => {
    const [selectedTab, setSelectedTab] = useState("Free");

    const plans = [
        { type: "Free" },
        { type: "Premium", time: "Monthly", time2: "Yearly" },
    ];

    const slider = useRef();



    return (
        <div className="h-screen flex items-center justify-center">
            <div className={`flex items-center justify-center gap-10   w-[20rem] py-1 px-6 rounded-full cursor-pointer transition-all duration-200 ease-linear relative border border-gray-400 p-2`}>
                <div className={`absolute top-0 ${selectedTab === "Free" ? "-translate-x-20  w-[50%]" : "right-0 w-[60%] "} transition-all duration-200 bg-black  -z-10  h-full rounded-full `}></div>
                {plans.map((tab, ind) => (
                    <ul
                        key={ind}
                        onClick={() => setSelectedTab(tab.type)}
                        className={` ${selectedTab === tab.type
                            ? " text-white transition-all duration-200 ease-linear"
                            : " text-black transition-all duration-200 ease-linear"
                            } px-4 rounded-xl flex items-center justify-center flex-col`}
                    >
                        <span className="text-center">
                            {selectedTab === tab.type ? (
                                // If the tab is selected:
                                tab.time || tab.time2 ? (
                                    // For Premium: show only the pills (time and time2).
                                    <div className="flex items-center justify-center gap-2 py-2">
                                        {tab.time && (
                                            <ul className="bg-white text-black py-1 px-2 rounded-full transition-all duration-200 ease-linear">
                                                {tab.time}
                                            </ul>
                                        )}
                                        {tab.time2 && (
                                            <ul className="bg-white text-black py-1 px-2 rounded-full transition-all duration-200 ease-linear">
                                                {tab.time2}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <div className="font-bold ">{tab.type}</div>
                                )
                            ) : (
                                <>
                                    <div className="font-bold text-lg">{tab.type}</div>
                                    {/* ...and if available, show time/time2 (for Premium) */}
                                    {(tab.time || tab.time2) && (
                                        <div className="flex font-semibold text-xs items-center justify-center gap-2 mt-1">
                                            {tab.time && <ul>{tab.time} *</ul>}
                                            {tab.time2 && <ul>{tab.time2}</ul>}
                                        </div>
                                    )}
                                </>
                            )}
                        </span>
                    </ul>
                ))}
            </div>
        </div>


    );
};

export default SlidingAnimation;
