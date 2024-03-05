import React, { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);
const Dashboard = () => {
    const [customerCount, setCustomerCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [saleCount, setSaleCount] = useState(0);
    const [loadingProfits, setLoadingProfits] = useState(true);
    const [branchRanking, setBranchRanking] = useState([]);

    const [id, setId] = useState(localStorage.getItem("userID"));
    const [role, setRole] = useState(localStorage.getItem("userRoleID"));

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

    const [admin, setAdmin] = useState({});

    useEffect(() => {
        const fetchBranchRanking = async () => {
            try {
                const response = await fetch(
                    `https://santafetaguktukan.online/api/sales/branch`
                );
                const data = await response.json();
                console.log(data);
                setBranchRanking(data);
            } catch (error) {
                console.error("Error fetching branch ranking:", error);
            }
        };

        fetchBranchRanking();
    }, []);

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const response = await fetch(
                    `https://santafetaguktukan.online/api/admin/${id}`
                );
                const data = await response.json();
                setAdmin(data);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            }
        };

        fetchAdmin();
    }, [id]); // Added id as a dependency

    // Extract months and profits for chart

    const [monthlyProfits, setMonthlyProfits] = useState({});
    const months = Object.keys(monthlyProfits);
    const profitss = Object.values(monthlyProfits);
    const chartData = {
        labels: months,
        datasets: [
            {
                label: "Monthly Profits for 2023",
                data: profitss,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)",
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };
    useEffect(() => {
        const getCustomerCount = async () => {
            try {
                const response = await fetch(
                    `https://santafetaguktukan.online/api/customer/count/`
                );
                const jsonData = await response.json();
                setCustomerCount(jsonData.count);
            } catch (err) {
                console.error(err.message);
            }
        };
        getCustomerCount();

        const getOrderCount = async () => {
            try {
                if (role === "ADM") {
                    const response = await fetch(
                        `https://santafetaguktukan.online/api/order/count/${admin.branchid}`
                    );

                    const jsonData = await response.json();

                    setOrderCount(jsonData.count);
                }
                if (role === "STF") {
                    const response = await fetch(
                        `https://santafetaguktukan.online/api/order/all/count/`
                    );

                    const jsonData = await response.json();

                    setOrderCount(jsonData.count);
                }
            } catch (err) {
                console.error(err.message);
            }
        };
        getOrderCount();

        const getProductCount = async () => {
            try {
                const response = await fetch(
                    "https://santafetaguktukan.online/api/product/count"
                );

                const jsonData = await response.json();

                setProductCount(jsonData.count);
            } catch (err) {
                console.error(err.message);
            }
        };
        getProductCount();

        const getSaleCount = async () => {
            try {
                if (role === "ADM") {
                    const response = await fetch(
                        `https://santafetaguktukan.online/api/order/success/${admin.branchid}`
                    );
                    const jsonData = await response.json();
                    setSaleCount(jsonData.sum);
                }
                if (role === "STF") {
                    const response = await fetch(
                        `https://santafetaguktukan.online/api/order/all/success/`
                    );
                    const jsonData = await response.json();
                    setSaleCount(jsonData.sum);
                }
            } catch (err) {
                console.error(err.message);
            }
        };
        getSaleCount();
        const fetchMonthlyProfit = async (month) => {
            try {
                const response = await fetch(
                    `https://santafetaguktukan.online/api/transaction_sum/${month}`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch profits for ${month}`);
                }

                const data = await response.json();
                console.log(data.sum, month);
                return data.sum;
            } catch (error) {
                console.error(`Error fetching profits for ${month}:`, error);
                return 0; // Return 0 in case of an error
            }
        };

        const updateMonthlyProfits = async () => {
            const months = [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12",
            ];
            const updatedProfits = {};

            try {
                // Use Promise.all to fetch profits for all months concurrently
                const profits = await Promise.all(
                    months.map(async (month) => await fetchMonthlyProfit(month))
                );

                // Update the monthlyProfits object
                months.forEach((month, index) => {
                    //to number
                    updatedProfits[month] = parseInt(profits[index]);
                });
            } catch (error) {
                console.error("Error updating monthly profits:", error);
            } finally {
                setLoadingProfits(false);
                setMonthlyProfits(updatedProfits);
                console.log(updatedProfits);
            }
        };

        updateMonthlyProfits();
    }, [admin.branchid, role]);

    return (
        <section className="section">
            <Sidebar />
            <div className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="card bg-gradient-to-r from-slate-100 to-blue-100 p-4 rounded-lg shadow">
                            <div className="card-body">
                                <h2 className="card-title text-lg font-medium text-gray-800">
                                    Customers
                                </h2>
                                <p className="card-text text-3xl font-bold text-gray-800">
                                    {customerCount}
                                </p>
                                <hr className="my-2 border-gray-900" />
                                <Link
                                    to="/customer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    {" "}
                                    View Customers{" "}
                                    <FontAwesomeIcon icon={faArrowRight} />{" "}
                                </Link>
                            </div>
                        </div>
                        <div className="card bg-gradient-to-r from-slate-100 to-blue-100 p-4 rounded-lg shadow">
                            <div className="card-body">
                                <h2 className="card-title text-lg font-medium text-gray-800">
                                    Orders
                                </h2>
                                <p className="card-text text-3xl font-bold text-gray-800">
                                    {orderCount}
                                </p>
                                <hr className="my-2 border-gray-900" />
                                <Link
                                    to="/order"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    {" "}
                                    View Orders{" "}
                                    <FontAwesomeIcon icon={faArrowRight} />{" "}
                                </Link>
                            </div>
                        </div>
                        <div className="card bg-gradient-to-r from-slate-100 to-blue-100 p-4 rounded-lg shadow">
                            <div className="card-body">
                                <h2 className="card-title text-lg font-medium text-gray-800">
                                    Products
                                </h2>
                                <p className="card-text text-3xl font-bold text-gray-800">
                                    {productCount}
                                </p>
                                <hr className="my-2 border-gray-900" />
                                <Link
                                    to="/food"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    {" "}
                                    View Products{" "}
                                    <FontAwesomeIcon icon={faArrowRight} />{" "}
                                </Link>
                            </div>
                        </div>
                        <div className="card bg-gradient-to-r from-slate-100 to-blue-100 p-4 rounded-lg shadow">
                            <div className="card-body">
                                <h2 className="card-title text-lg font-medium text-gray-800">
                                    Sales
                                </h2>
                                <p className="card-text text-3xl font-bold text-gray-800">
                                    {/* {saleCount ? saleCount.toFixed(2) : 0} */}
                                    {saleCount > 0
                                        ? parseFloat(saleCount).toFixed(2)
                                        : 0}
                                </p>
                                <hr className="my-2 border-gray-900" />
                                <Link
                                    to="/order"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    {" "}
                                    View Sales{" "}
                                    <FontAwesomeIcon icon={faArrowRight} />{" "}
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="graph-container">
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                        <div className="table-container">
                            <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
                                <thead className="bg-red-500 text-white">
                                    <tr>
                                        <th className="py-2 px-4 text-left font-semibold text-sm">
                                            #
                                        </th>
                                        <th className="py-2 px-4 text-left font-semibold text-sm">
                                            Branch Name
                                        </th>
                                        <th className="py-2 px-4 text-left font-semibold text-sm">
                                            Sales
                                        </th>
                                        <th className="py-2 px-4 text-left font-semibold text-sm">
                                            Orders
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {branchRanking.map((item, index) => (
                                        <tr
                                            key={item.branchname}
                                            className={`hover:bg-gray-200 transition ease-in-out duration-150`}
                                        >
                                            <td className="py-2 px-4 text-sm">
                                                {index + 1}
                                            </td>
                                            <td className="py-2 px-4 text-sm">
                                                {item.branchname}
                                            </td>
                                            <td className="py-2 px-4 text-sm">
                                                {item.totalsales}
                                            </td>
                                            <td className="py-2 px-4 text-sm">
                                                {item.ordercount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
