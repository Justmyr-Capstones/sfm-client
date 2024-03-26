import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";

const UpdateFoodModal = ({ showModal, setShowModal, foodData, setReload }) => {
    console.log(foodData);
    const [foodMenuID, setFoodMenuID] = useState(foodData.foodmenuid);
    const [foodName, setFoodName] = useState(foodData.foodmenuname);
    const [foodMenuDescription, setFoodMenuDescription] = useState(
        foodData.foodmenudescription
    );
    const [newImage, setNewImage] = useState("");
    const [foodMenuCategory, setFoodMenuCategory] = useState(
        foodData.foodmenucategory
    );
    const [foodMenuImage, setFoodMenuImage] = useState(foodData.foodmenuimage);

    console.log("data: " + foodMenuID);
    const [foodPrice, setFoodPrice] = useState([]);
    const [newFoodPrice, setNewFoodPrice] = useState([]);

    useEffect(() => {
        const getFoodPrice = async () => {
            try {
                const response = await fetch(
                    `https://sfm-dbcc0a8f87a3.herokuapp.com/api/food/price/${foodData.foodmenuid}`
                );
                const jsonData = await response.json();

                setFoodPrice(jsonData);
            } catch (err) {
                console.error(err.message);
            }
        };

        getFoodPrice();
    }, []);

    useEffect(() => {
        console.log(newFoodPrice);
    }, [newFoodPrice]);

    const handleSubmit = async () => {
        let new_image;
        let updatedFoodData = {};
        if (newImage) {
            new_image = newImage.name + v4();
            const storageRef = ref(storage, `foods/${new_image}`);
            uploadBytes(storageRef, newImage);
            updatedFoodData = {
                foodmenuname: foodName,
                foodmenudescription: foodMenuDescription,
                foodmenucategory: foodMenuCategory,
                foodmenuimage: new_image,
            };
        } else {
            updatedFoodData = {
                foodmenuname: foodName,
                foodmenudescription: foodMenuDescription,
                foodmenucategory: foodMenuCategory,
                foodmenuimage: "",
            };
        }
        const response = await fetch(
            `https://sfm-dbcc0a8f87a3.herokuapp.com/api/food/update/${foodMenuID}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedFoodData),
            }
        );

        setReload(true);
        setShowModal(false);
    };

    return (
        <div
            id="update-food-modal"
            data-modal-backdrop="static"
            tabIndex="-1"
            aria-hidden="true"
            className={`fixed transform top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl p-4 overflow-x-hidden overflow-y-auto' ${
                showModal ? "block" : "hidden"
            }`}
        >
            <div className="relative w-full max-w-2xl max-h-full">
                <div className="relative bg-white rounded-lg shadow">
                    <div className="flex items-start justify-between p-4 border-b rounded-t">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Update Food
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                            data-modal-hide="add-food-modal"
                            onClick={() => setShowModal(false)}
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
                    <div className="p-6 h-[400px] overflow-y-auto">
                        <label htmlFor="foodMenuImage">Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none mb-3"
                            name="foodName"
                            placeholder="Food Name"
                            value={foodName}
                            onChange={(e) => setFoodName(e.target.value)}
                        />
                        <label htmlFor="foodMenuImage">Description</label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none mb-3"
                            name="foodMenuDescription"
                            placeholder="Food Description"
                            value={foodMenuDescription}
                            onChange={(e) =>
                                setFoodMenuDescription(e.target.value)
                            }
                        ></textarea>
                        <label htmlFor="foodMenuImage">Category</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none mb-3"
                            name="foodMenuCategory"
                            placeholder="Food Category"
                            value={foodMenuCategory}
                            onChange={(e) =>
                                setFoodMenuCategory(e.target.value)
                            }
                        />
                        {/* image */}
                        <label htmlFor="foodMenuImage">Image</label>
                        <input
                            type="file"
                            name="foodMenuImage"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none mb-3"
                            onChange={(e) => setNewImage(e.target.files[0])}
                        />
                        <img src={foodMenuImage} alt="food" className="w-1/4" />
                    </div>

                    <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b">
                        <button
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            onClick={handleSubmit}
                        >
                            Submit Food
                        </button>
                        <button
                            data-modal-hide="add-food-modal"
                            type="button"
                            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateFoodModal;
