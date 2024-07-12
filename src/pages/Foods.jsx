import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import AddFoodModal from "../components/AddFoodModal";
import UpdateFoodModal from "../components/UpdateFoodModal";
import Available from "../components/Available";
import { storage } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";

const Foods = () => {
    const [reload, setReload] = useState(false); // Used to reload the data table after a change has been made to the database
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

    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

    const [showAddFoodModal, setShowAddFoodModal] = useState(false);
    const [showUpdateFoodModal, setShowUpdateFoodModal] = useState(false);
    const [selectedFood, setSelectedFood] = useState({});

    const [foods, setFoods] = useState([]);
    const [search, setSearch] = useState("");

    const [foodPrices, setFoodPrices] = useState([]);

    const [isReloading, setIsReloading] = useState(false);

    const fetchData = async () => {
        let apiUrl = "https://sfm-api-production.up.railway.app/api/food";

        if (search !== "") {
            apiUrl += `/search/${search}`;
        }

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            setIsReloading(true);
            const foodsWithDownloadURLs = await Promise.all(
                data.map(async (food) => {
                    try {
                        const imageRef = ref(
                            storage,
                            `foods/${food.foodmenuimage}`
                        );

                        await new Promise((resolve) =>
                            setTimeout(resolve, 2000)
                        );

                        const downloadURL = await getDownloadURL(imageRef);
                        console.log(downloadURL);

                        return { ...food, foodmenuimage: downloadURL };
                    } catch (error) {
                        console.error(
                            `Error fetching download URL for ${food.foodmenuimage}`,
                            error
                        );
                        return { ...food, foodmenuimage: null };
                    }
                })
            );
            setIsReloading(false);
            setFoods(foodsWithDownloadURLs);
        } catch (error) {
            console.error("Error fetching food data", error);
        }
    };

    useEffect(() => {
        fetchData();
        setReload(false);
    }, [reload, search]);

    const handleClickedRow = (row) => {
        console.log(row);
        setSelectedFood(row);
        if (localStorage.getItem("userRoleID") === "STF") {
            setShowUpdateFoodModal(true);
        } else if (localStorage.getItem("userRoleID") === "ADM") {
            setShowAvailabilityModal(true);
        }
    };

    const columns = useMemo(() => [
        {
            name: "ID",
            selector: (row) => row.foodmenuid,
            sortable: true,
        },

        {
            name: "Image",
            selector: (row) => (
                <img
                    src={row.foodmenuimage}
                    alt={row.foodmenuname}
                    className="w-20"
                />
            ),
            sortable: true,
        },
        {
            name: "Name",
            selector: (row) => row.foodmenuname,
            sortable: true,
        },
        {
            name: "Description",
            selector: (row) => row.foodmenudescription,
            sortable: true,
        },
        {
            name: "Category",
            selector: (row) => row.foodmenucategory,
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
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                </div>
            ),
        },
    ]);

    return (
        <>
            <section>
                <Sidebar />
                {showAvailabilityModal && (
                    <Available
                        showModal={showAvailabilityModal}
                        setShowModal={setShowAvailabilityModal}
                        foodMenuID={selectedFood.foodmenuid}
                        setReload={setReload}
                    />
                )}
                {isReloading && (
                    <div className="bottom-0 right-0 mb-4 mr-4 z-10 fixed border border-gray-200 rounded-lg shadow-lg bg-white">
                        <div className="flex justify-end items-end gap-2 bg-white w-sm p-4 rounded-lg shadow-lg border-b-4 border-red-500 items-center">
                            <div role="status">
                                <svg
                                    aria-hidden="true"
                                    class="w-8 h-full text-gray-200 animate-spin fill-blue-600"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                                <span class="sr-only">Loading...</span>
                            </div>
                            <h5 className="text-sm">
                                Waiting for image to load...
                            </h5>
                        </div>
                    </div>
                )}
                <div className="p-4 sm:ml-64">
                    <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg">
                        <div className="header bg-white w-sm mb-4 flex justify-between items-center">
                            <h1 className="font-bold text-2xl">Foods</h1>
                            <div className="flex justify-between items-center bg-white w-sm gap-2">
                                <div className="search-container">
                                    <input
                                        type="search"
                                        id="food-search"
                                        className="block w-full py-2.5 px-4 text-sm rounded-none text-gray-900 rounded-lg bg-gray-50 border-gray-300 border outline-none"
                                        placeholder="Search foods..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                                {localStorage.getItem("userRoleID") ===
                                    "STF" && (
                                    <button
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                        data-modal-target="add-food-modal"
                                        data-modal-toggle="add-food-modal"
                                        onClick={() =>
                                            setShowAddFoodModal(true)
                                        }
                                    >
                                        <FontAwesomeIcon icon={faSquarePlus} />{" "}
                                        Add Food
                                    </button>
                                )}
                            </div>
                        </div>
                        <hr className="border-b-1 border-gray-300 my-2" />

                        <DataTable
                            columns={columns}
                            data={foods}
                            pagination
                            highlightOnHover
                        ></DataTable>
                    </div>
                </div>
            </section>
            {showAddFoodModal && (
                <AddFoodModal
                    showModal={showAddFoodModal}
                    setShowModal={setShowAddFoodModal}
                    setReload={setReload}
                />
            )}
            {showUpdateFoodModal && (
                <UpdateFoodModal
                    showModal={showUpdateFoodModal}
                    setShowModal={setShowUpdateFoodModal}
                    foodData={selectedFood}
                    setReload={setReload}
                />
            )}
        </>
    );
};

export default Foods;
