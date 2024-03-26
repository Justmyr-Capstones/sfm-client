import { useState } from "react";
import FoodModal from "../components/FoodModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faTrash } from "@fortawesome/free-solid-svg-icons";
import AddressModal from "../components/AddressModal";
import { storage } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import BG from "../assets/img/menu.jpg";

export const NoProductsFound = ({ text }) => {
    return (
        <div className="flex flex-col justify-center items-center h-full border border-gray-300 p-4 rounded-lg">
            <p className="text-2xl font-bold text-red-500">No products found</p>
            <p className="text-sm text-gray-500">{text}</p>
        </div>
    );
};

const Menu = () => {
    const [foods, setFoods] = useState([]);
    const [foodPrices, setFoodPrices] = useState([]);
    const [selectedFood, setSelectedFood] = useState({});
    const [foodModal, setFoodModal] = useState(false);
    const [cart, setCart] = useState([]);
    const [addressModal, setAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState({});
    const [address, setAddress] = useState([]);
    const [customerID, setCustomerID] = useState(
        localStorage.getItem("userID")
    );
    const filterKeywords = [
        "All",
        "Chicken",
        "Pork",
        "Your Favorites",
        "Best Seller",
    ];

    const [filterKeyword, setFilterKeyword] = useState("All");

    const [branchLocation, setBranchLocation] = useState([]);

    const [orderType, setOrderType] = useState("Delivery");

    const [selectedBranch, setSelectedBranch] = useState("");

    const [favoriteFoods, setFavoriteFoods] = useState([]);

    const [rider, setRider] = useState([]);

    const [bestSeller, setBestSeller] = useState([]);

    const [reload, setReload] = useState(false);

    const [available, setAvailable] = useState([]);

    useEffect(() => {
        const fetchBranchLocation = async () => {
            const responseBranchLocation = await fetch(
                "https://sfm-dbcc0a8f87a3.herokuapp.com/api/branch"
            );
            const dataBranchLocation = await responseBranchLocation.json();

            const filteredBranchLocation = dataBranchLocation.filter(
                (branch) => branch.is_active === "active"
            );

            console.log(filteredBranchLocation);
            setBranchLocation(filteredBranchLocation);
        };
        fetchBranchLocation();
    }, []);

    const fetchData = async () => {
        let apiUrl = "https://sfm-dbcc0a8f87a3.herokuapp.com/api/food";

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            const foodsWithDownloadURLs = await Promise.all(
                data.map(async (food) => {
                    try {
                        const imageRef = ref(
                            storage,
                            `foods/${food.foodmenuimage}`
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

            if (
                foodsWithDownloadURLs.every((food) => food && food.foodmenuname)
            ) {
                setFoods(foodsWithDownloadURLs);
            } else {
                console.error(
                    "Invalid data in foodsWithDownloadURLs",
                    foodsWithDownloadURLs
                );
            }
        } catch (error) {
            // Handle fetch error
            console.error("Error fetching food data", error);
        }
    };

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                await fetchData();

                const responseFoodPrice = await fetch(
                    "https://sfm-dbcc0a8f87a3.herokuapp.com/api/food/price"
                );
                const dataFoodPrice = await responseFoodPrice.json();

                const responseRider = await fetch(
                    "https://sfm-dbcc0a8f87a3.herokuapp.com/api/rider"
                );
                const dataRider = await responseRider.json();
                setRider(dataRider);

                setFoodPrices(dataFoodPrice);

                setBranchSelectKey((prevKey) => prevKey + 1); // Increment the key

                const userID = localStorage.getItem("userID");
                if (userID) {
                    const responseCart = await fetch(
                        `https://sfm-dbcc0a8f87a3.herokuapp.com/api/cart/${userID}`
                    );
                    const dataCart = await responseCart.json();
                    setCart(dataCart);

                    const responseAddresses = await fetch(
                        `https://sfm-dbcc0a8f87a3.herokuapp.com/api/address/${userID}`
                    );
                    const dataAddresses = await responseAddresses.json();
                    console.log("dataAddresses:", dataAddresses, "asdasdasd");
                    setAddress(dataAddresses);
                    console.log(
                        "address:",
                        dataAddresses,
                        "asdasdasdasdasdsdasdas"
                    );
                    setSelectedAddress(dataAddresses);

                    const responseFavoriteFoods = await fetch(
                        `https://sfm-dbcc0a8f87a3.herokuapp.com/api/order/most/${userID}`
                    );
                    const dataFavoriteFoods =
                        await responseFavoriteFoods.json();
                    console.log(dataFavoriteFoods, "test2");
                    setFavoriteFoods(dataFavoriteFoods);
                } else {
                    setSelectedAddress({});
                }

                const responseBestSeller = await fetch(
                    "https://sfm-dbcc0a8f87a3.herokuapp.com/api/order/best"
                );
                const dataBestSeller = await responseBestSeller.json();
                setBestSeller(dataBestSeller);
                console.log(dataBestSeller, "test");
            } catch (error) {
                console.error("Error fetching menu data:", error);
            }
        };

        fetchMenuData();
        setReload(false);
    }, [customerID, filterKeyword, reload]);

    const deleteFromCart = async (cartID) => {
        try {
            const response = await fetch(
                "https://sfm-dbcc0a8f87a3.herokuapp.com/api/cart/delete/item/" +
                    cartID,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                const updatedCart = cart.filter(
                    (item) => item.cartid !== cartID
                );
                setCart(updatedCart);
            } else {
                console.error("Error deleting item from cart");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const [nearestBranch, setNearestBranch] = useState("");
    const [branchSelectKey, setBranchSelectKey] = useState(0);

    const findNearestBranch = (customerLatitude, customerLongitude) => {
        console.log(customerLatitude, customerLongitude);
        let nearestBranchID = null;
        let minDistance = Infinity;

        branchLocation.forEach((branch) => {
            const branchLatitude = parseFloat(branch.branchlatitude);
            const branchLongitude = parseFloat(branch.branchlongitude);

            console.log(branchLatitude, branchLongitude);

            const dLat = ((branchLatitude - customerLatitude) * Math.PI) / 180;
            const dLon =
                ((branchLongitude - customerLongitude) * Math.PI) / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((customerLatitude * Math.PI) / 180) *
                    Math.cos((branchLatitude * Math.PI) / 180) *
                    Math.sin(dLon / 2) *
                    Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = 6371 * c; // Radius of the Earth in km

            if (distance < minDistance) {
                minDistance = distance;
                nearestBranchID = branch.branchid;
                console.log(nearestBranchID);
            }

            console.log(nearestBranchID);
        });

        // Only update nearestBranch, do not update selectedBranch
        setNearestBranch(nearestBranchID);
        setSelectedBranch(nearestBranchID);
    };

    //find nearest branch
    useEffect(() => {
        if (
            selectedAddress.addresslatitude &&
            selectedAddress.addresslongitude
        ) {
            findNearestBranch(
                parseFloat(selectedAddress.addresslatitude),
                parseFloat(selectedAddress.addresslongitude)
            );
        }
    }, [selectedAddress]);

    useEffect(() => {
        const fetchAvailableData = async (branchID) => {
            try {
                const response = await fetch(
                    `https://sfm-dbcc0a8f87a3.herokuapp.com/api/availability/branch/${branchID}`
                );

                const data = await response.json();

                setAvailable(data);

                console.log(data, "Asdasd");
            } catch (error) {
                console.error(error);
            }
        };

        fetchAvailableData(selectedBranch);

        console.log(selectedBranch + "b");

        //filter price by branch

        console.log(foodPrices, "Asdashahahd");

        console.log(
            foodPrices.filter(
                (price) => price.branchid.toString() === selectedBranch
            ),
            "Asdashahahdasdasdasdasdasd"
        );
    }, [selectedBranch]);

    const handleBranchChange = (e) => {
        console.log(e.target.value);
        setSelectedBranch(e.target.value);
    };

    const [searchKeyword, setSearchKeyword] = useState("");

    const handleSearchChange = (e) => {
        setFilterKeyword("All");

        setSearchKeyword(e.target.value);
    };

    const submitOrder = async (e) => {
        e.preventDefault();
        Swal.fire({
            title: "Are you sure you want to place this order?",
            text: "You will not be able to change your order once it is placed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, place order",
            cancelButtonText: "No, cancel",
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                console.log(selectedAddress, customerID);
                if (customerID === "") {
                    alert("Please select an address");
                    return;
                }
                if (cart.length === 0) {
                    alert("Please add items to cart");
                    return;
                }
                const order = {
                    //id random int
                    customerorderid: Math.random().toString(36).substr(2, 9),
                    customerid: localStorage.getItem("userID"),
                    customeraddressid: selectedAddress.customeraddressid,
                    customerorderdate: new Date()
                        .toISOString()
                        .slice(0, 19)
                        .replace("T", " "),
                    customerorderstatus: "Pending",
                    customerordertotalprice: cart.reduce(
                        (total, item) =>
                            parseFloat(total) +
                            parseFloat(
                                foodPrices.find(
                                    (price) =>
                                        price.foodmenupriceid ===
                                        item.foodmenupriceid
                                ).foodmenuprice
                            ) *
                                item.quantity,
                        50
                    ),
                    customerorderpaymentmethod: "Cash on Delivery",
                    customerorderpaymentstatus: "Pending",
                    deliverypersonid: selectedBranch,
                    estimated_delivery_time: "",
                    order_method: orderType,
                };
                console.log(order);
                try {
                    const response = await fetch(
                        "https://sfm-dbcc0a8f87a3.herokuapp.com/api/order/add",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(order),
                        }
                    );

                    if (response.ok) {
                        cart.forEach(async (item) => {
                            const orderItem = {
                                customerorderitemid: Math.random()
                                    .toString(36)
                                    .substr(2, 9),
                                customerorderid: order.customerorderid,
                                foodmenuid: item.foodmenuid,
                                foodmenupriceid: item.foodmenupriceid,
                                customerorderitemquantity: item.quantity,
                                customerorderitemtotalprice:
                                    item.quantity *
                                    foodPrices.find(
                                        (price) =>
                                            price.foodmenupriceid ===
                                            item.foodmenupriceid
                                    ).foodmenuprice,
                            };

                            console.log(orderItem);
                            try {
                                const response = await fetch(
                                    "https://sfm-dbcc0a8f87a3.herokuapp.com/api/order/item/add",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(orderItem),
                                    }
                                );

                                if (response.ok) {
                                    console.log("Order item added");
                                } else {
                                    console.error("Error adding order item");
                                }
                            } catch (error) {
                                console.error(error);
                            }
                        });

                        try {
                            const responseDeleteCart = await fetch(
                                "https://sfm-dbcc0a8f87a3.herokuapp.com/api/customer/cart/delete/" +
                                    customerID,
                                {
                                    method: "DELETE",
                                }
                            );

                            if (responseDeleteCart.ok) {
                                console.log("Cart deleted");

                                window.location.href = "/orderhistory";
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        });
    };

    const [selectedAvailable, setSelectedAvailable] = useState("");

    useEffect(() => {
        if (selectedFood) {
            setSelectedAvailable(
                available.find(
                    (avail) => avail.foodmenuid === selectedFood.foodmenuid
                )?.available || "DefaultUnavailableValue"
            );
        }
        console.log(selectedAvailable);
    }, [selectedFood, available, selectedAvailable]);

    return (
        <>
            {foodModal ? (
                <FoodModal
                    showModal={foodModal}
                    setShowModal={setFoodModal}
                    selectedFood={selectedFood}
                    selectedBranch={selectedBranch}
                    foodPrices={foodPrices}
                    available={selectedAvailable}
                    setReload={setReload}
                />
            ) : null}
            {addressModal ? (
                <AddressModal
                    showModal={addressModal}
                    setShowModal={setAddressModal}
                    address={address}
                    selectedAddress={selectedAddress}
                    setSelectedAddress={setSelectedAddress}
                />
            ) : null}
            <Navbar />
            <section className="menu-section relative">
                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 h-full">
                    <div className="flex flex-row h-full">
                        <div className="food-menu-container h-full w-[64%] p-4 overflow-y-auto">
                            {/* Banner */}
                            <div className="santa-fe-banner bg-[#ffff01] flex justify-center items-center w-full rounded-lg">
                                <img src={BG} alt="Santa Fe Banner" />
                            </div>
                            {/* Search Bar */}
                            <div className="search-container mt-4">
                                <form>
                                    <label
                                        htmlFor="food-search"
                                        className="mb-2 text-sm font-medium text-gray-900 sr-only"
                                    >
                                        Search
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-500"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            id="food-search"
                                            name="food-search"
                                            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Search Foods and Products"
                                            value={searchKeyword}
                                            onChange={(e) =>
                                                handleSearchChange(e)
                                            }
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="filter-container mt-4">
                                <ul className="flex flex-row justify-start items-center space-x-2">
                                    {filterKeywords.map((keyword) => (
                                        <li
                                            key={keyword}
                                            className={`px-3 py-1 text-lg font-medium text-gray-900 rounded-lg hover:bg-gray-200 transition duration-150 ease-in-out cursor-pointer ${
                                                filterKeyword === keyword
                                                    ? "bg-gray-200"
                                                    : ""
                                            }`}
                                            onClick={() => (
                                                setSearchKeyword(""),
                                                setFilterKeyword(keyword)
                                            )}
                                        >
                                            {keyword}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <hr className="my-2 border-b-1 border-gray-300" />
                            <div className="menu-container mt-4">
                                {filterKeyword === "Your Favorites" &&
                                available.length > 0 ? (
                                    <>
                                        <h3 className="text-xl font-bold text-red-900">
                                            Your Favorites
                                        </h3>

                                        <hr className="my-2 border-b-1 border-gray-300" />

                                        <ul className="grid grid-cols-2 gap-4">
                                            {/* map foods and for each foodmenuid in foodfavorites, display foodmenuid */}
                                            {foods &&
                                            foodPrices &&
                                            favoriteFoods.length > 0 ? (
                                                foods.map((food) => {
                                                    const matchingFavorite =
                                                        favoriteFoods.find(
                                                            (favorite) =>
                                                                favorite.foodmenuid ===
                                                                food.foodmenuid
                                                        );

                                                    if (matchingFavorite) {
                                                        return (
                                                            <li
                                                                key={
                                                                    food.foodmenuid
                                                                }
                                                                className="food-menu-item rounded-lg"
                                                                data-modal-target="foodModal"
                                                                data-modal-toggle="foodModal"
                                                                onClick={() => {
                                                                    setSelectedFood(
                                                                        food
                                                                    );
                                                                    setSelectedAvailable(
                                                                        available.find(
                                                                            (
                                                                                avail
                                                                            ) =>
                                                                                avail.foodmenuid ===
                                                                                food.foodmenuid
                                                                        )
                                                                            ?.available ||
                                                                            "DefaultUnavailableValue"
                                                                    );

                                                                    setFoodModal(
                                                                        true
                                                                    );
                                                                }}
                                                            >
                                                                <div className="food-menu-image-container h-[12rem]">
                                                                    <img
                                                                        src={
                                                                            food.foodmenuimage
                                                                        }
                                                                        alt={
                                                                            food.foodmenuname
                                                                        }
                                                                        className="object-cover w-full h-full rounded-t-lg"
                                                                    />
                                                                </div>
                                                                <div className="food-menu-info-container p-4">
                                                                    <div className="food-menu-name-container flex flex-row justify-between items-center">
                                                                        <h3 className="text-lg font-medium text-gray-900">
                                                                            {
                                                                                food.foodmenuname
                                                                            }
                                                                        </h3>
                                                                        {available.find(
                                                                            (
                                                                                avail
                                                                            ) =>
                                                                                avail.foodmenuid ===
                                                                                food.foodmenuid
                                                                        )
                                                                            .available ===
                                                                        "Available" ? (
                                                                            <p className="text-sm text-green-500">
                                                                                Available
                                                                            </p>
                                                                        ) : (
                                                                            <p className="text-sm text-red-500">
                                                                                Not
                                                                                Available
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="food-menu-description-container">
                                                                        <p className="text-sm text-gray-500">
                                                                            {
                                                                                food.foodmenudescription
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="food-menu-price-container">
                                                                        {foodPrices
                                                                            .filter(
                                                                                (
                                                                                    price
                                                                                ) =>
                                                                                    price.foodmenuid ===
                                                                                        food.foodmenuid &&
                                                                                    price.branchid ===
                                                                                        selectedBranch
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    price
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            price.foodmenupriceid
                                                                                        }
                                                                                    >
                                                                                        <p className="text-sm text-gray-500">
                                                                                            Php{" "}
                                                                                            {
                                                                                                price.foodmenuprice
                                                                                            }{" "}
                                                                                            /{" "}
                                                                                            {
                                                                                                price.foodmenucuttype
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        );
                                                    } else {
                                                        return null;
                                                    }
                                                })
                                            ) : (
                                                <li className="col-span-2">
                                                    <NoProductsFound
                                                        text={
                                                            localStorage.getItem(
                                                                "userID"
                                                            )
                                                                ? "You have not ordered any food yet"
                                                                : "Must login first to see your favorite foods"
                                                        }
                                                    />
                                                </li>
                                            )}
                                        </ul>
                                    </>
                                ) : null}
                                {filterKeyword === "Best Seller" &&
                                available.length > 0 ? (
                                    <>
                                        <h3 className="text-xl font-bold text-red-900">
                                            Best Seller
                                        </h3>

                                        <hr className="my-2 border-b-1 border-gray-300" />

                                        <ul className="grid grid-cols-2 gap-4">
                                            {/* map foods and for each foodmenuid in foodfavorites, display foodmenuid */}
                                            {foods &&
                                            foodPrices &&
                                            bestSeller.length > 0
                                                ? foods.map((food) => {
                                                      const bestSellers =
                                                          bestSeller.find(
                                                              (bestseller) =>
                                                                  bestseller.foodmenuid ===
                                                                  food.foodmenuid
                                                          );
                                                      if (bestSellers) {
                                                          return (
                                                              <li
                                                                  key={
                                                                      food.foodmenuid
                                                                  }
                                                                  className="food-menu-item rounded-lg"
                                                                  data-modal-target="foodModal"
                                                                  data-modal-toggle="foodModal"
                                                                  onClick={() => {
                                                                      setSelectedFood(
                                                                          food
                                                                      );
                                                                      setFoodModal(
                                                                          true
                                                                      );
                                                                  }}
                                                              >
                                                                  <div className="food-menu-image-container h-[12rem]">
                                                                      <img
                                                                          src={
                                                                              food.foodmenuimage
                                                                          }
                                                                          alt={
                                                                              food.foodmenuname
                                                                          }
                                                                          className="obj    ect-cover w-full h-full rounded-t-lg"
                                                                      />
                                                                  </div>
                                                                  <div className="food-menu-info-container p-4">
                                                                      <div className="food-menu-name-container flex flex-row justify-between items-center">
                                                                          <h3 className="text-lg font-medium text-gray-900">
                                                                              {
                                                                                  food.foodmenuname
                                                                              }
                                                                          </h3>
                                                                          {available.find(
                                                                              (
                                                                                  avail
                                                                              ) =>
                                                                                  avail.foodmenuid ===
                                                                                  food.foodmenuid
                                                                          )
                                                                              .available ===
                                                                          "Available" ? (
                                                                              <p className="text-sm text-green-500">
                                                                                  Available
                                                                              </p>
                                                                          ) : (
                                                                              <p className="text-sm text-red-500">
                                                                                  Not
                                                                                  Available
                                                                              </p>
                                                                          )}
                                                                      </div>
                                                                      <div className="food-menu-description-container">
                                                                          <p className="text-sm text-gray-500">
                                                                              {
                                                                                  food.foodmenudescription
                                                                              }
                                                                          </p>
                                                                      </div>
                                                                      <div className="food-menu-price-container">
                                                                          {foodPrices
                                                                              .filter(
                                                                                  (
                                                                                      price
                                                                                  ) =>
                                                                                      price.foodmenuid ===
                                                                                          food.foodmenuid &&
                                                                                      price.branchid ===
                                                                                          selectedBranch
                                                                              )
                                                                              .map(
                                                                                  (
                                                                                      price
                                                                                  ) => (
                                                                                      <div
                                                                                          key={
                                                                                              price.foodmenupriceid
                                                                                          }
                                                                                      >
                                                                                          <p className="text-sm text-gray-500">
                                                                                              Php{" "}
                                                                                              {
                                                                                                  price.foodmenuprice
                                                                                              }{" "}
                                                                                              /{" "}
                                                                                              {
                                                                                                  price.foodmenucuttype
                                                                                              }
                                                                                          </p>
                                                                                      </div>
                                                                                  )
                                                                              )}
                                                                      </div>
                                                                  </div>
                                                              </li>
                                                          );
                                                      } else {
                                                          return null;
                                                      }
                                                  })
                                                : null}
                                        </ul>
                                    </>
                                ) : null}
                                {(filterKeyword === "Chicken" ||
                                    filterKeyword === "Pork" ||
                                    filterKeyword === "All") &&
                                available.length > 0 ? (
                                    <>
                                        <h3 className="text-xl font-bold text-red-900">
                                            All Products
                                        </h3>

                                        <hr className="my-2 border-b-1 border-gray-300" />
                                        <ul className="grid grid-cols-2 gap-4">
                                            {foods && foodPrices
                                                ? foods.map((food) =>
                                                      (food.foodmenucategory ===
                                                          filterKeyword ||
                                                          filterKeyword ===
                                                              "All") &&
                                                      (food.foodmenuname
                                                          .toLowerCase()
                                                          .includes(
                                                              searchKeyword.toLowerCase()
                                                          ) ||
                                                          food.foodmenucategory
                                                              .toLowerCase()
                                                              .includes(
                                                                  searchKeyword.toLowerCase()
                                                              )) ? (
                                                          <li
                                                              key={
                                                                  food.foodmenuid
                                                              }
                                                              className="food-menu-item rounded-lg"
                                                              data-modal-target="foodModal"
                                                              data-modal-toggle="foodModal"
                                                              onClick={() => {
                                                                  setSelectedFood(
                                                                      food
                                                                  );
                                                                  setFoodModal(
                                                                      true
                                                                  );
                                                              }}
                                                          >
                                                              <div className="food-menu-image-container h-[12rem]">
                                                                  <img
                                                                      src={
                                                                          food.foodmenuimage
                                                                      }
                                                                      alt={
                                                                          food.foodmenuname
                                                                      }
                                                                      className="object-cover w-full h-full rounded-t-lg"
                                                                  />
                                                              </div>
                                                              <div className="food-menu-info-container p-4">
                                                                  <div className="food-menu-name-container flex flex-row justify-between items-center">
                                                                      <h3 className="text-lg font-medium text-gray-900">
                                                                          {
                                                                              food.foodmenuname
                                                                          }
                                                                      </h3>
                                                                      {available.find(
                                                                          (
                                                                              avail
                                                                          ) =>
                                                                              avail.foodmenuid ===
                                                                              food.foodmenuid
                                                                      )
                                                                          .available ===
                                                                      "Available" ? (
                                                                          <p className="text-sm text-green-500">
                                                                              Available
                                                                          </p>
                                                                      ) : (
                                                                          <p className="text-sm text-red-500">
                                                                              Not
                                                                              Available
                                                                          </p>
                                                                      )}
                                                                  </div>
                                                                  <div className="food-menu-description-container">
                                                                      <p className="text-sm text-gray-500">
                                                                          {
                                                                              food.foodmenudescription
                                                                          }
                                                                      </p>
                                                                  </div>
                                                                  <div className="food-menu-price-container">
                                                                      {foodPrices
                                                                          .filter(
                                                                              (
                                                                                  price
                                                                              ) =>
                                                                                  price.foodmenuid ===
                                                                                      food.foodmenuid &&
                                                                                  price.branchid ===
                                                                                      selectedBranch
                                                                          )
                                                                          .map(
                                                                              (
                                                                                  price
                                                                              ) => (
                                                                                  <div
                                                                                      key={
                                                                                          price.foodmenupriceid
                                                                                      }
                                                                                  >
                                                                                      <p className="text-sm text-gray-500">
                                                                                          Php{" "}
                                                                                          {
                                                                                              price.foodmenuprice
                                                                                          }{" "}
                                                                                          /{" "}
                                                                                          {
                                                                                              price.foodmenucuttype
                                                                                          }
                                                                                      </p>
                                                                                  </div>
                                                                              )
                                                                          )}
                                                                  </div>
                                                              </div>
                                                          </li>
                                                      ) : null
                                                  )
                                                : null}
                                        </ul>
                                    </>
                                ) : null}

                                {filterKeyword === "All" &&
                                foods.filter(
                                    (food) =>
                                        food.foodmenuname
                                            .toLowerCase()
                                            .includes(
                                                searchKeyword.toLowerCase()
                                            ) ||
                                        food.foodmenucategory
                                            .toLowerCase()
                                            .includes(
                                                searchKeyword.toLowerCase()
                                            )
                                ).length === 0 ? (
                                    <NoProductsFound text="Please try another search keyword" />
                                ) : null}
                            </div>
                        </div>
                        <div className="order-container border h-full w-[36%] p-4 bg-white">
                            <div className="order-header">
                                <h3 className="text-2xl font-medium text-gray-900">
                                    Order Summary
                                </h3>
                            </div>
                            <hr className="my-2 border-b-1 border-gray-300" />
                            <div className="order-address-container">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    <FontAwesomeIcon
                                        icon={faLocationDot}
                                        className="mr-2"
                                    />
                                    Delivery Address
                                </h3>
                                <div className="order-address-body">
                                    {selectedAddress &&
                                    localStorage.getItem("userID") !== null ? (
                                        <>
                                            <p className="text-sm font-medium text-red-500">
                                                {
                                                    selectedAddress.customerfullname
                                                }
                                            </p>
                                            <div className="flex flex-row justify-between items-center space-x-2">
                                                <p className="text-sm text-gray-500">
                                                    {selectedAddress.customerstreet +
                                                        ", " +
                                                        selectedAddress.customerbarangay +
                                                        ", " +
                                                        selectedAddress.customercity}
                                                </p>
                                                {selectedAddress.customeraddressdefault ? (
                                                    <p className="text-gray-500 border border-blue-500 p-1 bg-blue-100 text-[10px]">
                                                        Default
                                                    </p>
                                                ) : null}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {
                                                    selectedAddress.customercontactnumber
                                                }
                                            </p>
                                            <hr className="my-1" />
                                            <p className="text-sm text-gray-500">
                                                {selectedAddress.customernotes}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            No address selected, please login to
                                            add an address
                                        </p>
                                    )}
                                </div>

                                {/* <div className="flex flex-row justify-between items-center space-x-2 mt-2">
                                    {address.length > 0 ? (
                                        <button
                                            className="border-2 border-red-500 border-dashed text-red-500 hover:bg-red-500 hover:text-white px-2 py-2 rounded-lg text-sm mt-2 w-full transition duration-150 ease-in-out"
                                            data-modal-target="addressModal"
                                            data-modal-toggle="addressModal"
                                            onClick={() =>
                                                setAddressModal(true)
                                            }
                                        >
                                            <FontAwesomeIcon icon={faEdit} />{" "}
                                            Change Address
                                        </button>
                                    ) : null}
                                    <Link
                                        className="border-2 border-red-500 border-dashed text-red-500 hover:bg-red-500 hover:text-white px-2 py-2 rounded-lg text-sm mt-2 w-full transition duration-150 ease-in-out text-center"
                                        to="/address"
                                    >
                                        <FontAwesomeIcon icon={faSquarePlus} />{" "}
                                        Add New Address
                                    </Link>
                                </div> */}
                            </div>
                            <hr className="my-2 border-b-1 border-gray-300" />

                            <div className="order-branch-container">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    <FontAwesomeIcon
                                        icon={faLocationDot}
                                        className="mr-2"
                                    />
                                    Choose Branch
                                </h3>
                                <div className="input-group">
                                    <select
                                        key={branchSelectKey}
                                        name="branch"
                                        id="branch"
                                        className="w-full border-2 border-yellow-300 border-dashed rounded-lg px-4 py-2 text-sm text-gray-500"
                                        onChange={(e) => handleBranchChange(e)}
                                        value={selectedBranch}
                                    >
                                        {branchLocation.map((location) => (
                                            <option
                                                key={location.branchid}
                                                value={location.branchid}
                                            >
                                                {location.branchname}{" "}
                                                {location.branchid ===
                                                nearestBranch
                                                    ? "(Suggested nearest branch)"
                                                    : null}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <hr className="my-2 border-b-1 border-gray-300" />

                            <div className="order-type-container">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    <FontAwesomeIcon
                                        icon={faLocationDot}
                                        className="mr-2"
                                    />
                                    Order Type
                                </h3>
                                <div className="input-group">
                                    <select
                                        name="order-type"
                                        id="order-type"
                                        className="w-full border-2 border-yellow-300 border-dashed rounded-lg px-4 py-2 text-sm text-gray-500"
                                        onChange={(e) => {
                                            setOrderType(e.target.value);
                                        }}
                                        defaultValue={orderType}
                                    >
                                        <option value="Delivery">
                                            Delivery
                                        </option>
                                        <option value="Pickup">Pickup</option>
                                    </select>
                                </div>
                            </div>

                            <div className="order-items-container mt-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Order Items
                                </h3>
                                <div className="order-items-body">
                                    {cart.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center border border-gray-300 p-4 rounded-lg">
                                            No items in cart
                                        </p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {cart.map((item) => (
                                                <li
                                                    key={item.cartid}
                                                    className="flex flex-row justify-between items-center"
                                                >
                                                    <div className="flex flex-row justify-start items-center space-x-2">
                                                        <p className="text-sm text-gray-500">
                                                            {item.quantity} x
                                                        </p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {foods &&
                                                                foods.find(
                                                                    (food) =>
                                                                        food.foodmenuid ===
                                                                        item.foodmenuid
                                                                )?.foodmenuname}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-row justify-end items-center space-x-2">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Php{" "}
                                                            {item.quantity *
                                                                foodPrices.find(
                                                                    (price) =>
                                                                        price.foodmenupriceid ===
                                                                        item.foodmenupriceid
                                                                ).foodmenuprice}
                                                        </p>
                                                        <button
                                                            className="text-red-500 hover:bg-red-500 hover:text-white px-2 py-2 rounded-lg text-sm transition duration-150 ease-in-out"
                                                            onClick={() => {
                                                                deleteFromCart(
                                                                    item.cartid
                                                                );
                                                            }}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faTrash}
                                                            />
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* Subtoal and Delivery Fee */}
                                    <hr className="my-2 border-b-1 border-gray-300" />
                                    <div className="flex flex-row justify-between items-center mt-4">
                                        <p className="text-sm text-gray-500">
                                            Subtotal
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            Php{" "}
                                            {cart.reduce(
                                                (total, item) =>
                                                    parseFloat(total) +
                                                    parseFloat(
                                                        foodPrices.find(
                                                            (price) =>
                                                                price.foodmenupriceid ===
                                                                item.foodmenupriceid
                                                        ).foodmenuprice
                                                    ) *
                                                        item.quantity,
                                                0
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex flex-row justify-between items-center mt-4">
                                        <p className="text-sm text-gray-500">
                                            Delivery Fee
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            Php 50.00
                                        </p>
                                    </div>
                                    {/* Total */}
                                    <hr className="my-2 border-b-1 border-gray-300" />
                                    <div className="flex flex-row justify-between items-center mt-4">
                                        <p className="text-sm text-gray-500">
                                            Total
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            Php{" "}
                                            {cart.reduce(
                                                (total, item) =>
                                                    parseFloat(total) +
                                                    parseFloat(
                                                        foodPrices.find(
                                                            (price) =>
                                                                price.foodmenupriceid ===
                                                                item.foodmenupriceid
                                                        ).foodmenuprice
                                                    ) *
                                                        item.quantity,
                                                50
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex flex-col">
                                        <Link
                                            to="/cart"
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm mt-4 transition duration-150 ease-in-out text-center"
                                        >
                                            Cart
                                        </Link>
                                        <button
                                            className="text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm mt-2 transition duration-150 ease-in-out"
                                            onClick={submitOrder}
                                        >
                                            Checkout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Menu;
