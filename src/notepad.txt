import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurger } from "@fortawesome/free-solid-svg-icons";
import DataTable from "react-data-table-component";
import ViewOrders from "../components/ViewOrders";
const Orders = () => {
    //get the userID and userRoleID from local storage
    const [id, setId] = useState(localStorage.getItem("userID"));
    useEffect(() => {
        if (localStorage.getItem("userID") === null) {
            //if the user is not logged in, redirect to login page
            window.location.href = "/login";
        } else {
            if (localStorage.getItem("userRoleID") !== "ADM") {
                //if the user is not a customer, redirect to login page
                window.location.href = "/menu";
            }
        }
    }, []);

    const [admin, setAdmin] = useState([]);
    const [reload, setReload] = useState(false);

    useEffect(() => {
        const adminFetch = async () => {
            const response = await fetch(`https://santafetaguktukan.online/api/admin/${id}`);
            const data = await response.json();
            setAdmin(data);
        };
        adminFetch();
        console.log(admin);
    }, []);

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        console.log("Admin Branch ID:", admin.branchid);

        const getOrders = async () => {
            if (!admin.branchid) {
                return;
            }

            const response = await fetch(
                `https://santafetaguktukan.online/api/orders/${admin.branchid}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();
            console.log("Orders Data:", data);
            setOrders(data);
            setReload(false);
        };

        getOrders();
    }, [admin, reload]);

    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState({});

    const handleClickedRow = (row) => {
        setSelectedOrder(row);
        setShowOrderDetailsModal(true);
    };

    const columns = [
        {
            name: "Order ID",
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
        {
            name: "Customer ID",
            selector: (row) => row.customerid,
            sortable: true,
        },
        {
            name: "Actions",
            selector: (row) => (
                <div className="flex justify-center">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full mx-1"
                        onClick={() => handleClickedRow(row)}
                    >
                        <FontAwesomeIcon icon={faBurger} />
                    </button>
                </div>
            ),
            sortable: true,
        },
    ];

    return (
        <section>
            <Sidebar />
            <div className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-2xl font-semibold">Orders</h2>
                    </div>
                    <div className="mt-8">
                        <DataTable columns={columns} data={orders} pagination />
                    </div>
                </div>
            </div>
            {showOrderDetailsModal && (
                <ViewOrders
                    setShowOrderDetailsModal={setShowOrderDetailsModal}
                    selectedOrder={selectedOrder}
                    setReload={setReload}
                />
            )}
        </section>
    );
};

export default Orders;
