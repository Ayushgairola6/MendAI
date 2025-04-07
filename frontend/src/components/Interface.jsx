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

  useEffect(() => {
    if (!isLoggedIn) return;

    const handleChatHistory = async () => {
      try {
        const response = await axios.get("https://mendai.onrender.com/api/chat/history/data", { withCredentials: true });
        setMessages(response.data);
      } catch (error) {
        console.error(error);
        throw new Error("Error while fetching chat history");
      }
    };
    handleChatHistory();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    socket.current = io("https://mendai.onrender.com");

    socket.current.on("connect", () => {});

    socket.current.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [isLoggedIn]);

  function SendMessage() {
    if (!isLoggedIn && InputRef.current.value) {
      navigate("/Register");
      return;
    }
    if (InputRef.current.value === "" || !user) return;

    socket.current.emit("message", { message: InputRef.current.value, user_id: user.id, sender_name: user.name });
    InputRef.current.value = "";
  }
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return (
    <div className="h-screen max-h-screen flex flex-col items-center justify-center p-2 bg-gray-950 text-white">
      <div className="flex flex-col w-full  bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)]">
 

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
          {messages.length > 0 && user !== null ? (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.user_id === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md px-4 py-2 rounded-xl text-sm shadow-md ${msg.user_id === user.id ? "bg-gradient-to-br from-blue-600 to-blue-400 text-white" : "bg-gray-700 text-white"}`}
                  >
                    <p className="text-lg font-bold text-gray-300 mb-1">{msg.user_id === user.id ? msg.name : "Alice"}</p>
                    <p>{msg.message}</p>
                  </div>
                  <div ref={bottomRef}></div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">
              Please! Be respectful. Alice responds based on your messages.
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-800 bg-gray-900 flex items-center">
          <input
            ref={InputRef}
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 shadow-inner"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={SendMessage}
            className="ml-3 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm hover:brightness-110 transition"
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default InterFace;
