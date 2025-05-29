import React, { useState } from 'react';
import axios from 'axios';
import {IoClose} from 'react-icons/io5'
const Pricing = () => {
    const [paymentStatus, setPaymentStatus] = useState("idle");
    const plans = [
        {
            name: "Lil Vibe",
            validity: "2",
            Internationalprice: 2.49,
            IndianPrice: 49,
            planType: "Casual Vibes",
            description: "Just vibin'. Try it out, see the feels, and decide if we click.",
            features: ["Light chat support", "Chill convos only", "Lowkey memory vibes"],
        },
        {
            name: "Glow Up",
            validity: "30",
            planType: "Getting spicy",
            Internationalprice: 17.99,
            IndianPrice: 699,
            description: "Your AI bestie gets you. Real convos, deep thoughts, safe space.",
            features: ["Remembers your hot takes", "Mood-checks on point", "Tailored advice with ✨ energy"],
        },
        {
            name: "Main Character",
            validity: "90",
            planType: "Serious Series",
            Internationalprice: 45,
            IndianPrice: 1999,
            description: "Long-term realness. You’re the main character, we keep the plot juicy.",
            features: ["Remembers the lore", "Deep vibe checks", "Whole arc energy 🔥"],
        },
    ];

    const handlePayment = async (amount, currency, validity, planType) => {
        setPaymentStatus("pending")
        const token = localStorage.getItem("auth_token")
        try {
            const { data: order } = await axios.post("https://mendai.onrender.com/payment/place-order", {
                amount: currency === "INR" ? amount : Math.round(amount * 83),
                currency,
                validity,
                planType
            }, {
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const options = {
                key: "rzp_test_TuuPu11Lj8ctnK",
                amount: order.amount,
                currency: order.currency,
                validity: order.validity,
                name: " MendAI",
                description: "Plan purchase",
                order_id: order.id,
                handler: async function (response) {
                    const verifyRes = await axios.post("https://mendai.onrender.com/payment/clearance", {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        amount, currency, validity, planType
                    }, {
                        withCredentials: true,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    })
                    if (verifyRes.data.success) {
                        setPaymentStatus("success");
                    } else {
                        setPaymentStatus("failed")
                        setTimeout(()=>{
                            setPaymentStatus("idle");
                        },2000)
                    }
                },
                // prefill: {
                //     name: "Random_dude",
                //     email: "Randomdude123@gmail.com",
                //     contact: "9999999999",
                // },
                theme: {
                    color: "lime", // Tailwind pink-500
                },
            };

            const razor = new window.Razorpay(options);
            razor.open();
        } catch (err) {
            console.error("Payment error:", err);
            alert("Payment failed!");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 relative">
            {paymentStatus !== "idle" ? (
                <div
                    className={`absolute top-5 right-5 border py-6 px-12 rounded-xl font-bold ${
                        paymentStatus === "pending"
                            ? "text-green-700 bg-green-200 border-green-700"
                            : paymentStatus === "success"
                            ? "text-sky-700 bg-sky-200 border-sky-700"
                            : "text-red-700 bg-red-200 border-red-700"
                    }`}
                >
                    <IoClose onClick={()=>setPaymentStatus("idle")}  className='absolute top-2 right-2 cursor-pointer hover:bg-red-600 hover:text-white transition-all duration-300 rounded-xl'/>
                    {paymentStatus === "pending"
                        ? "Payment pending"
                        : paymentStatus === "success"
                        ? "Payment Verified"
                        : "Payment unsuccessfull"}
                </div>
            ) : null}
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-white tracking-tight">Your Vibe, Your Plan</h1>
                <p className="text-base text-lime-400 mt-4">Choose a plan that feels right. Stay chill, stay connected.</p>
            </header>

            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 justify-center items-start px-4">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-black text-white rounded-xl border border-gray-200 p-8 transition-colors duration-300 ease-in-out w-full"
                    >
                        <div className="flex justify-between items-center">
                            <span className="bg-gradient-to-r from-lime-400 to-teal-400 text-black px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                {plan.name}
                            </span>
                            <p className='text-xs text-gray-300'>{plan.planType}</p>
                            <span className="text-sm text-gray-400">{plan.validity}days</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-teal-500">${plan.Internationalprice}</p>
                            <p className="text-2xl font-bold text-lime-500">₹{plan.IndianPrice}</p>
                            <p className="mt-2 text-sm text-gray-300">{plan.description}</p>
                        </div>
                        <ul className="mt-6 space-y-2">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center text-white text-sm">
                                    <span className="mr-2 text-pink-300">&#x2714;</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Two buttons for INR and USD */}
                        <div className="mt-8 grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handlePayment(plan.IndianPrice, "INR", plan.validity, plan.planType)}
                                className="bg-lime-500 text-black font-bold cursor-pointer py-2 px-4 rounded-full hover:bg-lime-600 transition-colors text-sm"
                            >
                                Pay ₹{plan.IndianPrice}
                            </button>
                            <button
                                onClick={() => handlePayment(plan.Internationalprice, "USD", plan.validity, plan.planType)}
                                className="bg-teal-500 text-black font-bold cursor-pointer py-2 px-4 rounded-full hover:bg-teal-600 transition-colors text-sm"
                            >
                                Pay ${plan.Internationalprice}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="mt-12 text-center text-gray-400 text-xs">
                <p>Secure, accessible, and tuned to your vibe.</p>
            </footer>
        </div >
    );
};

export default Pricing;
