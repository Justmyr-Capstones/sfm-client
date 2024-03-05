import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCartShopping,
    faMapMarked,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
//import firebase from "../firebase";
import { storage } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";

const Cart = () => {
    const [checkedProducts, setCheckedProducts] = useState([]);
    const [checkedTotal, setCheckedTotal] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [cartDetails, setCartDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({});
    const [deliveryFee, setDeliveryFee] = useState(50);
    const [branch, setBranch] = useState([]);
    const [orderMethod, setOrderMethod] = useState("Delivery");
    const [selectedBranch, setSelectedBranch] = useState("");

    const ID = localStorage.getItem("userID");

    const getCartDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://santafetaguktukan.online/api/cart/inner/${ID}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const cartDetailsJSON = await response.json();
            // setCartDetails(cartDetailsJSON);
            console.log(cartDetailsJSON, "cartDetailsJSON");
            // Get download URL from firebase storage
            const cartDetailsWithDownloadURL = await Promise.all(
                cartDetailsJSON.map(async (cartDetail) => {
                    const downloadURL = await getDownloadURL(
                        ref(storage, `foods/${cartDetail.foodmenuimage}`)
                    );
                    return {
                        ...cartDetail,
                        foodmenuimage: downloadURL,
                    };
                })
            );

            setCartDetails(cartDetailsWithDownloadURL);
        } finally {
            setLoading(false);
        }
    };

    const deleteCart = async (cartID) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            showCancelButton: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(
                        `https://santafetaguktukan.online/api/cart/delete/item/${cartID}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    const deleteCartJSON = await response.json();

                    if (deleteCartJSON.ok) {
                        Swal.fire(
                            "Deleted!",
                            "Your cart item has been deleted.",
                            "success"
                        );
                        setCartDetails([]);
                    } else {
                        console.error("Failed to delete cart item.");
                    }
                } catch (error) {
                    console.error("Error deleting cart item:", error);
                }
            }
        });
    };

    const getTotals = () => {
        let total = 0;
        let totalItems = 0;
        cartDetails.forEach((cartDetail, index) => {
            if (checkedProducts.includes(cartDetail.cartid)) {
                total += parseFloat(
                    cartDetail.foodmenuprice * quantities[index]
                );
                totalItems += parseInt(quantities[index]);
            }
        });
        setCheckedTotal(total);
        setTotalItems(totalItems);
    };

    const handleCheckboxChange = (e, cartID) => {
        e.preventDefault();
        if (checkedProducts.includes(cartID)) {
            setCheckedProducts((prevCheckedProducts) =>
                prevCheckedProducts.filter((id) => id !== cartID)
            );
        } else {
            setCheckedProducts((prevCheckedProducts) => [
                ...prevCheckedProducts,
                cartID,
            ]);
        }
    };

    const getAddresses = async () => {
        try {
            const response = await fetch(
                `https://santafetaguktukan.online/api/address/${ID}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const addressJSON = await response.json();
            setAddress(addressJSON);
            console.log(addressJSON);
        } catch (error) {
            console.error("Error getting address:", error);
        }
    };

    const getBranches = async () => {
        try {
            const response = await fetch(
                `https://santafetaguktukan.online/api/branch`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const branchJSON = await response.json();

            setBranch(
                branchJSON.filter(
                    (branch) =>
                        branch.is_active.toString().toLowerCase() === "active"
                )
            );
            console.log(branchJSON);
        } catch (error) {
            console.error("Error getting branch:", error);
        }
    };

    const placeOrder = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, place order!",
            showCancelButton: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const customerorderid =
                        Math.floor(Math.random() * 999999) + 100000;
                    const response = await fetch(
                        `https://santafetaguktukan.online/api/order/add`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                //custoemrorderid is math random from 100000, 999999
                                customerorderid: customerorderid,
                                customerid: ID,
                                customeraddressid: address.customeraddressid,
                                customerorderdate: new Date(),
                                customerorderstatus: "Pending",
                                customerordertotalprice: checkedTotal,
                                customerorderpaymentmethod: "Cash on Delivery",
                                customerorderpaymentstatus: "Pending",
                                deliverypersonid: selectedBranch,
                                estimated_delivery_time: "",
                                order_method: orderMethod,
                            }),
                        }
                    );
                    const orderJSON = await response.json();
                    if (response.ok) {
                        cartDetails.forEach(async (cartDetail) => {
                            if (checkedProducts.includes(cartDetail.cartid)) {
                                try {
                                    const response = await fetch(
                                        `https://santafetaguktukan.online/api/order/item/add`,
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                customerorderitemid:
                                                    Math.floor(
                                                        Math.random() * 999999
                                                    ) + 100000,
                                                customerorderid:
                                                    customerorderid,
                                                foodmenuid:
                                                    cartDetail.foodmenuid,
                                                foodmenupriceid:
                                                    cartDetail.foodmenupriceid,
                                                customerorderitemquantity:
                                                    cartDetail.quantity,
                                                customerorderitemtotalprice:
                                                    cartDetail.foodmenuprice *
                                                    cartDetail.quantity,
                                            }),
                                        }
                                    );
                                    const orderItemJSON = await response.json();
                                    if (response.ok) {
                                        try {
                                            const response = await fetch(
                                                `https://santafetaguktukan.online/api/cart/delete/item/${cartDetail.cartid}`,
                                                {
                                                    method: "DELETE",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                }
                                            );
                                            const deleteCartJSON =
                                                await response.json();
                                        } catch (error) {
                                            console.error(
                                                "Error deleting cart item:",
                                                error
                                            );
                                        }
                                    } else {
                                        console.error(
                                            "Failed to place order item."
                                        );
                                    }
                                } catch (error) {
                                    console.error(
                                        "Error placing order item:",
                                        error
                                    );
                                }
                            }
                        });
                    }

                    Swal.fire({
                        icon: "success",
                        title: "Success!",
                        text: "Order placed successfully.",
                    }).then(() => {
                        // After the alert is closed, navigate to another page
                        window.location.href = "/orderhistory";
                    });

                    console.log(orderJSON);
                } catch (error) {
                    console.error("Error placing order:", error);
                }
            }
        });
    };

    useEffect(() => {
        getCartDetails();
        getAddresses();
        getBranches();
    }, []);

    const [quantities, setQuantities] = useState([]);

    useEffect(() => {
        getTotals();
    }, [checkedProducts, cartDetails]);
    useEffect(() => {
        getTotals();
    }, [quantities]);

    useEffect(() => {
        // Initialize quantities when cartDetails changes
        if (cartDetails && cartDetails.length > 0) {
            const initialQuantities = cartDetails.map(
                (cartDetail) => cartDetail.quantity
            );
            setQuantities(initialQuantities);
        }
    }, [cartDetails]);

    const handleQuantityChange = (amount, cartID, index) => {
        const newQuantities = [...quantities];
        newQuantities[index] += amount;
        if (newQuantities[index] < 1) {
            // Optionally, you can prevent the quantity from going below 1
            newQuantities[index] = 1;
        }
        setQuantities(newQuantities);
        updateQuantity(cartID, newQuantities[index]);
    };
    const updateQuantity = async (cartID, quantity) => {
        try {
            const response = await fetch(
                `https://santafetaguktukan.online/api/cart/update/${cartID}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        quantity,
                    }),
                }
            );

            const updateCartJSON = await response.json();

            if (updateCartJSON.ok) {
                getCartDetails();
                getTotals();
            }
        } catch (error) {
            console.error("Error updating cart:", error);
        }
    };

    const handleUpdateQuantity = (e, cartID, index) => {
        e.preventDefault();
        const newQuantities = [...quantities];
        newQuantities[index] = e.target.value;
        setQuantities(newQuantities);
        const UpdateQuantity = async (cartID) => {
            try {
                const response = await fetch(
                    `https://santafetaguktukan.online/api/cart/update/${cartID}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            quantity: newQuantities[index],
                        }),
                    }
                );

                const updateCartJSON = await response.json();

                if (updateCartJSON.ok) {
                    getCartDetails();
                    getTotals();
                }
            } catch (error) {
                console.error("Error updating cart:", error);
            }
        };
        UpdateQuantity(cartID);
    };

    // router.delete("/cart/delete/all/:customerid", async (req, res) => {
    //     try {
    //         const { customerid } = req.params;
    //         const deleteCart = await pool.query(
    //             "DELETE FROM cartTable WHERE customerID = $1",
    //             [customerid]
    //         );
    //         res.json("Cart was deleted!");
    //     } catch (err) {
    //         console.error(err.message);
    //     }
    // });

    const deleteAllCart = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete all!",
            showCancelButton: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(
                        `https://santafetaguktukan.online/api/cart/delete/all/${ID}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    const deleteCartJSON = await response.json();

                    if (deleteCartJSON.ok) {
                        Swal.fire(
                            "Deleted!",
                            "Your cart item has been deleted.",
                            "success"
                        );
                        getCartDetails();
                    } else {
                        console.error("Failed to delete cart item.");
                    }
                } catch (error) {
                    console.error("Error deleting cart item:", error);
                }
            }
        });
    };

    const [page, setPage] = useState(1);
    return (
        <div>
            <Navbar />

            {page === 1 && (
                <div className="container mx-auto my-8 p-8 bg-white shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-bold mb-4">My Cart</h2>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                            onClick={deleteAllCart}
                        >
                            Clear Cart
                        </button>
                    </div>
                    <hr className="border border-yellow-300 my-4" />

                    <div className="grid grid-cols-12 gap-4 py-2">
                        <div className="col-span-3 flex items-center justify-center"></div>
                        <div className="col-span-3 flex items-center">
                            <p className="font-bold text-lg">Product</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-bold text-lg">Quantity</p>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <p className="font-bold text-lg">Price</p>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <p className="font-bold text-lg">Total</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-bold text-lg">Remove</p>
                        </div>
                    </div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            {cartDetails && cartDetails.length > 0 ? (
                                cartDetails.map((cartDetail, index) => (
                                    <div
                                        className={`grid grid-cols-12 gap-4 py-2 hover:bg-gray-200 transition duration-150 ease-in-out ${
                                            index % 2 === 0 ? "bg-gray-100" : ""
                                        }`}
                                        key={cartDetail.cartid}
                                    >
                                        <div className="col-span-1 flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className="mr-2 accent-red-500 form-checkbox h-5 w-5"
                                                onChange={(e) =>
                                                    handleCheckboxChange(
                                                        e,
                                                        cartDetail.cartid
                                                    )
                                                }
                                                checked={checkedProducts.includes(
                                                    cartDetail.cartid
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center">
                                            <img
                                                src={cartDetail.foodmenuimage}
                                                alt="product"
                                                className="w-24 h-24 object-cover rounded"
                                            />
                                        </div>
                                        <div className="col-span-3 flex flex-col justify-center">
                                            <h3 className="font-bold text-lg">
                                                {cartDetail.foodmenuname}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {cartDetail.foodmenucuttype}
                                            </p>
                                        </div>
                                        <div className="col-span-1 flex flex-row justify-center items-center">
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white h-10 w-10 p-2 flex justify-center items-center"
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        -1,
                                                        cartDetail.cartid,
                                                        index
                                                    )
                                                }
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                className={`w-[4rem] border border-gray-300 px-1.5 text-base py-2 h-10 text-center ${
                                                    quantities[index] <= 0
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                                value={quantities[index]}
                                                onChange={(e) =>
                                                    handleUpdateQuantity(
                                                        e,
                                                        cartDetail.cartid,
                                                        index
                                                    )
                                                }
                                                min="1"
                                            />
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white h-10 w-10 p-2 flex justify-center items-center mr-2"
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        1,
                                                        cartDetail.cartid,
                                                        index
                                                    )
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="col-span-2  flex flex-col justify-center">
                                            <p className="text-lg">
                                                {parseFloat(
                                                    cartDetail.foodmenuprice
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="col-span-2  flex flex-col justify-center">
                                            <p className="text-lg">
                                                {(
                                                    cartDetail.foodmenuprice *
                                                    quantities[index]
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="col-span-1  flex flex-col justify-center">
                                            <button
                                                onClick={() =>
                                                    deleteCart(
                                                        cartDetail.cartid
                                                    )
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                    className="text-red-500"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-12 flex justify-center bg-gray-100 py-4 flex-col items-center">
                                    <p className="text-center text-dark">
                                        No items in cart
                                    </p>
                                    <Link to="/menu">
                                        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                                            Shop Now
                                        </button>
                                    </Link>
                                </div>
                            )}
                            <div className="grid grid-cols-12 gap-4 py-2">
                                <div className="col-span-7"></div>
                                <div className="col-span-2 flex flex-col justify-center">
                                    <p className="font-bold text-lg">
                                        Total{" "}
                                        <span className="text-sm">
                                            ({totalItems}) items
                                        </span>
                                    </p>
                                </div>
                                <div className="col-span-1 flex flex-col justify-center">
                                    <p className="font-bold text-lg">
                                        {checkedTotal.toFixed(2)}
                                    </p>
                                </div>

                                <div
                                    className="col-span-2 flex flex-col justify-center"
                                    onClick={() => setPage(2)}
                                >
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                        disabled={checkedProducts.length === 0}
                                    >
                                        Checkout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {page === 2 && (
                <div className="container mx-auto my-8 p-8 bg-white shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-bold mb-4">
                            Order Summary
                        </h2>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                            onClick={() => setPage(1)}
                        >
                            Back
                        </button>
                    </div>
                    <hr className="border border-yellow-300 my-4" />
                    <div className="grid grid-cols-12 py-2">
                        <div className="col-span-5 flex items-center text-left pl-4">
                            <p className="font-bold text-lg">Product</p>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <p className="font-bold text-lg">Type</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-bold text-lg">Quantity</p>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <p className="font-bold text-lg">Price</p>
                        </div>
                        <div className="col-span-2 text-right pr-4">
                            <p className="font-bold text-lg">Subtotal</p>
                        </div>
                    </div>
                    <>
                        {cartDetails &&
                            cartDetails.length > 0 &&
                            cartDetails.map(
                                (cartDetail, index) =>
                                    checkedProducts.includes(
                                        cartDetail.cartid
                                    ) && (
                                        <div
                                            className={`grid grid-cols-12 gap-4 py-2 hover:bg-gray-200 transition duration-150 ease-in-out ${
                                                index % 2 === 0
                                                    ? "bg-gray-100"
                                                    : ""
                                            }`}
                                            key={cartDetail.cartid}
                                        >
                                            {/* productname and cut ype */}
                                            <div className="col-span-5 flex flex-col justify-center pl-4">
                                                <h3 className="font-bold text-lg">
                                                    {cartDetail.foodmenuname}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {
                                                        cartDetail.foodmenudescription
                                                    }
                                                </p>
                                            </div>

                                            {/* quantity */}
                                            <div className="col-span-2 flex flex-col justify-center">
                                                <p className="text-sm text-gray-500">
                                                    {cartDetail.foodmenucuttype}
                                                </p>
                                            </div>

                                            {/* price */}
                                            <div className="col-span-1 flex flex-col justify-center">
                                                <p className="text-sm">
                                                    {parseFloat(
                                                        cartDetail.foodmenuprice
                                                    ).toFixed(2)}
                                                </p>
                                            </div>

                                            {/* qua */}
                                            <div className="col-span-2 flex flex-col justify-center">
                                                <p className="text-sm">
                                                    {cartDetail.quantity}
                                                </p>
                                            </div>

                                            {/* total */}
                                            <div className="col-span-2 flex flex-col justify-center text-right pr-4">
                                                <p className="text-sm">
                                                    {(
                                                        cartDetail.foodmenuprice *
                                                        cartDetail.quantity
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    )
                            )}
                    </>

                    <hr className="border border-yellow-300 my-4" />
                    <div className="grid grid-cols-2 grid-rows-3">
                        <div className="col-span-1">
                            <div className="flex items-center text-left mb-4">
                                <div className="flex items-start text-left flex-col w-full">
                                    <p className="font-bold text-xl mb-2">
                                        <FontAwesomeIcon
                                            icon={faMapMarked}
                                            className="mr-2"
                                        />
                                        Delivery Address
                                    </p>
                                    <div className="border border-gray-300 rounded p-4 w-full">
                                        <div className="flex flex-col justify-center">
                                            <p className="text-base font-bold">
                                                {address?.customerfullname}
                                            </p>
                                        </div>
                                        <div className="flex flex-col justify-center gap-1">
                                            <p className="text-sm text-gray-500">
                                                {address?.customerstreet},{" "}
                                                {address?.customerbarangay},{" "}
                                                {address?.customercity}
                                            </p>
                                            <p className="text-sm text-red-500">
                                                {address?.customercontactnumber}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start text-left flex-col w-full mb-4">
                                <p className="font-bold text-xl mb-2">
                                    <FontAwesomeIcon
                                        icon={faCartShopping}
                                        className="mr-2"
                                    />
                                    Order Type
                                </p>
                                <div className="border border-gray-300 rounded p-4 w-full">
                                    <div className="flex flex-col justify-center">
                                        <select
                                            className="border border-gray-300 rounded p-2 w-full"
                                            onChange={(e) =>
                                                setOrderMethod(e.target.value)
                                            }
                                        >
                                            <option value="Delivery" selected>
                                                Delivery
                                            </option>
                                            <option value="Pickup">
                                                Pickup
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start text-left flex-col w-full">
                                {/* branch */}
                                <p className="font-bold text-xl mb-2">
                                    <FontAwesomeIcon
                                        icon={faCartShopping}
                                        className="mr-2"
                                    />
                                    Branch
                                </p>
                                <div className="border border-gray-300 rounded p-4 w-full">
                                    <div className="flex flex-col justify-center">
                                        <select
                                            className="border border-gray-300 rounded p-2 w-full"
                                            onChange={(e) =>
                                                setSelectedBranch(
                                                    e.target.value
                                                )
                                            }
                                            value={selectedBranch}
                                        >
                                            {branch.map((branch, index) => (
                                                <option
                                                    key={branch.branchid}
                                                    value={branch.branchid}
                                                >
                                                    {branch.branchname}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-1 px-4">
                            <div className="flex items-start text-left flex-col w-full mb-4">
                                <p className="font-bold text-xl mb-2">
                                    <FontAwesomeIcon
                                        icon={faCartShopping}
                                        className="mr-2"
                                    />
                                    Order Details
                                </p>
                                <div className="border border-gray-300 rounded p-8 w-full flex flex-col gap-4">
                                    <div className="flex flex-row justify-between">
                                        <p className="text-base font-bold">
                                            Total Items:
                                        </p>
                                        <p className="text-base font-bold text-right text-red-500">
                                            {totalItems}
                                        </p>
                                    </div>
                                    <div className="flex flex-row justify-between">
                                        <p className="text-base font-bold">
                                            Subtotal:
                                        </p>
                                        <p className="text-base font-bold text-right text-red-500">
                                            {checkedTotal.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex flex-row justify-between">
                                        <p className="text-base font-bold">
                                            Delivery Fee:
                                        </p>
                                        <p className="text-base font-bold text-right text-red-500">
                                            {deliveryFee.toFixed(2)}
                                        </p>
                                    </div>
                                    <hr className="border-1 border-gray-300" />
                                    <div className="flex flex-row justify-between">
                                        <p className="text-base font-bold">
                                            Total Amount:
                                        </p>
                                        <p className="text-base font-bold text-right text-red-500">
                                            {(
                                                checkedTotal + deliveryFee
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex flex-row justify-between">
                                        <p className="text-base font-bold">
                                            Payment Method:
                                        </p>
                                        <p className="text-base font-bold text-right text-red-500">
                                            Cash on Delivery
                                        </p>
                                    </div>
                                    <div className="flex flex-row justify-between">
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                            onClick={placeOrder}
                                        >
                                            Place Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
