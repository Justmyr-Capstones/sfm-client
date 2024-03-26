import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DataTable from "react-data-table-component";
import { Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Customer = () => {
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);

    const [visiblePasswords, setVisiblePasswords] = useState([]);

    const togglePasswordVisibility = (customerId) => {
        setVisiblePasswords((prevVisiblePasswords) => ({
            ...prevVisiblePasswords,
            [customerId]: !prevVisiblePasswords[customerId],
        }));
    };
    const [customer, setCustomer] = useState([]);

    const handlePageChange = (page, customerId) => {
        setSelectedCustomerID(customerId);
        setPage(page);
    };
    const [selectedCustomerID, setSelectedCustomerID] = useState("");

    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchAddress = async () => {
            const response = await fetch(
                `https://sfm-dbcc0a8f87a3.herokuapp.com/api/address/${selectedCustomerID}`
            );
            const data = await response.json();
            setAddresses(data);
        };
        const fetchOrders = async () => {
            const response = await fetch(
                `https://sfm-dbcc0a8f87a3.herokuapp.com/api/order/${selectedCustomerID}`
            );
            const data = await response.json();
            setOrders(data);
        };
        if (page === 2 && selectedCustomerID !== "") {
            fetchAddress();
        }
        if (page === 3 && selectedCustomerID !== "") {
            fetchOrders();
        }
    }, [selectedCustomerID, page]);

    useEffect(() => {
        console.log(addresses);
        console.log(orders);
    }, [addresses, orders]);

    const columns = useMemo(() => [
        {
            name: "ID",
            selector: (row) => row.customerid,
            sortable: true,
        },
        {
            name: "First Name",
            selector: (row) => row.customerfirstname,
            sortable: true,
        },
        {
            name: "Last Name",
            selector: (row) => row.customerlastname,
            sortable: true,
        },
        {
            name: "Email Address",
            selector: (row) => row.customeremailadress,
            sortable: true,
        },
        {
            name: "Password",
            selector: (row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => togglePasswordVisibility(row.customerid)}
                        className="ml-2 text-black focus:outline-none"
                    >
                        {visiblePasswords[row.customerid] ? (
                            <FontAwesomeIcon icon={faEyeSlash} />
                        ) : (
                            <FontAwesomeIcon icon={faEye} />
                        )}
                    </button>
                    {visiblePasswords[row.customerid]
                        ? row.customerpassword
                        : "********"}
                </div>
            ),
            sortable: true,
        },
        {
            name: "Contact Number",
            selector: (row) => row.customercontactnumber,
            sortable: true,
        },
        {
            name: "Actions",
            selector: (row) => (
                <>
                    <button
                        onClick={() => handlePageChange(2, row.customerid)}
                        className="mr-2 text-blue-500 hover:text-blue-600"
                    >
                        Address
                    </button>
                    <button
                        onClick={() => handlePageChange(3, row.customerid)}
                        className="mr-2 text-blue-500 hover:text-blue-600"
                    >
                        Orders
                    </button>
                </>
            ),
            sortable: false, // Assuming this column is not sortable
        },
    ]);

    const columns2 = useMemo(() => [
        {
            name: "ID",
            selector: (row) => row.customeraddressid,
            sortable: true,
        },

        {
            name: "Street",
            selector: (row) => row.customerstreet,
            sortable: true,
        },
        {
            name: "Barangay",
            selector: (row) => row.customerbarangay,
            sortable: true,
        },
        {
            name: "City",
            selector: (row) => row.customercity,
            sortable: true,
        },
        {
            name: "Notes",
            selector: (row) => row.customernotes,
            sortable: true,
        },
        {
            name: "Label",
            selector: (row) => row.customeraddresslabel,
            sortable: true,
        },
        {
            name: "Default",
            selector: (row) => row.customeraddressdefault,
            sortable: true,
        },
    ]);

    [
        {
            customerorderid: "snvwgfa82",
            customerid: "C461039555",
            customeraddressid: "SFMA4183844310000000",
            customerorderdate: "2023-11-20T10:59:00.000Z",
            customerorderstatus: "Processing",
            customerordertotalprice: "7608.00",
            customerorderpaymentmethod: "Cash",
            customerorderpaymentstatus: "Pending",
            branchid: "1",
            estimated_delivery_time: null,
            order_method: null,
        },
        {
            customerorderid: "9slw0mdq7",
            customerid: "C461039555",
            customeraddressid: "SFMA4183844310000000",
            customerorderdate: "2023-11-20T11:48:51.000Z",
            customerorderstatus: "Pending",
            customerordertotalprice: "300.00",
            customerorderpaymentmethod: "Cash",
            customerorderpaymentstatus: "Pending",
            branchid: "3",
            estimated_delivery_time: "",
            order_method: "Delivery",
        },
        {
            customerorderid: "2nb5j9ngw",
            customerid: "C461039555",
            customeraddressid: "SFMA4183844310000000",
            customerorderdate: "2023-11-20T11:49:25.000Z",
            customerorderstatus: "Completed",
            customerordertotalprice: "123614.00",
            customerorderpaymentmethod: "Cash",
            customerorderpaymentstatus: "Pending",
            branchid: "1",
            estimated_delivery_time: null,
            order_method: "Delivery",
        },
    ];

    const column3 = useMemo(() => [
        {
            name: "ID",
            selector: (row) => row.customerorderid,
            sortable: true,
        },
        {
            name: "Order Date",
            //change the format of the date
            selector: (row) => row.customerorderdate,
            sortable: true,
            format: (row) => {
                const date = new Date(row.customerorderdate);
                return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
            },
            sortFunction: (a, b) => {
                const dateA = new Date(a.customerorderdate);
                const dateB = new Date(b.customerorderdate);
                return dateB - dateA;
            },
        },
        {
            name: "Order Status",
            selector: (row) => row.customerorderstatus,
            sortable: true,
        },
        {
            name: "Total Price",
            selector: (row) => row.customerordertotalprice,
            sortable: true,
        },
        {
            name: "Payment Method",
            selector: (row) => row.customerorderpaymentmethod,
            sortable: true,
        },
        {
            name: "Payment Status",
            selector: (row) => row.customerorderpaymentstatus,
            sortable: true,
        },
        {
            name: "Order Method",
            selector: (row) => row.order_method,
            sortable: true,
        },
    ]);

    useEffect(() => {
        //
        const fetchData = async () => {
            let apiUrl = "https://sfm-dbcc0a8f87a3.herokuapp.com/api/customer";

            if (search) {
                apiUrl = `https://sfm-dbcc0a8f87a3.herokuapp.com/api/customer/search/${search}`;
            }

            const response = await fetch(apiUrl);
            const data = await response.json();
            setCustomer(data);
        };

        fetchData();
    }, [search]);

    useEffect(() => {
        if (localStorage.getItem("userID") === null) {
            //if the user is not logged in, redirect to login page
            window.location.href = "/login";
        } else {
            if (
                localStorage.getItem("userRoleID") !== "ADM" &&
                localStorage.getItem("userRoleID") !== "STF"
            ) {
                //if the user is not a customer, redirect to login page
                window.location.href = "/menu";
            }
        }
    }, []);

    return (
        <section>
            <Sidebar />
            <div className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg">
                    {page === 1 && (
                        <>
                            <div className="flex justify-between">
                                <h1 className="text-xl font-semibold">
                                    Customer
                                </h1>
                                <div className="search-container">
                                    <input
                                        type="search"
                                        id="customer-search"
                                        className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Search customer"
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <DataTable
                                columns={columns}
                                data={customer}
                                pagination
                            />
                        </>
                    )}

                    {page === 2 && (
                        <>
                            <div className="flex justify-between">
                                <h1 className="text-xl font-semibold">
                                    Address
                                </h1>
                                <div className="search-container">
                                    <button
                                        onClick={() => setPage(1)}
                                        className="mr-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                            <DataTable columns={columns2} data={addresses} />
                        </>
                    )}
                    {page === 3 && (
                        <>
                            <div className="flex justify-between">
                                <h1 className="text-xl font-semibold">
                                    Orders
                                </h1>
                                <div className="search-container">
                                    <button
                                        onClick={() => setPage(1)}
                                        className="mr-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>

                            <DataTable
                                columns={column3}
                                data={orders}
                                pagination
                            />
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Customer;
