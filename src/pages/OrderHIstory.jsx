import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCheck,
    faClock,
    faSpinner,
    faTruck,
    faEye,
    faHandsHelping,
} from "@fortawesome/free-solid-svg-icons";

const OrderHIstory = () => {
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [page, setPage] = useState(1);
    const [orderItems, setOrderItems] = useState([]);
    const [status, setStatus] = useState([
        {
            id: 1,
            status: "Pending",
            icon: faClock,
        },
        {
            id: 2,
            status: "Processing",
            icon: faSpinner,
        },
        {
            id: 3,
            status: "Out for Delivery",
            icon: faTruck,
        },
        {
            id: 4,
            status: "Completed",
            icon: faCheck,
        },
    ]);

    useEffect(() => {
        const fetchAddress = async () => {
            const response = await fetch(
                `https://sfm-dbcc0a8f87a3.herokuapp.com/api/address/${localStorage.getItem(
                    "userID"
                )}`
            );
            const data = await response.json();
            setAddresses(data);
        };
        const fetchOrders = async () => {
            const response = await fetch(
                `https://sfm-dbcc0a8f87a3.herokuapp.com/api/order/${localStorage.getItem(
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
        const fetchOrderItems = async (orderID) => {
            if (selectedOrder !== null) {
                const response = await fetch(
                    `https://sfm-dbcc0a8f87a3.herokuapp.com/api/order/item/${orderID}`
                );
                const data = await response.json();
                setOrderItems(data);
            }
        };
        if (selectedOrder !== null) {
            fetchOrderItems(selectedOrder.customerorderid);
        } else {
            setOrderItems([]);
        }
    }, [selectedOrder]);

    useEffect(() => {
        console.log(addresses);
        console.log(orders);
    }, [addresses, orders]);

    const handlePageChange = (new_page, order) => {
        setPage(new_page);
        console.log(order);
        setSelectedOrder(order);
        if (order.order_method === "Pickup") {
            setStatus([
                {
                    id: 1,
                    status: "Pending",
                    icon: faClock,
                },
                {
                    id: 2,
                    status: "Processing",
                    icon: faSpinner,
                },
                {
                    id: 3,
                    status: "Order is ready for pickup",
                    icon: faHandsHelping,
                },
                {
                    id: 4,
                    status: "Completed",
                    icon: faCheck,
                },
            ]);
        }
    };

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
        {
            name: "Action",
            cell: (row) => (
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handlePageChange(2, row)}
                >
                    <FontAwesomeIcon icon={faEye} />
                </button>
            ),
        },
    ]);
    const [filteredOrders, setFilteredOrders] = useState([]);

    const filterOrders = (searchKey) => {
        const result = orders.filter(
            (order) =>
                order.customerorderid
                    .toString()
                    .toLowerCase()
                    .includes(searchKey.toLowerCase()) ||
                order.customerorderdate
                    .toLowerCase()
                    .includes(searchKey.toLowerCase()) ||
                order.customerorderstatus
                    .toLowerCase()
                    .includes(searchKey.toLowerCase()) ||
                order.customerordertotalprice
                    .toString()
                    .toLowerCase()
                    .includes(searchKey.toLowerCase()) ||
                order.customerorderpaymentmethod
                    .toLowerCase()
                    .includes(searchKey.toLowerCase()) ||
                order.customerorderpaymentstatus
                    .toLowerCase()
                    .includes(searchKey.toLowerCase()) ||
                order.order_method
                    .toLowerCase()
                    .includes(searchKey.toLowerCase())
        );

        setFilteredOrders(result);
    };

    useEffect(() => {
        filterOrders(search);
    }, [search, orders]);

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
                        {page === 1 && (
                            <div className="profile-section bg-white rounded-lg shadow-lg p-8 w-3/4">
                                <div className="flex justify-between items-center mb-4">
                                    <h1 className="text-2xl font-bold">
                                        Order History
                                    </h1>
                                    <input
                                        type="search"
                                        placeholder="Search"
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <DataTable
                                    columns={column3}
                                    data={filteredOrders}
                                />
                            </div>
                        )}
                        {page === 2 && (
                            <div className="profile-section bg-white rounded-lg shadow-lg p-8 w-3/4">
                                <div className="flex justify-between items-center mb-4">
                                    <h1 className="text-2xl font-bold">
                                        Order Summary
                                    </h1>
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={() =>
                                            handlePageChange(1, null)
                                        }
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} />
                                    </button>
                                </div>
                                <ol className="flex items-center w-full justify-between text-gray-400 text-sm font-medium border border-gray-200 mb-8">
                                    {status.map((item, index) => (
                                        <li
                                            className={`flex w-full items-center justify-between text-blue-600 ${
                                                index === status.length - 1
                                                    ? ""
                                                    : "after:content-[''] after:w-full after:h-1 after:border-b after:border-blue-100 after:border-4 after:inline-block"
                                            }`}
                                        >
                                            <span className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full lg:h-12 lg:w-12 shrink-0">
                                                <FontAwesomeIcon
                                                    icon={item.icon}
                                                    className={`${
                                                        selectedOrder.customerorderstatus ===
                                                        item.status
                                                            ? "text-blue-500"
                                                            : "text-gray-500"
                                                    } text-2xl`}
                                                />
                                            </span>
                                        </li>
                                    ))}
                                </ol>

                                <table className="table-auto w-full">
                                    <tbody>
                                        <tr className="p-2">
                                            <td className="text-base font-bold py-2">
                                                Order ID:
                                            </td>
                                            <td className="text-base">
                                                {selectedOrder.customerorderid}
                                            </td>
                                        </tr>
                                        <tr className="p-2">
                                            <td className="text-base font-bold py-2">
                                                Order Date:
                                            </td>
                                            <td className="text-base">
                                                {new Date(
                                                    selectedOrder.customerorderdate
                                                ).toLocaleDateString({
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </td>
                                        </tr>
                                        <tr className="p-2">
                                            <td className="text-base font-bold py-2">
                                                Order Status:
                                            </td>
                                            <td className="text-base">
                                                {
                                                    selectedOrder.customerorderstatus
                                                }
                                            </td>
                                        </tr>
                                        <tr className="p-2">
                                            <td className="text-base font-bold py-2">
                                                Order Method:
                                            </td>
                                            <td className="text-base">
                                                {selectedOrder.order_method}
                                            </td>
                                        </tr>

                                        <tr className="p-2">
                                            <td className="text-base font-bold py-2">
                                                {selectedOrder.order_method ===
                                                "Pickup"
                                                    ? "Estimated Pickup Time:"
                                                    : "Estimated Delivery Time:"}
                                            </td>
                                            <td className="text-base">
                                                {selectedOrder.estimated_delivery_time
                                                    ? selectedOrder.estimated_delivery_time
                                                    : "Not Available"}
                                            </td>
                                        </tr>

                                        {orderItems.length > 0 &&
                                            orderItems.map((item) => (
                                                <tr className="p-2 border border-gray-200">
                                                    <td className="text-base py-6 px-4">
                                                        {item.foodmenuname} /{" "}
                                                        <span className="text-gray-400">
                                                            {
                                                                item.foodmenucuttype
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="text-base py-2 px-4 text-right">
                                                        {
                                                            item.customerorderitemquantity
                                                        }
                                                        {" x "}
                                                        {item.foodmenuprice}
                                                    </td>
                                                    <td className="text-base py-2 px-4 text-right">
                                                        {item.foodmenuprice *
                                                            item.customerorderitemquantity}
                                                    </td>
                                                </tr>
                                            ))}

                                        <tr className="p-2">
                                            <td></td>
                                            <td className="text-base font-bold py-2 text-right">
                                                Total Price:
                                            </td>
                                            <td className="text-base text-right px-4">
                                                {
                                                    selectedOrder.customerordertotalprice
                                                }
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default OrderHIstory;
