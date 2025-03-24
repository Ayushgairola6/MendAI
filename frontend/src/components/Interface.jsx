import React, { useRef, useState, useEffect, useMemo } from "react";
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import Navbar from "./Navbar";
import axios from "axios";
const InterFace = ({ user,isLoggedIn, setIsLoggedIn }) => {

  const InputRef = useRef(null);
  const socket = useRef(null);
  const [messages,setMessages]= useState([]);
  const [newMessages,setNewMessages] = useState([])
  const navigate = useNavigate();

// fetch chat history
  useEffect(() => {
    if (isLoggedIn === false) return;
 
   const handleChatHistory = async ()=>{
    try{
      const response = await axios.get("http://localhost:8080/api/chat/history/data",{withCredentials:true});
      console.log(response.data);
      setMessages(response.data)
    }catch(error){
      console.log(error);
      throw new Error("Error while fetching chat history");
    }
   }
  handleChatHistory();
  }, [isLoggedIn])


  // connect to the socket
  useEffect(() => {
    if (isLoggedIn === false) return;

    // Initialize socket connection
    socket.current = io("http://localhost:8080");

    //  default connection event to connect with the server
    socket.current.on("connect", () => {
      console.log("Socket connection started");
    });

    //  join event listening
    socket.current.on("newMessage", (data) => {
      console.log("message has been sent and recieved")
      console.log(data);
      setMessages((prev)=>[...prev,data]);
    });

    // Cleanup function to close the socket connection
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        console.log("Socket disconnected");
      }
    };
  }, [isLoggedIn]);

  function SendMessage() {
    if (isLoggedIn === false && InputRef.current.value) {
      navigate("/Register")
      return;
    }
    if (InputRef.current.value === "" || !user ) return;

    socket.current.emit("message", { message: InputRef.current.value,user_id:user.id ,sender_name:user.name});
    InputRef.current.value = "" 
  }

  return (<>
    {/* main body */}
    <Navbar></Navbar>

    <div   className=" h-screen max-h-screen flex flex-col items-center justify-center p-2 ">
      <div className="border border-gray-400 shadow-md shadow-gray-700 rounded-lg h-full w-4/5 overflow-auto relative">
        <div className=" w-full bg-black/80  text-white p-2 font-bold text-xl sticky top-0">
          <label >ALICE</label><img src="/" alt="" />
        </div>
          {messages.length>0 &&user!==null ?messages.map((msg,index)=>{
            return (<>
             <div key={index} className={` ${msg.user_id===user.id?"text-left":"text-right"} p-2 mt-2`}>
              <ul className="font-bold text-lg">{msg.user_id===user.id?msg.name:"Alice"}</ul>
              <ul className={`${msg.user_id===user.id?"text-green-700":"text-blue-700"}`}>{msg.message}</ul>
             </div>
             
            </>)
          }):<span>Please! Be respectful Alice responds based on you messages.</span>}
        {/* messages will render here */}
      </div>
      {/* button and input container */}
      <div className="flex items-center justify-evenly h-20  w-4/5 mt-4 border border-gray-400 shadow-md shadow-gray-500 rounded-lg">
      <input ref={InputRef} className="w-4/5 py-4 px-4 font-bold rounded-lg focus:outline-none focus:ring-0" placeholder="Enter your message here" type="text" />         <button onClick={SendMessage} style={{ background: "red", color: "white", boxShadow: "1px 3px 2px black" }} className="cursor-pointer px-6 py-2 font-bold rounded-xl ">Send</button>
      </div>
    </div>

  </>)
}

export default InterFace;