import React, { useRef, useState, useEffect } from "react";
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiChatVoiceAiLine,
  RiUserVoiceFill,
  RiDeleteBinLine,
  RiSendPlaneFill,
  RiMicLine,
  RiMicOffLine,
  RiPlayCircleLine,
  RiStopCircleLine,
  RiRefreshLine
} from "react-icons/ri";
import { CiMicrophoneOn } from "react-icons/ci";
const InterFace = ({ user, isLoggedIn, setIsLoggedIn, color }) => {
  const InputRef = useRef(null);
  const socket = useRef(null);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [aiThinking, setAiThinking] = useState(false);



  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!isLoggedIn) return;

    const handleChatHistory = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/chat/history/data", {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setMessages(response.data);
      } catch (error) {
        console.error(error);
        throw new Error("Error while fetching chat history");
      }
    };
    handleChatHistory();
  }, [isLoggedIn]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (isLoggedIn === false) return;
    // http://localhost:8080
    socket.current = io("http://localhost:8080", {
      auth: {
        token: token,
      },
      withCredentials: true,
      transports: ["websocket", "polling"], // WebSocket first, fallback to polling
      upgrade: true, // allow transport upgrade
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 20000,
    });


    socket.current.on("connect", () => {
      console.log("socket has connected")
    });

    socket.current.on("newMessage", (data) => {

      if (user && data.user_id !== user.id) {
        // console.log(data);
        setAiThinking(false);
        setMessages((prev) => [...prev, data]);
      }

    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [isLoggedIn, user]);

  function SendMessage(e) {
    e.preventDefault();
    if (!isLoggedIn && InputRef.current.value) {
      navigate("/Register");
      return;
    }
    if (InputRef.current.value === "" || !user || aiThinking === true) return;
    const newMessage = { message: InputRef.current.value, user_id: user.id, name: user.name }
    // messages.push({ message: InputRef.current.value, user_id: user.id, name: user.name });
    setMessages((prev) => [...prev, newMessage]);
    socket.current.emit("message", { message: InputRef.current.value, user_id: user.id, sender_name: user.name });
    InputRef.current.value = "";
    setAiThinking(true);

  }




  // the scroll into view to make the container slide up on its own
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, SendMessage]);

  return (
    <form onSubmit={(e) => SendMessage(e)} className="h-screen max-h-screen flex flex-col items-center justify-evenly p-2 bg-black text-white relative md:w-[60vw] md:mx-auto ">
      {/* <div className={`${aiThinking === true ? "block" : "hidden"} absolute top-40 right-20 flex items-center justify-center rounded-xl font-bold text-black animate-pulse bg-gray-400 border border-l-purple-700 border-b-blue-700 border-r-indigo-700 border-t-sky-700 p-2  transition-all `}>
        <span>Thinking..</span>
      </div> */}

      <div className="flex flex-col w-full min-h-[90vh]  bg-gradient-to-br from-white/5 to-black border-gray-200 rounded-3xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)]">


        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
          {messages !== null && messages.length > 0 && user !== null ? (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <React.Fragment key={`${msg.user_id}-${msg.message}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.user_id === user.id ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md px-4 py-2 rounded-xl text-sm shadow-2xs  ${msg.user_id === user.id ? "bg-white/10 border-r border-purple-900  text-black" : "bg-white/15 text-black border-l border-purple-900"}`}
                    >
                      <p className={`text-lg font-bold ${msg.user_id === user.id ? "text-purple-500" : "text-indigo-500"} mb-1`}>{msg.user_id === user.id ? msg.name : "Alice"}</p>
                      <p className={` font-semibold font-mono text-white`}>{msg.message}</p>
                    </div>
                    <motion.div
                      key="typing-indicator"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-start"
                    >
                      {/* <TypingIndicator /> */}
                    </motion.div>
                  </motion.div>
                  {/* AI Typing Indicator below the last message */}
                  {aiThinking && index === messages.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-end"
                    >
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl  text-gray-300 ">
                        <span className="animate-pulse text-white font-mono">thinking<span className="animate-bounce">...</span></span>
                      </div>
                    </motion.div>
                  )}
                  {/* bottomRef after last message */}
                  {index === messages.length - 1 && <div className="relative" ref={bottomRef}></div>}
                </React.Fragment>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-full  text-gray-400 font-sans text-sm">
              Please! Be respectful ,and enjoy your personal time!
            </div>
          )}
        </div>

        <div className="py-2 px-1 border-t border-gray-800 bg-gradient-to-br from-black to-white/10 flex items-center justify-between gap-2">
          <textarea
            ref={InputRef}
            type="text"
            rows="3"
            placeholder="Type your message..."
            className="flex-1 ring-gray-400 ring-1 text-white font-sans  px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-white-500 text-sm transition-all duration-200 shadow-inner"
          />

          <div className="flex items-center justify-center gap-1 ">
            {/* <ul className="p-2 rounded-full bg-white/20 cursor-pointer hover:scale-110 transition-all duration-500 shadow-sm hover:shadow-purple-600">
              {isRecording === false ? <CiMicrophoneOn onClick={() => {
                if (permissionGranted === false) {
                  getMicrophonePermission()
                }
                if (isRecording === false) {
                  handleVoiceRecording()
                } else {
                  stopRecording()
                }
              }} color="white" size={17} /> :

                <RiChatVoiceAiLine onClick={() => {
                  if (isRecording === true) {
                    stopRecording()
                  }
                }} color="white" size={17} />
              }
            </ul> */}

            {aiThinking === false ? <motion.button
              whileTap={{ scale: 0.9 }}
              className="ml-3 bg-gradient-to-br from-[#77A1D3] via-[#79CBCA] to-[#E684AE] text-black font-bold px-3 py-3 md:py-4 md:px-4 cursor-pointer rounded-xl shadow-lg text-sm hover:brightness-110 transition-all "
            >
              Send
            </motion.button> : <button className="ml-3 bg-gradient-to-r from-white/15  to-white/5 border  text-white font-bold px-3 py-3 md:py-4 md:px-4 cursor-pointer rounded-xl shadow-lg text-sm hover:brightness-110 transition-all ">Send</button>}
          </div>

        </div>
      </div>
    </form >

  );
};

export default InterFace;
