import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { storage } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";
const FoodModal = ({
    showModal,
    setShowModal,
    selectedFood,
    selectedBranch,
    foodPrices,
    available,
    setReload,
}) => {
    const [customerID, setCustomerID] = useState(
        localStorage.getItem("userID")
    );
    const [foodMenuID, setFoodMenuID] = useState();
    const [foodMenuPriceID, setFoodMenuPriceID] = useState(""); // "FP8
    const [quantity, setQuantity] = useState(1);
    const [foodImage, setFoodImage] = useState("");

    const [foods, setFoods] = useState([]);

    useEffect(() => {
        const getPicture = async () => {
            try {
                const storageRef = ref(storage, selectedFood.foodmenuimage);
                const picture = await getDownloadURL(storageRef);
                setFoodImage(picture);
            } catch (error) {
                console.error(error.message);
            }
        };

        getPicture();
    }, []);

    const addToCart = async (e) => {
        e.preventDefault();
        console.log(available);

        if (available?.toLowerCase() === "unavailable") {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "This item is unavailable!",
                timer: 1500,
            });
            return;
        }

        try {
            //if customerID is null, redirect to login
            console.log(customerID);
            if (!customerID) {
                await Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Please login first!",
                    timer: 1500,
                });
                window.location.href = "/login";
            }
            if (available === "Unavailable") {
                await Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "This item is unavailable!",
                    timer: 1500,
                });
                return;
            }

            const newCart = {
                cartID: "C" + Math.floor(Math.random() * 1000000000),
                customerID: customerID,
                foodMenuID: foodMenuID,
                foodMenuPriceID: foodMenuPriceID,
                quantity: quantity,
            };

            const confirmed = await Swal.fire({
                icon: "question",
                title: "Are you sure?",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No",
            });

            if (confirmed.isConfirmed) {
                const response = await fetch(
                    "https://sfm-dbcc0a8f87a3.herokuapp.com/api/cart/add",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(newCart),
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to add item to cart");
                }

                const data = await response.json();
                console.log(data);
                setShowModal(!showModal);

                Swal.fire({
                    icon: "success",
                    title: "Item added to cart!",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        } catch (error) {
            console.error(error.message);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
            });
        }

        setReload(true);
    };

    useEffect(() => {
        setFoodMenuID(selectedFood.foodmenuid);
        //get food prices by foodMenuID
        const getFoodPrices = async () => {
            try {
                const response = await fetch(
                    `https://sfm-dbcc0a8f87a3.herokuapp.com/api/food/price`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                const data = await response.json();
                setFoods(data);
                console.log(data); // Log the fetched data
            } catch (error) {
                console.error("Error fetching food prices:", error);
            }
        };

        getFoodPrices();
    }, [selectedFood]);

    return (
        <div
            id="foodModal"
            tabIndex="-1"
            aria-hidden={showModal ? "true" : "false"}
            className={`fixed transform top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl p-4 overflow-x-hidden overflow-y-auto z-[100] ${
                showModal ? "block" : "hidden"
            }`}
        >
            <div className="relative w-full max-w-2xl max-h-full">
                <div className="relative bg-white rounded-lg shadow">
                    <div className="flex items-start justify-between p-4 border-b rounded-t">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Add to cart
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                            data-modal-hide="foodModal"
                            onClick={() => setShowModal(!showModal)}
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div className="p-6 space-y-2 overflow-y-auto h-80">
                        <div className="img-wrapper">
                            <img
                                src={selectedFood.foodmenuimage}
                                alt={selectedFood.foodmenuname}
                                className="w-[90%] h-[90%] mx-auto object-cover rounded-lg"
                            />
                        </div>
                        <div className="food-info">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedFood.foodmenuname}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {selectedFood.foodmenudescription}
                            </p>
                        </div>
                        <div className="input-group">
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-300 text-sm text-gray-500"
                                id="foodSize"
                                name="foodSize"
                                required
                                onChange={(e) =>
                                    setFoodMenuPriceID(e.target.value)
                                }
                            >
                                <option value="">Select size</option>
                                {/* filter foodPrices by foodMenuID */}
                                {foodPrices.map(
                                    (foodPrice) =>
                                        foodPrice.foodmenuid === foodMenuID &&
                                        foodPrice.branchid ===
                                            selectedBranch && (
                                            <option
                                                key={foodPrice.foodmenupriceid}
                                                value={
                                                    foodPrice.foodmenupriceid
                                                }
                                            >
                                                {foodPrice.foodmenucuttype} -
                                                Php {foodPrice.foodmenuprice}
                                            </option>
                                        )
                                )}
                            </select>
                        </div>
                        <div className="input-group">
                            <input
                                type="number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-300 text-sm text-gray-500"
                                id="foodQuantity"
                                name="foodQuantity"
                                placeholder="Quantity"
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b">
                        <button
                            data-modal-hide="foodModal"
                            type="button"
                            className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg text-sm font-medium px-5 py-2.5 hover:text-white focus:z-10"
                            onClick={(e) => addToCart(e)}
                        >
                            Add to cart
                        </button>
                        <button
                            data-modal-hide="foodModal"
                            type="button"
                            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                            onClick={() => setShowModal(!showModal)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodModal;
