import React, { useRef, useState, useEffect } from "react";
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";

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
        const response = await axios.get("https://mendai.onrender.com/api/chat/history/data", {
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
    // https://mendai.onrender.com
    socket.current = io("https://mendai.onrender.com", {
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
    messages.push({ message: InputRef.current.value, user_id: user.id, name: user.name });
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
    <form onSubmit={(e) => SendMessage(e)} className="h-screen max-h-screen flex flex-col items-center justify-evenly p-2 bg-black text-white relative">
      <div className={`${aiThinking === true ? "block" : "hidden"} absolute top-20 right-20 flex items-center justify-center rounded-xl font-bold text-black animate-pulse bg-gray-400 border border-l-purple-700 border-b-blue-700 border-r-indigo-700 border-t-sky-700 p-2  transition-all `}>
        <span>Thinking..</span>
      </div>

      <div className="flex flex-col w-full min-h-[90vh]  bg-gradient-to-br from-white/5 to-black border-gray-200 rounded-3xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)]">


        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
          {messages !== null && messages.length > 0 && user !== null ? (
            <AnimatePresence>
              {messages.map((msg, index) => (<>
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.user_id === user.id ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md px-4 py-2 rounded-xl text-sm shadow-md ${msg.user_id === user.id ? "bg-sky-100 text-black" : "bg-red-100 text-black"}`}
                  >
                    <p className={`text-lg font-bold ${msg.user_id === user.id ? "text-purple-600" : "text-indigo-600"} mb-1`}>{msg.user_id === user.id ? msg.name : "Alice"}</p>
                    <p className={` font-semibold ${msg.user_id === user.id ? "font-sans" : "font-mono"}`}>{msg.message}</p>

                  </div>
                  <motion.div
                    key="typing-indicator" // Essential for AnimatePresence to work on its own
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-start" // Typically Alice's message, so justify-start
                  >
                    {/* <TypingIndicator /> */}
                  </motion.div>
                  <div className="relative  " ref={bottomRef}></div>

                </motion.div>
              </>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-full  text-gray-400 font-sans text-sm">
              Please! Be respectful ,and enjoy your personal time!
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-800 bg-gradient-to-br from-black to-white/10 flex items-center">
          <input
            ref={InputRef}
            type="text"
            placeholder="Type your message..."
            className="flex-1 ring-gray-400 ring-1 text-white font-sans  px-4 py-5 rounded-lg focus:outline-none focus:ring-1 focus:ring-white-500 text-sm transition-all duration-200 shadow-inner"
          />
          {aiThinking === false ? <motion.button
            whileTap={{ scale: 0.9 }}
            className="ml-3 bg-gradient-to-br from-[#77A1D3] via-[#79CBCA] to-[#E684AE] text-black font-bold px-4 py-4 cursor-pointer rounded-xl shadow-lg text-sm hover:brightness-110 transition-all "
          >
            Send
          </motion.button> : <button className="ml-3 bg-gradient-to-r from-white/15  to-white/5 border  text-white font-bold px-4 py-4 cursor-pointer rounded-xl shadow-lg text-sm hover:brightness-110 transition-all ">Send</button>}
        </div>
      </div>
    </form>
  );
};

export default InterFace;
