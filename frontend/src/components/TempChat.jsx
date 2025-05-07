import { useState, useRef, useEffect } from "react";
import { io } from 'socket.io-client';
import { MdCancel } from "react-icons/md";
import axios from "axios";
export default function ChatForm({ isLoggedIn, user, rooms }) {

    const [receiverEmail, setReceiverEmail] = useState("");
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([]);
    const socket = useRef()
    const [error, setError] = useState(false);
    const [notification, setNotification] = useState(false);
    const [id, setId] = useState(null);

    // connecting with the socket
    useEffect(() => {
        const token = localStorage.getItem("temp-aut_token");
        if (isLoggedIn === false) return;

        socket.current = io("http://localhost:3000", {
            auth: {
                token: token,
            },
            transports: ["websocket", "polling"],
            upgrade: true,
            reconnection: true,
            reconnectionAttempts: 5,
            timeout: 20000,
        })
        socket.current.on("connect", () => {
            console.log("socket has connected")
        });
        socket.current.on("message_error", () => {
            setError(true);
        })
        socket.current.on("newMessage", (data) => {
            setMessages((prev) => [...prev, data]);
        });
        socket.current.on("notification", (data) => {
            console.log(data);
            setNotification(true);
        })

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [isLoggedIn]);

    function sendMessage() {
        if (socket.current) {
            socket.current.emit("message", { email: receiverEmail, text: text, user_id: id })
        }
    }




    return (
        <div className="max-w-xl mx-auto mt-10 p-6 shadow-xl rounded-2xl bg-white space-y-4 relative">
            {notification === true ? <div className="py-4 px-6 rounded-xl text-red-600 absolute top-5 left-10 bg-black flex items-center justify-center gap-4">New message has arrived!<MdCancel onClick={() => setNotification(false)} color="white" size={22} /></div> : null}
            {error === true ? <div className="py-4 px-6 rounded-xl text-red-600 absolute top-5 left-10 bg-black flex items-center justify-center gap-4">Something went wrong!<MdCancel onClick={() => setError(false)} color="white" size={22} /></div> : null}
            <h2 className="text-xl font-bold text-center">Send a Message</h2>
            <input
                className="w-full border p-2 rounded"
                type="email"
                placeholder="Receiver's Email"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
            />
            <textarea
                className="w-full border p-2 rounded"
                placeholder="Type your message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <textarea
                className="w-full border p-2 rounded"
                placeholder="user id..."
                value={id}
                onChange={(e) => setId(e.target.value)}
            />
            <button
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                onClick={() => sendMessage()}
            >
                Send
            </button>
        </div>
    );
}
