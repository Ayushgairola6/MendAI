import { useState } from "react";
import axios from 'axios';

export default function LoginForm({ setIsLoggedIn }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    async function login() {
        console.log("called")
        const response = await axios.post('http://localhost:3000/api/login', { email, password });
        console.log(response.data)
        if (response.data.message === "success") {
            localStorage.setItem("temp-aut_token", response.data.token);
            setIsLoggedIn(false);
        }
    }


    

    return (
        <div className="max-w-md mx-auto mt-10 p-6 shadow-xl rounded-2xl bg-white space-y-4">
            <h2 className="text-xl font-bold text-center">Login</h2>
            <input
                className="w-full border p-2 rounded"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className="w-full border p-2 rounded"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                onClick={() => login()}
            >
                Login
            </button>
        </div>
    );
}
