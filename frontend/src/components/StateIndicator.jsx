import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { GoAlertFill } from "react-icons/go";
const StateIndicator = () => {

    const [status, setStatus] = useState("idle");

    // function ManipulateStatus(e) {
    //     setStatus("checking");

    //     if (e.target.value === "fail") {
    //         // const first = setTimeout(() => {
    //         setStatus("failed");
    //         // }, 3000)

    //     } else if (e.target.value === "success") {
    //         // const first = setTimeout(() => {
    //         setStatus("success");
    //         // }, 3000)
    //     }
    // }

    useEffect(() => {
        if (status === "idle") {
            setTimeout(() => {
                setStatus("success")
            }, 3000);
        } else if (status === "success") {
            setTimeout(() => {
                setStatus("failed");
            }, 3000);
        } else if (status === "failed") {
            setTimeout(() => {
                setStatus("idle");
            }, 2000);
        }

    }, [status])

    return (<>
        <div className="h-screen flex items-center justify-center transition-all relative ">


            <div
                className={`main ${status === "idle"
                    ? "bg-blue-200 text-blue-700"
                    : status === "success"
                        ? "bg-green-200 text-green-700"
                        : status === "failed"
                            ? "bg-red-200 text-red-700"
                            : ""
                    } py-1 px-3 rounded-2xl flex items-center justify-center gap-3`}
            >
                {status === "idle" ? (
                    <div
                        className={`h-3 w-3 rounded-full border-t-2 border-blue-700 animate-spin`}
                    ></div>
                ) : status === "failed" ? (
                    <span className='animate-bounce'>
                        <GoAlertFill color='red' />
                    </span>
                ) : <span className='animate-pulse'>
                    <FaCheck color='green' />
                </span>}

                <span className={`${status === "success" ? "styled" : status === "failed" ? "styled2" : ""}`}>
                    {status === "idle" && "Analyzing Transaction"}
                    {status === "success" && "Transaction Safe"}
                    {status === "failed" && "Transaction Warning"}
                </span>


            </div>

        </div>
    </>)
}

export default StateIndicator;