import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Profile = () => {
    const [customer, setCustomer] = useState({});
    const [customerID, setCustomerID] = useState(
        localStorage.getItem("userID")
    );
    const [isEditing, setEditing] = useState(false);
    const [editedCustomer, setEditedCustomer] = useState({
        customerFirstName: "",
        customerLastName: "",
        customerEmailAdress: "",
        customerContactNumber: "",
    });

    useEffect(() => {
        const getCustomer = async () => {
            try {
                const response = await fetch(
                    `https://sfm-api-production.up.railway.app/api/customer/${customerID}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                const data = await response.json();
                setCustomer(data);
                setEditedCustomer({
                    customerFirstName: data.customerfirstname,
                    customerLastName: data.customerlastname,
                    customerEmailAdress: data.customeremailadress,
                    customerContactNumber: data.customercontactnumber,
                });
            } catch (error) {
                console.error("Error fetching customer:", error);
            }
        };

        getCustomer();
    }, [customerID]);

    const handleEditClick = () => {
        setEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedCustomer({
            ...editedCustomer,
            [name]: value,
        });
    };

    const handleCancelClick = () => {
        setEditing(false);
        // Reset editedCustomer to original values
        setEditedCustomer({
            customerFirstName: customer.customerfirstname,
            customerLastName: customer.customerlastname,
            customerEmailAdress: customer.customeremailadress,
            customerContactNumber: customer.customercontactnumber,
        });
    };

    const handleSaveClick = async () => {
        try {
            await fetch(
                `https://sfm-api-production.up.railway.app/api/customer/update/${customerID}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(editedCustomer),
                }
            );
            setEditing(false);
            window.location.reload();
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
                                Profile
                            </h2>
                            <hr className="border border-red-500 border-opacity-100 my-2" />
                            <div className="flex flex-wrap">
                                <div className="table w-full">
                                    <table className="table-auto w-full mb-2">
                                        <tbody>
                                            <tr>
                                                <td className="border px-4 py-2">
                                                    First Name
                                                </td>
                                                {isEditing ? (
                                                    <td className="border px-4 py-2">
                                                        <input
                                                            type="text"
                                                            className="w-full text-gray-700 px-2 py-2 border rounded-lg focus:outline-none"
                                                            name="customerFirstName"
                                                            value={
                                                                editedCustomer.customerFirstName
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                        />
                                                    </td>
                                                ) : (
                                                    <td className="border px-4 py-2">
                                                        {
                                                            customer.customerfirstname
                                                        }
                                                    </td>
                                                )}
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2">
                                                    Last Name
                                                </td>
                                                {isEditing ? (
                                                    <td className="border px-4 py-2">
                                                        <input
                                                            type="text"
                                                            className="w-full text-gray-700 px-2 py-2 border rounded-lg focus:outline-none"
                                                            name="customerLastName"
                                                            value={
                                                                editedCustomer.customerLastName
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                        />
                                                    </td>
                                                ) : (
                                                    <td className="border px-4 py-2">
                                                        {
                                                            customer.customerlastname
                                                        }
                                                    </td>
                                                )}
                                            </tr>

                                            <tr>
                                                <td className="border px-4 py-2">
                                                    Email Address
                                                </td>
                                                {isEditing ? (
                                                    <td className="border px-4 py-2">
                                                        <input
                                                            type="text"
                                                            className="w-full text-gray-700 px-2 py-2 border rounded-lg focus:outline-none"
                                                            name="customerEmailAdress"
                                                            value={
                                                                editedCustomer.customerEmailAdress
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                        />
                                                    </td>
                                                ) : (
                                                    <td className="border px-4 py-2">
                                                        {
                                                            customer.customeremailadress
                                                        }
                                                    </td>
                                                )}
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2">
                                                    Contact Number
                                                </td>
                                                {isEditing ? (
                                                    <td className="border px-4 py-2">
                                                        <input
                                                            type="text"
                                                            name="customerContactNumber"
                                                            value={
                                                                editedCustomer.customerContactNumber
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            className="w-full text-gray-700 px-2 py-2 border rounded-lg focus:outline-none"
                                                        />
                                                    </td>
                                                ) : (
                                                    <td className="border px-4 py-2">
                                                        {
                                                            customer.customercontactnumber
                                                        }
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
                                                <FontAwesomeIcon
                                                    icon={faSave}
                                                />{" "}
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
                                            <FontAwesomeIcon icon={faEdit} />{" "}
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Profile;
