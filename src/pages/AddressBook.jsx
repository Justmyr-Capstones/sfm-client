import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DataTable from "react-data-table-component";

const AddressBook = () => {
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    useEffect(() => {
        const fetchAddress = async () => {
            const response = await fetch(
                `https://santafetaguktukan.online/api/address/${localStorage.getItem(
                    "userID"
                )}`
            );
            const data = await response.json();
            setAddresses(data);
        };
        const fetchOrders = async () => {
            const response = await fetch(
                `https://santafetaguktukan.online/api/order/${localStorage.getItem(
                    "userID"
                )}`
            );
            const data = await response.json();
            setOrders(data);
        };
        fetchAddress();
        fetchOrders();
    }, []);

    useEffect(() => {
        console.log(addresses);
        console.log(orders);
    }, [addresses, orders]);

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
                            <DataTable columns={column3} data={orders} />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default AddressBook;
