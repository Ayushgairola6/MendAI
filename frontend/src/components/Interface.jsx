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
      const response = await axios.get("https://mendai.onrender.com/api/chat/history/data",{withCredentials:true});
      // console.log(response.data);
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
    socket.current = io("https://mendai.onrender.com");

    //  default connection event to connect with the server
    socket.current.on("connect", () => {
      // console.log("Socket connection started");
    });

    //  join event listening
    socket.current.on("newMessage", (data) => {
      console.log("message has been sent and recieved")
      // console.log(data);
      setMessages((prev)=>[...prev,data]);
    });

    // Cleanup function to close the socket connection
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        // console.log("Socket disconnected");
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

    <div
  className="h-screen max-h-screen flex flex-col items-center justify-center p-2"
  style={{
    background: "linear-gradient(to bottom, #fdfcfb, #e2d9c5)", // Instagram-like gradient
  }}
>
  <div
    className="border rounded-lg w-full md:w-full h-full overflow-auto relative"
    style={{
      borderColor: "#dbdbdb", // Light gray border
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Subtle shadow
    }}
  >
    {/* Header */}
    <div
      className="w-full p-2 font-bold text-lg sticky top-0 flex items-center justify-between"
      style={{
        background: "linear-gradient(to right, black, gray, black)", // Instagram gradient
        color: "#ffffff", // White text
      }}
    >
      <label style={{ fontFamily: "Arial, sans-serif" }}>ALICE</label>
      <img
        src="/"
        alt=""
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
        }}
      />
    </div>

    {/* Messages */}
    {messages.length > 0 && user !== null ? (
      messages.map((msg, index) => (
        <div
          key={index}
          className={`${
            msg.user_id === user.id ? "text-left" : "text-right"
          } p-2`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: msg.user_id === user.id ? "flex-start" : "flex-end",
            marginTop: "8px",
          }}
        >
          <ul
            className="font-bold text-sm"
            style={{
              color: "#262626", // Dark text for names
              fontFamily: "Arial, sans-serif",
            }}
          >
            {msg.user_id === user.id ? msg.name : "Alice"}
          </ul>
          <ul
            style={{
              color:
                msg.user_id === user.id
                  ? "#009688" // Green for user messages
                  : "#405de6", // Blue for Alice's messages
              fontFamily: "Arial, sans-serif",
              fontSize: "14px", // Compact font size
            }}
          >
            {msg.message}
          </ul>
        </div>
      ))
    ) : (
      <span
        style={{
          color: "#8e8e8e", // Instagram's muted gray
          fontWeight: "bold",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px", // Compact font size
        }}
      >
        Please! Be respectful. Alice responds based on your messages.
      </span>
    )}
  </div>

  {/* Input and Button */}
  <div
    className="flex items-center justify-between w-full md:w-full mt-4 border rounded-lg"
    style={{
      borderColor: "#dbdbdb", // Light gray border
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
      height: "60px", // Reduced height for phones
      padding: "4px 8px",
    }}
  >
    <input
      ref={InputRef}
      className="w-4/5 py-2 px-3 font-bold rounded-lg focus:outline-none focus:ring-0"
      placeholder="Enter your message here"
      type="text"
      style={{
        background: "linear-gradient(to right, #f8f8f8, #ffffff)", // Light input gradient
        color: "#262626", // Dark text
        fontFamily: "Arial, sans-serif",
        fontSize: "14px", // Smaller text for compact view
      }}
    />
    <button
      onClick={SendMessage}
      className="cursor-pointer px-4 py-2 font-bold rounded-lg"
      style={{
        background:
          "linear-gradient(to right, #833ab4, #fd1d1d, #fcb045)", // Instagram gradient
        color: "#ffffff", // White text
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)", // Shadow effect
        fontSize: "14px", // Compact font size
      }}
    >
      Send
    </button>
  </div>
</div>


  </>)
}

export default InterFace;