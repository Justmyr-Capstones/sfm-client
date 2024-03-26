import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
//showModal={showAvailabilityModal} setShowModal={setShowAvailabilityModal} foodMenuID={row.foodmenuid} setReload={setReload}
const Available = ({ showModal, setShowModal, foodMenuID, setReload }) => {
    // Initialize state with parsed values from local storage or default values
    const [id, setId] = useState(() => localStorage.getItem("userID") || "");
    const [userRoleID, setUserRoleID] = useState(
        () => localStorage.getItem("userRoleID") || ""
    );
    const [admin, setAdmin] = useState({});
    console.log(foodMenuID, "Asdasdasdasds");
    const [availability, setAvailability] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [prices, setPrices] = useState([]);

    const [foodPrice, setFoodPrice] = useState([]);
    const [newFoodPrice, setNewFoodPrice] = useState([]);

    // Fetch admin data when 'id' changes
    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const response = await fetch(
                    `https://sfm-dbcc0a8f87a3.herokuapp.com/api/admin/${id}`
                );
                const data = await response.json();
                setAdmin(data);
            } catch (error) {
                console.error("Error fetching admin data:", error);
                // Handle the error (e.g., display a message to the user)
            }
        };

        fetchAdmin();
    }, []);

    // Fetch availability data when 'foodMenuID' or 'admin.branchid' changes
    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const data1 = {
                    branchid: admin.branchid,
                    foodMenuID: foodMenuID,
                };
                const response = await fetch(
                    `https://sfm-dbcc0a8f87a3.herokuapp.com/api/availability/`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data1),
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                // Check if data is not empty and has the expected structure
                if (data && data.available) {
                    console.log(data);
                    setAvailability(data);
                    setSelectedOption(data.available);
                } else {
                    console.error("Invalid or empty response:", data);
                    // Handle the situation accordingly (e.g., set default values)
                }
            } catch (error) {
                console.error("Error fetching availability data:", error);
                // Handle the error (e.g., display a message to the user)
            }
        };

        fetchAvailability();
    }, [admin.branchid]);

    useEffect(() => {
        const getFoodPrice = async () => {
            try {
                const response = await fetch(
                    `https://sfm-dbcc0a8f87a3.herokuapp.com/api/food/price/${foodMenuID}/${admin.branchid}`
                );
                const jsonData = await response.json();
                setFoodPrice(jsonData);
            } catch (err) {
                console.error(err.message);
            }
        };

        getFoodPrice();
    }, [foodMenuID, admin.branchid]);

    useEffect(() => {
        console.log(selectedOption);
    }, [selectedOption]);

    const handleUpdate = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#6366F1",
            cancelButtonColor: "#EF4444",
            confirmButtonText: "Yes, update it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const data1 = {
                        branchid: admin.branchid,
                        foodMenuID: foodMenuID,
                        available: selectedOption,
                    };
                    const response = await fetch(
                        `https://sfm-dbcc0a8f87a3.herokuapp.com/api/availability/update`,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(data1),
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! Status: ${response.status}`
                        );
                    }

                    const data = await response.json();

                    // Check if data is not empty and has the expected structure
                    if (data && data.available) {
                        if (response.status === 200) {
                            try {
                                // Use Promise.all to wait for all requests to complete
                                await Promise.all(
                                    foodPrice.map(async (price) => {
                                        const updatedPriceData = {
                                            foodMenuPrice: price.foodmenuprice,
                                        };

                                        const priceResponse = await fetch(
                                            `https://sfm-dbcc0a8f87a3.herokuapp.com/api/food/price/update/${price.foodmenupriceid}`,
                                            {
                                                method: "PATCH",
                                                headers: {
                                                    "Content-Type":
                                                        "application/json",
                                                },
                                                body: JSON.stringify(
                                                    updatedPriceData
                                                ),
                                            }
                                        );

                                        if (priceResponse.status !== 200) {
                                            // Handle error for individual price update
                                            console.error(
                                                `Failed to update price for ID ${price.foodmenuid}`
                                            );
                                        }
                                    })
                                );

                                console.log(
                                    "Food and prices updated successfully"
                                );
                                setReload(true);
                                setShowModal(false);
                            } catch (error) {
                                // Handle errors that occur during the entire process
                                console.error(
                                    "Error updating food and prices:",
                                    error.message
                                );
                            }
                        } else {
                            console.error("Failed to update food");
                        }
                        console.log(data);
                        setAvailability(data);
                        setSelectedOption(data.available);
                        setReload(true);
                        setShowModal(!showModal);
                    } else {
                        console.error("Invalid or empty response:", data);
                        // Handle the situation accordingly (e.g., set default values)
                    }
                } catch (error) {
                    console.error("Error fetching availability data:", error);
                    // Handle the error (e.g., display a message to the user)
                }
            }
        });
    };

    return (
        <div
            id="default-modal"
            tabIndex="-1"
            aria-hidden="true"
            class="overflow-y-auto overflow-x-hidden z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full fixed inset-0 flex"
        >
            <div class="relative p-4 w-full max-w-2xl max-h-full">
                <div class="relative bg-white rounded-lg shadow">
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
                        <h3 class="text-xl font-semibold text-gray-900">
                            Availability
                        </h3>
                        <button
                            type="button"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            data-modal-hide="default-modal"
                            onClick={() => setShowModal(!showModal)}
                        >
                            <svg
                                class="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    stroke-width="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div class="p-4 md:p-5 space-y-4">
                        <div class="flex flex-col">
                            <label
                                for="availability"
                                class="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
                            >
                                Availability
                            </label>
                            <div class="relative">
                                {selectedOption && (
                                    <>
                                        <select
                                            id="availability"
                                            name="availability"
                                            value={selectedOption}
                                            onChange={(e) =>
                                                setSelectedOption(
                                                    e.target.value
                                                )
                                            }
                                            class="appearance-none w-full py-2 px-4 bg-gray-50 border border-gray-300 rounded-md text-base text-gray-900 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        >
                                            <option
                                                value="Available"
                                                key="Available"
                                            >
                                                Available
                                            </option>
                                            <option
                                                value="Unavailable"
                                                key="Unavailable"
                                                selected={
                                                    selectedOption ===
                                                    "Unavailable"
                                                } // Set selected based on selectedOption
                                            >
                                                Unavailable
                                            </option>
                                        </select>
                                    </>
                                )}
                                <p className="text-gray-700 pt-4">Prices</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {foodPrice.map((price, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-start justify-start space-y-1"
                                        >
                                            <label
                                                htmlFor={`foodPrice${price.foodmenuid}`}
                                            >
                                                {price.foodmenucuttype}
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none"
                                                name={`foodPrice${price.foodmenuid}`}
                                                placeholder="Food Price"
                                                value={price.foodmenuprice}
                                                onChange={(e) => {
                                                    const newPrice = [
                                                        ...foodPrice,
                                                    ];
                                                    newPrice[
                                                        index
                                                    ].foodmenuprice =
                                                        e.target.value;
                                                    setNewFoodPrice(newPrice);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b ">
                        <button
                            data-modal-hide="default-modal"
                            type="button"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            onClick={() => handleUpdate()} //handleUpdate
                        >
                            Update
                        </button>
                        <button
                            data-modal-hide="default-modal"
                            type="button"
                            class="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
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

export default Available;
