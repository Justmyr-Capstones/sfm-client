import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const AddressBooks = () => {
    const ID = localStorage.getItem("userID");

    const [address, setAddress] = useState({});
    const [isEditing, setEditing] = useState(false);
    const [editedAddress, setEditedAddress] = useState({});
    const [reload, setReload] = useState(false);

    useEffect(() => {
        const getAddress = async () => {
            try {
                const response = await fetch(
                    `https://sfm-api-production.up.railway.app/api/address/${ID}`
                );
                const jsonData = await response.json();
                setAddress(jsonData);
                setEditedAddress(jsonData); // Initialize editedAddress with the fetched data
                console.log(jsonData);
            } catch (err) {
                console.error(err.message);
            }
        };

        getAddress();
    }, [ID, reload]);

    const handleEditClick = () => {
        setEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedAddress({
            ...editedAddress,
            [name]: value,
        });
    };

    const handleCancelClick = () => {
        setEditing(false);
        // Reset editedAddress to original values
        setEditedAddress(address);
    };

    const handleSaveClick = async () => {
        console.log(editedAddress, "ID");
        try {
            const response = await fetch(
                `https://sfm-api-production.up.railway.app/api/address/update`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(editedAddress),
                }
            );

            const data = await response.json();
            console.log(data); // Log the response to check for any issues

            if (data) {
                setEditing(false);
                setReload(true);
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <>
            <Navbar />
            <section className="text-gray-600 body-font">
                <div className="container px-5 py-24 mx-auto flex flex-wrap">
                    <div className="flex border-2 rounded-lg border-gray-200 border-opacity-50 p-8 w-full">
                        <div className="sidebar w-1/4">
                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        to="/profile"
                                        className="text-blue-500 hover:underline"
                                    >
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/orderhistory"
                                        className="text-blue-500 hover:underline"
                                    >
                                        Order History
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/addressbook"
                                        className="text-blue-500 hover:underline"
                                    >
                                        Address Book
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="profile-section bg-white rounded-lg shadow-lg p-8 w-3/4">
                            <h2 className="text-gray-900 text-2xl font-bold mb-2">
                                Address Book
                            </h2>
                            <hr className="border border-red-500 border-opacity-100 my-2" />
                            <div className="flex flex-wrap">
                                <table className="min-w-full">
                                    <tbody>
                                        <tr>
                                            <td className="font-bold pr-2">
                                                Customer ID:
                                            </td>
                                            <td className="text-gray-700">
                                                {address.customerid}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold pr-2">
                                                Street:
                                            </td>
                                            {isEditing ? (
                                                <td className="py-2">
                                                    <input
                                                        type="text"
                                                        className="w-full text-gray-700 px-2 py-2 border rounded-lg focus:outline-none"
                                                        name="customerstreet"
                                                        value={
                                                            editedAddress.customerstreet
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </td>
                                            ) : (
                                                <td className="py-2">
                                                    {address.customerstreet}
                                                </td>
                                            )}
                                        </tr>
                                        <tr>
                                            <td className="font-bold pr-2">
                                                Barangay:
                                            </td>
                                            {isEditing ? (
                                                <td className="py-2">
                                                    <input
                                                        type="text"
                                                        className="w-full text-gray-700 px-2 py-2 border rounded-lg focus:outline-none"
                                                        name="customerbarangay"
                                                        value={
                                                            editedAddress.customerbarangay
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </td>
                                            ) : (
                                                <td className="py-2">
                                                    {address.customerbarangay}
                                                </td>
                                            )}
                                        </tr>
                                        <tr>
                                            <td className="font-bold pr-2">
                                                City:
                                            </td>
                                            {isEditing ? (
                                                <td className="py-2">
                                                    <input
                                                        type="text"
                                                        className="w-full text-gray-700 px-2 py-2 border rounded-lg focus:outline-none"
                                                        name="customercity"
                                                        value={
                                                            editedAddress.customercity
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </td>
                                            ) : (
                                                <td className="py-2">
                                                    {address.customercity}
                                                </td>
                                            )}
                                        </tr>
                                        <tr>
                                            <td className="font-bold pr-2">
                                                Label
                                            </td>
                                            {isEditing ? (
                                                <td className="py-2">
                                                    <input
                                                        type="text"
                                                        className="w-full text-gray-700 px-2 py-2 border rounded-lg focus:outline-none"
                                                        name="customeraddresslabel"
                                                        value={
                                                            editedAddress.customeraddresslabel
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </td>
                                            ) : (
                                                <td className="py-2">
                                                    {
                                                        address.customeraddresslabel
                                                    }
                                                </td>
                                            )}
                                        </tr>
                                        <tr>
                                            <td className="font-bold pr-2">
                                                Notes:
                                            </td>
                                            {isEditing ? (
                                                <td className="py-2">
                                                    <input
                                                        type="text"
                                                        className="w-full text-gray-700 px-2 py-2 border rounded-lg focus:outline-none"
                                                        name="customernotes"
                                                        value={
                                                            editedAddress.customernotes ||
                                                            ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </td>
                                            ) : (
                                                <td className="py-2">
                                                    {address.customernotes ? (
                                                        address.customernotes
                                                    ) : (
                                                        <span className="text-gray-700">
                                                            No notes
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    </tbody>
                                </table>

                                {isEditing ? (
                                    <div className="flex justify-start items-center gap-2">
                                        <button
                                            onClick={handleSaveClick}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 mb-4 rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelClick}
                                            className="text-red-500 hover:text-red-700 py-2 px-3 mb-4"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleEditClick}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 mb-4 rounded"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default AddressBooks;
