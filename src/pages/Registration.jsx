import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import emailjs from "@emailjs/browser";
const emailJsConfig = {
    serviceId: "service_kol4zwf",
    templateId: "template_q860ua7",
    userId: "IN_4AFssN4LoNXUXS", // You can find this in your Email.js account settings
};

const Registration = () => {
    const [customerFirstName, setCustomerFirstName] = useState("");
    const [customerLastName, setCustomerLastName] = useState("");
    const [customerEmailAdress, setCustomerEmailAdress] = useState("");
    const [customerPassword, setCustomerPassword] = useState("");
    const [customerContactNumber, setCustomerContactNumber] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [customerHouseNumber, setCustomerHouseNumber] = useState("");
    const [customerStreet, setCustomerStreet] = useState("");
    const [customerBarangay, setCustomerBarangay] = useState("");
    const [customerCity, setCustomerCity] = useState("");
    const [customerNotes, setCustomerNotes] = useState("");
    const [customerAddressLabel, setCustomerAddressLabel] = useState("");
    const [customerLatitude, setCustomerLatitude] = useState("");
    const [customerLongitude, setCustomerLongitude] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [page, setPage] = useState(1);
    const [customerOTP, setCustomerOTP] = useState("");
    const [otp, setOtp] = useState("");

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [isOTPExpired, setIsOTPExpired] = useState(false);
    const [otpTimer, setOtpTimer] = useState(300);
    const [otpTimerId, setOtpTimerId] = useState(null);

    const generateOTP = () => {
        const digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    };
    const sendEmail = (toEmail, otp, toName) => {
        const templateParams = {
            to_email: toEmail,
            otp: otp,
            to_name: toName,
        };

        emailjs
            .send(
                emailJsConfig.serviceId,
                emailJsConfig.templateId,
                templateParams,
                emailJsConfig.userId
            )
            .then((response) => {
                console.log("Email sent successfully:", response);
            })
            .catch((error) => {
                console.error("Email failed to send:", error);
            });
    };
    const startOTPTimer = () => {
        // Clear the existing timer, if any
        stopOTPTimer();

        // Start the OTP timer
        setOtpTimerId(
            setInterval(() => {
                setOtpTimer((prevTimer) => {
                    if (prevTimer === 0) {
                        stopOTPTimer(); // Stop the timer when it reaches 0
                        setIsOTPExpired(true); // Mark OTP as expired
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000)
        );
    };

    // ... (other existing code)

    const resendOTP = () => {
        // Generate and set a new OTP
        setIsOTPExpired(false); // Mark OTP as not expired
        const newOTP = generateOTP();
        setOtp(newOTP);
        setOtpSent(true); // Mark OTP as sent
        setOtpVerified(false); // Reset OTP verification status
        setOtpTimer(300); // Reset the timer
        startOTPTimer(); // Start the timer again

        // Send the OTP via email
        const toEmail = customerEmailAdress;
        sendEmail(toEmail, newOTP, customerFirstName);

        Swal.fire({
            icon: "success",
            title: "OTP Resent!",
            showConfirmButton: false,
            timer: 1500,
        });
    };

    useEffect(() => {
        if (page === 3) {
            // Generate and set OTP when on the OTP entry page, but only if OTP is not sent yet
            const otpTemp = generateOTP();
            setOtp(otpTemp);
            setOtpSent(true); // Mark OTP as sent
            startOTPTimer();

            // Send the OTP via email
            const toEmail = customerEmailAdress;
            sendEmail(toEmail, otpTemp, customerFirstName);
        } else {
            // Cleanup the timer when the component unmounts or when the page changes
            stopOTPTimer();
        }
    }, [page, otpSent]);

    const stopOTPTimer = () => {
        // Clear the OTP timer
        clearInterval(otpTimerId);
    };

    const isVerifyButtonEnabled = customerOTP.length === 6;

    const handleVerify = async () => {
        console.log(otp);
        if (customerOTP.length === 6) {
            if (customerOTP === otp) {
                stopOTPTimer(); // Stop the timer when verification is done
                // OTP is correct
                return true;
            }
        }
    };

    const getCoordinates = async (street, barangay, city) => {
        try {
            const address = `${barangay}, ${city}`;
            const encodedAddress = encodeURIComponent(address);

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                return { lat, lng: lon };
            } else {
                const response2 = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
                );
                const data2 = await response2.json();
                if (data2 && data2.length > 0) {
                    const { lat, lon } = data2[0];
                    return { lat, lng: lon };
                } else {
                    throw new Error(
                        "Failed to get coordinates for the address"
                    );
                }
            }
        } catch (error) {
            throw error;
        }
    };

    const register = async (e) => {
        e.preventDefault();

        handleVerify();

        if (handleVerify() === true) {
            return;
        }

        if (customerPassword !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Password does not match!",
            });
            return;
        }

        try {
            const position = await getCoordinates(
                customerStreet,
                customerBarangay,
                customerCity
            );

            // Step 1: Register the customer
            const newCustomer = {
                customerID: "C" + Math.floor(Math.random() * 1000000000),
                customerFirstName,
                customerLastName,
                customerEmailAdress,
                customerPassword,
                customerContactNumber,
                userRoleID: "CUS",
            };

            const customerResponse = await fetch(
                "https://sfm-dbcc0a8f87a3.herokuapp.com/api/customer/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newCustomer),
                }
            );

            if (!customerResponse.ok) {
                throw new Error("Failed to register customer");
            }

            const newAddress = {
                customerID: newCustomer.customerID,
                customerFullName: `${newCustomer.customerFirstName} ${newCustomer.customerLastName}`,
                customerContactNumber: newCustomer.customerContactNumber,
                customerStreet: customerStreet || "",
                customerBarangay: customerBarangay,
                customerCity: customerCity,
                customerNotes: customerNotes || "",
                customerAddressLabel: customerAddressLabel,
                customerAddressDefault: true,
                addressLatitude: position.lat,
                addressLongitude: position.lng,
            };

            const addressResponse = await fetch(
                "https://sfm-dbcc0a8f87a3.herokuapp.com/api/address/add",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newAddress),
                }
            );

            if (!addressResponse.ok) {
                throw new Error("Failed to register address");
            }

            // Both customer and address registration were successful
            const customerData = await customerResponse.json();
            const addressData = await addressResponse.json();

            console.log("Customer Data:", customerData);
            console.log("Address Data:", addressData);

            Swal.fire({
                icon: "success",
                title: "Registered!",
                showConfirmButton: false,
                timer: 1500,
            });

            // Redirect to login page after successful registration
            window.location.href = "/login";
        } catch (error) {
            console.error(error.message);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
            });
        }
    };

    return (
        <section className="registration bg-red-400">
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
                <form
                    className="registration-form bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg"
                    onSubmit={register}
                    style={{
                        boxShadow: "3px 3px 0 #facc15",
                    }}
                >
                    <div className="logo flex items-center justify-center">
                        <img src={logo} alt="logo" className="w-32 mb-4" />
                    </div>
                    <div className="mb-4">
                        <h4 className="text-2xl font-bold mb-1 text-red-500">
                            Registration
                        </h4>
                        <p className="text-sm text-gray-500">
                            Already have an account?{" "}
                            <Link
                                className="text-blue-500 hover:text-blue-700"
                                to="/login"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                    <hr />
                    <div className={page === 1 ? "block mt-4" : "hidden"}>
                        <h4 className="text-sm mb-4">Personal Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label
                                    htmlFor="first_name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                    placeholder="John"
                                    value={customerFirstName}
                                    onChange={(e) =>
                                        setCustomerFirstName(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="last_name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                    placeholder="Doe"
                                    value={customerLastName}
                                    onChange={(e) =>
                                        setCustomerLastName(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                placeholder="john.doe@example.com"
                                value={customerEmailAdress}
                                onChange={(e) =>
                                    setCustomerEmailAdress(e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="contact_number"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Contact Number
                            </label>
                            <input
                                type="text"
                                id="contact_number"
                                name="contact_number"
                                className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                placeholder="e.g. 09123456789"
                                value={customerContactNumber}
                                onChange={(e) =>
                                    setCustomerContactNumber(e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        id="password"
                                        name="password"
                                        className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                        placeholder="Enter password"
                                        value={customerPassword}
                                        onChange={(e) =>
                                            setCustomerPassword(e.target.value)
                                        }
                                        required
                                    />
                                    <label
                                        className="absolute right-3 top-2 cursor-pointer"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <FontAwesomeIcon
                                                icon={faEyeSlash}
                                            />
                                        ) : (
                                            <FontAwesomeIcon icon={faEye} />
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="confirm_password"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="confirm_password"
                                        name="confirm_password"
                                        className="border border-gray-300 text-gray-900 text-sm block p-2.5 outline-none w-full"
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
                                    />
                                    <label
                                        className="absolute right-3 top-2 cursor-pointer"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <FontAwesomeIcon
                                                icon={faEyeSlash}
                                            />
                                        ) : (
                                            <FontAwesomeIcon icon={faEye} />
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() =>
                                    confirmPassword === customerPassword
                                        ? setPage(2)
                                        : Swal.fire({
                                              icon: "error",
                                              title: "Oops...",
                                              text: "Password does not match!",
                                          })
                                }
                            >
                                Next
                            </button>
                        </div>
                    </div>
                    <div className={page === 2 ? "block mt-4" : "hidden"}>
                        <div className="mb-4">
                            <label
                                htmlFor="house_number"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                House Number
                            </label>
                            <input
                                type="text"
                                id="house_number"
                                name="house_number"
                                className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                placeholder="House Number"
                                value={customerHouseNumber}
                                onChange={(e) =>
                                    setCustomerHouseNumber(e.target.value)
                                }
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="street"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Street
                            </label>
                            <input
                                type="text"
                                id="street"
                                name="street"
                                className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                placeholder="Street"
                                value={customerStreet}
                                onChange={(e) =>
                                    setCustomerStreet(e.target.value)
                                }
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Barangay
                            </label>
                            <input
                                type="text"
                                className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                placeholder="Barangay"
                                value={customerBarangay}
                                onChange={(e) =>
                                    setCustomerBarangay(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="city"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                City
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                placeholder="City"
                                value={customerCity}
                                onChange={(e) =>
                                    setCustomerCity(e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Label
                            </label>
                            <select
                                className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                value={customerAddressLabel}
                                onChange={(e) =>
                                    setCustomerAddressLabel(e.target.value)
                                }
                                required
                            >
                                <option value="home">Home</option>
                                <option value="work">Work</option>
                                <option value="others">Others</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <input
                                type="text"
                                className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                placeholder="Notes"
                                value={customerNotes}
                                onChange={(e) =>
                                    setCustomerNotes(e.target.value)
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full mr-2"
                                onClick={() => setPage(1)}
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
                                onClick={() => setPage(3)}
                            >
                                Register
                            </button>
                        </div>
                    </div>{" "}
                    <div className={page === 3 ? "block mt-4" : "hidden"}>
                        <div className="mb-4">
                            <label
                                htmlFor="otp"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                className="border border-gray-300 text-gray-900 text-sm block w-full p-2.5 outline-none"
                                placeholder="# # # # # #"
                                value={customerOTP}
                                onChange={(e) => setCustomerOTP(e.target.value)}
                                required
                            />
                            <div className="flex items-center mt-2">
                                <span className="text-gray-700 text-sm mr-2">
                                    Time remaining:
                                </span>
                                <span className="text-red-500 text-sm font-bold">
                                    {otpTimer}s
                                </span>
                                {otpTimer === 0 && (
                                    <button
                                        className="text-blue-500 text-sm ml-2 cursor-pointer"
                                        onClick={resendOTP}
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full mr-2"
                                onClick={() => setPage(2)}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full ${
                                    isVerifyButtonEnabled
                                        ? ""
                                        : "opacity-50 cursor-not-allowed"
                                }`}
                                disabled={!isVerifyButtonEnabled}
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Registration;
