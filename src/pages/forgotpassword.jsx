import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isVerified, setIsVerified] = useState(null);
    const [isEmailExist, setIsEmailExist] = useState(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [otp, setOtp] = useState("");

    const [formData, setFormData] = useState({
        to_name: "",
        to_email: "",
        reply_to: " ",
        otp: "",
    });

    const sendEmail = () => {
        emailjs
            .send(
                "service_pua3st3",
                "template_3s487ev",
                formData,
                "oVqRIuWL84xUEw5fd"
            )
            .then((response) => {
                console.log("Email sent successfully:", response);
            })
            .catch((error) => {
                console.error("Error sending email:", error);
            });
    };

    const generateOTP = () => {
        return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    };

    const submitEmail = async (e) => {
        e.preventDefault();

        const response = await fetch(
            "https://sfm-api-production.up.railway.app/api/customer/email",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            }
        );

        const parseRes = await response.json();

        if (parseRes) {
            setIsEmailExist(true);
            formData.to_name = parseRes.customerfirstname;
            formData.to_email = email;

            // Generate a new OTP each time the page is 1
            formData.otp = generateOTP();

            sendEmail();

            // Disable the button and start the timer
            setIsButtonDisabled(true);
            startTimer();

            setIsVerified(null);

            setPage(2);
        } else {
            setIsEmailExist(false);
        }
    };

    const startTimer = () => {
        const countdown = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1);
        }, 1000);

        // Clear the interval when the timer reaches 0
        setTimeout(() => {
            clearInterval(countdown);
            setIsButtonDisabled(false);
            formData.otp = "";
        }, 300000); // 5 minutes in milliseconds
    };

    useEffect(() => {
        // Enable the button when the timer reaches 0
        if (timer === 0) {
            setIsButtonDisabled(false);
        }
    }, [timer]);

    const [page, setPage] = useState(1);

    useEffect(() => {
        // Reset the timer and enable the button when the page changes back to 1
        if (page === 1) {
            setTimer(300);
            setIsButtonDisabled(false);
        }
    }, [page]);

    // Generate OTP and send email again
    const submitOtp = async (e) => {
        e.preventDefault();
        try {
            formData.otp = generateOTP();

            sendEmail();

            // Reset the timer to 300 before starting it again
            setTimer(300);

            // Disable the button and start the timer
            setIsButtonDisabled(true);
            startTimer();

            setIsVerified(null);
        } catch (err) {
            console.log(err.message);
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        console.log(formData.otp.toString(), otp);
        if (otp === formData.otp.toString()) {
            setPage(3);
        } else {
            setIsVerified(false);
        }
    };

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const changePassword = async (e) => {
        e.preventDefault();
        try {
            if (password !== confirmPassword) {
                return setError("Passwords do not match");
            } else if (
                password.length < 8 ||
                !password.match(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
                )
            ) {
                return setError(
                    "Password must be at least 8 characters, and contain at least 1 uppercase letter, 1 lowercase letter, 1 number"
                );
            }

            const body = { email, password };
            const response = await fetch(
                "https://sfm-api-production.up.railway.app/api/customer/forgotpassword",
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );

            const parseRes = await response.json();

            if (parseRes) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Password changed successfully!",
                    confirmButtonText: "Go to Login",
                    timer: 5000,
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "/login";
                    }
                });
            }

            setError("");

            window.location.href = "/login";
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <section className="login bg-red-400 h-screen">
            <div className="container mx-auto px-4 relative h-full">
                <div className="flex content-center items-center justify-center h-full">
                    <div className="w-full lg:w-4/12 px-4">
                        <div
                            className="relative flex flex-col min-w-0 break-words w-full py-10 shadow-lg rounded-lg bg-white border-0"
                            style={{
                                boxShadow: "3px 3px 0 #facc15",
                            }}
                        >
                            <div className="rounded-t mb-0 px-6">
                                <div className="logo flex items-center justify-center">
                                    <img
                                        src={logo}
                                        alt="logo"
                                        className="w-32 mb-4"
                                    />
                                </div>{" "}
                                <div className="mb-4">
                                    <h4 className="text-2xl font-bold mb-1 text-red-500">
                                        Forgot Password
                                    </h4>
                                </div>
                            </div>
                            <div className="flex-auto px-6">
                                {page === 1 && (
                                    <form onSubmit={submitEmail}>
                                        <div className="relative w-full mb-3">
                                            <label
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                htmlFor="grid-password"
                                            >
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 outline-none ${
                                                    isEmailExist === false &&
                                                    "border-2 border-red-500"
                                                }`}
                                                placeholder="Email"
                                                style={{
                                                    transition: "all .15s ease",
                                                }}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                value={email}
                                            />
                                            <small className="text-red-500">
                                                {isEmailExist === false &&
                                                    "Email does not exist"}
                                            </small>
                                        </div>

                                        <div className="text-center mt-6">
                                            <button
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
                                                type="submit"
                                                disabled={isButtonDisabled}
                                            >
                                                Send Verification
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {page === 2 && (
                                    <form onSubmit={verifyOtp}>
                                        <div className="relative w-full mb-3">
                                            <label
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                htmlFor="grid-password"
                                            >
                                                OTP
                                            </label>
                                            <input
                                                type="text"
                                                className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 outline-none ${
                                                    isVerified === false &&
                                                    "border-2 border-red-500"
                                                }`}
                                                placeholder="OTP"
                                                style={{
                                                    transition: "all .15s ease",
                                                }}
                                                required
                                                onChange={(e) =>
                                                    setOtp(e.target.value)
                                                }
                                                value={otp}
                                            />
                                            {timer !== 0 && (
                                                <small className="text-red-500">
                                                    OTP will expire in {timer}{" "}
                                                    seconds
                                                </small>
                                            )}
                                            {timer === 0 && (
                                                <small className="text-red-500">
                                                    <span
                                                        onClick={submitOtp}
                                                        className="text-blue-500 cursor-pointer"
                                                    >
                                                        Resend OTP
                                                    </span>
                                                </small>
                                            )}
                                        </div>
                                        <button
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
                                            type="submit"
                                        >
                                            Verify OTP
                                        </button>
                                    </form>
                                )}
                                {
                                    // Page 3
                                    page === 3 && (
                                        <form onSubmit={changePassword}>
                                            {error && (
                                                <div className="text-red-500">
                                                    {error}
                                                </div>
                                            )}
                                            <div className="relative w-full mb-3">
                                                <label
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                    htmlFor="grid-password"
                                                >
                                                    New Password
                                                </label>
                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 outline-none"
                                                    placeholder="New Password"
                                                    style={{
                                                        transition:
                                                            "all .15s ease",
                                                    }}
                                                    onChange={(e) => {
                                                        setPassword(
                                                            e.target.value
                                                        );
                                                    }}
                                                    value={password}
                                                />
                                            </div>
                                            <div className="relative w-full mb-3">
                                                <label
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                    htmlFor="grid-password"
                                                >
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 outline-none"
                                                    placeholder="Confirm Password"
                                                    style={{
                                                        transition:
                                                            "all .15s ease",
                                                    }}
                                                    onChange={(e) => {
                                                        setConfirmPassword(
                                                            e.target.value
                                                        );
                                                    }}
                                                    value={confirmPassword}
                                                />
                                            </div>
                                            <div className="mt-1 mb-4 flex items-center">
                                                <input
                                                    type="checkbox"
                                                    value={showPassword}
                                                    onChange={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="form-checkbox text-blue-600 ml-1 w-5 h-5"
                                                />
                                                <label
                                                    className="block text-sm font-medium text-gray-700 ml-2"
                                                    htmlFor="grid-password"
                                                >
                                                    Show Password
                                                </label>
                                            </div>
                                            <button
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
                                                type="submit"
                                            >
                                                Change Password
                                            </button>
                                        </form>
                                    )
                                }
                                {/* add bback button if on page 2 set to page 1 if on page 3 set to page 2 */}
                                {/* {page === 2 && (
                                    <button
                                        className="bg-blue-600 text-white active:bg-blue-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full"
                                        onClick={() => setPage(1)}
                                    >
                                        Back
                                    </button>
                                )}
                                {page === 3 && (
                                    <button
                                        className="bg-blue-600 text-white active:bg-blue-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full"
                                        onClick={() => setPage(2)}
                                    >
                                        Back
                                    </button>
                                )} */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ForgotPassword;
