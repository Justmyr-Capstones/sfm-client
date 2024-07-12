import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
const AddFoodModal = ({ showModal, setShowModal, setReload }) => {
    const [foodName, setFoodName] = useState("");
    const [foodMenuDescription, setFoodMenuDescription] = useState("");
    const [foodMenuCategory, setFoodMenuCategory] = useState("Chicken");
    const [fileError, setFileError] = useState("");
    const [foodMenuImage, setFoodMenuImage] = useState(
        "../src/assets/foods/im.jpg"
    );

    const [branchID, setBranchID] = useState([]);

    const [menuPrices, setMenuPrices] = useState([
        { foodMenuPrice: "", foodMenuCutType: "" },
    ]);

    const handleAddPrice = () => {
        setMenuPrices([
            ...menuPrices,
            { foodMenuPrice: "", foodMenuCutType: "" },
        ]);
    };

    const handleRemovePrice = (index) => {
        if (menuPrices.length === 1) return;
        const updatedPrices = menuPrices.filter((_, i) => i !== index);
        setMenuPrices(updatedPrices);
    };
    const handleChange = (index, field, value) => {
        const updatedPrices = [...menuPrices];
        updatedPrices[index][field] = value;
        setMenuPrices(updatedPrices);
    };

    useEffect(() => {
        const getBranchID = async () => {
            try {
                const response = await fetch(
                    "https://sfm-api-production.up.railway.app/api/branch/ids"
                );
                const jsonData = await response.json();
                setBranchID(jsonData);
            } catch (err) {
                console.error(err.message);
            }
        };
        getBranchID();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const id = Math.floor(Math.random() * 90000) + 10000;

        let new_food_name = foodMenuImage.name + v4();

        const new_food = {
            foodMenuID: id,
            foodMenuName: foodName,
            foodMenuDescription: foodMenuDescription,
            foodMenuCategory: foodMenuCategory,
            foodMenuImage: new_food_name,
        };

        if (!foodMenuImage.type.match("image.*")) {
            setFileError("Please select an image file");
            return;
        }

        try {
            const setFood = async () => {
                const response = await fetch(
                    "https://sfm-api-production.up.railway.app/api/food/add",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(new_food),
                    }
                );
                console.log(response);

                if (response.ok) {
                    console.log("Food added");

                    const imageRef = ref(storage, `foods/${new_food_name}`);

                    uploadBytes(imageRef, foodMenuImage).then(() => {
                        console.log("Image uploaded");
                    });

                    menuPrices.map(async (price, index) => {
                        branchID.map(async (branch) => {
                            let priceData = {
                                foodMenuID: id,
                                foodMenuPrice: price.foodMenuPrice,
                                foodMenuCutType: price.foodMenuCutType,
                                branchID: branch.branchid,
                            };

                            console.log("Price data", priceData);

                            const priceResponse = await fetch(
                                "https://sfm-api-production.up.railway.app/api/food/price/add",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(priceData),
                                }
                            );
                        });

                        console.log(priceResponse);
                        console.log("Price added");
                    });
                    console.log("Branch ID", branchID);
                    branchID.map(async (branch) => {
                        let availabilityData = {
                            availabilityid:
                                "AV" +
                                Math.floor(Math.random() * 90000) +
                                10000,
                            branchid: branch.branchid,
                            foodmenuid: id,
                            available: "Available",
                        };

                        const availabilityResponse = await fetch(
                            "https://sfm-api-production.up.railway.app/api/availability/add",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(availabilityData),
                            }
                        );

                        console.log(availabilityResponse);
                        console.log("Availability added");
                    });
                }

                setReload(true);
                setShowModal(false);
            };

            setFood();
        } catch (error) {
            console.error("Error adding food:", error);
            // Handle error, show a message to the user, or log it as needed
        }
    };
    return (
        <div
            id="add-food-modal"
            data-modal-backdrop="static"
            tabIndex="-1"
            aria-hidden="true"
            className={`fixed transform top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl p-4 overflow-x-hidden overflow-y-auto' ${
                showModal ? "block" : "hidden"
            }`}
        >
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="relative w-full max-w-2xl max-h-full">
                    <div className="relative bg-white rounded-lg shadow">
                        <div className="flex items-start justify-between p-4 border-b rounded-t">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Add Food
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
                                        stroke-width="2"
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                    />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto h-96">
                            <div className="input-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Food Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none"
                                    name="foodName"
                                    placeholder="Food Name"
                                    onChange={(e) =>
                                        setFoodName(e.target.value)
                                    }
                                />
                            </div>
                            <div className="input-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Food Description
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none"
                                    name="foodMenuDescription"
                                    placeholder="Food Description"
                                    onChange={(e) =>
                                        setFoodMenuDescription(e.target.value)
                                    }
                                ></textarea>
                            </div>
                            <div className="input-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Food Category
                                </label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none"
                                    name="foodMenuCategory"
                                    onChange={(e) =>
                                        setFoodMenuCategory(e.target.value)
                                    }
                                >
                                    <option value="Chicken">Chicken</option>
                                    <option value="Pork">Pork</option>
                                </select>
                            </div>
                            {/* <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none"
                                name="foodMenuCategory"
                                placeholder="Food Category"
                                onChange={(e) =>
                                    setFoodMenuCategory(e.target.value)
                                }
                            /> */}
                            <div className="input-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Food Image
                                </label>
                                <input
                                    type="file"
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none ${
                                        fileError ? "border-red-500" : ""
                                    }`}
                                    name="foodMenuImage"
                                    placeholder="Food Image"
                                    onChange={(e) =>
                                        setFoodMenuImage(e.target.files[0])
                                    }
                                />
                                <small className="text-red-500 text-sm mt-1">
                                    {fileError}
                                </small>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {menuPrices.map((price, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-row items-center space-x-2 w-full"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Price
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={price.foodMenuPrice}
                                                onChange={(e) =>
                                                    handleChange(
                                                        index,
                                                        "foodMenuPrice",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cut Type
                                            </label>
                                            <input
                                                type="text"
                                                value={price.foodMenuCutType}
                                                onChange={(e) =>
                                                    handleChange(
                                                        index,
                                                        "foodMenuCutType",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none"
                                            />
                                        </div>
                                        {menuPrices.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemovePrice(index)
                                                }
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold rounded mt-2 p-2"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={handleAddPrice}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded mt-2 p-2"
                            >
                                Add Price
                            </button>
                        </div>
                        <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b">
                            <button
                                type="submit"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
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
            </form>
        </div>
    );
};

export default AddFoodModal;
