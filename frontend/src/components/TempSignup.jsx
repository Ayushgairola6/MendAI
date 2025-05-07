import axios from "axios";
import { useState } from "react";

export default function SignupForm({ onSignup }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function signup() {
        const response = await axios.post('http://localhost:3000/api/register', { email, password, username });
        console.log(response.data);
        localStorage.setItem("temp-aut_token", response.data);

    }
    return (
        <div className="max-w-md mx-auto mt-10 p-6 shadow-xl rounded-2xl bg-white space-y-4">
            <h2 className="text-xl font-bold text-center">Signup</h2>
            <input
                className="w-full border p-2 rounded"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
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
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                onClick={() => signup()}
            >
                Sign Up
            </button>
        </div>
    );
}
