import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "../assets/logo.png";

const AddressModal = ({
    showModal,
    setShowModal,
    address,
    selectedAddress,
    setSelectedAddress,
}) => {
    const [page, setPage] = useState(1);

    const [selectedAddressID, setSelectedAddressID] = useState(
        selectedAddress.customeraddressid
    );

    const handleRadioChange = (event) => {
        setSelectedAddressID(event.target.value);
    };

    const handleButtonClick = () => {
        setSelectedAddress(
            address.find(
                (address) => address.customeraddressid === selectedAddressID
            )
        );
        setShowModal(!showModal);
    };

    // const [formData, setFormData] = useState({
    //     customerFullName: "",
    //     customerContactNumber: "",
    //     customerStreet: "",
    //     customerBarangay: "",
    //     customerCity: "",
    //     customerNotes: "",
    //     customerAddressLabel: "",
    //     customerAddressDefault: false,
    // });

    // const handleChange = (e) => {
    //     const { name, value, type, checked } = e.target;
    //     setFormData((prevData) => ({
    //         ...prevData,
    //         [name]: type === "checkbox" ? checked : value,
    //     }));
    // };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     // Handle form submission here, you can use 'formData' object
    //     console.log(formData);
    // };

    const [branchLocation, setBranchLocation] = useState([
        {
            branchLocationID: "1",
            branchLocationName: "Branch 1 Kumintang",
            branchLocationAddress: "Kumintang Ibaba, Batangas City",
            branchLatitude: 13.766224873302544,
            branchLongitude: 121.06486732044151,
        },
        {
            branchLocationID: "2",
            branchLocationName: "Branch 2 Bolbok",
            branchLocationAddress: "Bolbok, Batangas City",
            branchLatitude: 13.771171115187625,
            branchLongitude: 121.05076661683539,
        },
        {
            branchLocationID: "3",
            branchLocationName: "Branch 3 Santa Rita Karsada",
            branchLocationAddress: "Santa Rita Karsada, Batangas City",
            branchLatitude: 13.781140181635662,
            branchLongitude: 121.03468858511764,
        },
        {
            //13.822021628212276, 121.13323044145332
            branchLocationID: "4",
            branchLocationName: "Branch 4 Ibaan",
            branchLocationAddress: "Ibaan, Batangas",
            branchLatitude: 13.822021628212276,
            branchLongitude: 121.13323044145332,
        },
        {
            //13.904687270602212, 121.04878366984545
            branchLocationID: "5",
            branchLocationName: "Branch 5 Cuenca",
            branchLocationAddress: "Cuenca, Batangas",
            branchLatitude: 13.904687270602212,
            branchLongitude: 121.04878366984545,
        },
    ]);

    const [currentPosition, setCurrentPosition] = useState(null);
    const [draggable, setDraggable] = useState(false);
    const markerRef = useRef(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setPosition(marker.getLatLng());
                }
            },
        }),
        []
    );
    const toggleDraggable = useCallback(() => {
        setDraggable((d) => !d);
    }, []);

    useEffect(() => {
        //to get current location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition([latitude, longitude]);
            },
            (error) => {
                console.error("Error getting user location:", error);
            }
        );

        console.log(currentPosition);
    }, []);

    return (
        <div
            id="addressModal"
            tabIndex="-1"
            aria-hidden={showModal ? "true" : "false"}
            className={`fixed transform top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl p-4 overflow-x-hidden overflow-y-auto ${
                showModal ? "block" : "hidden"
            }`}
        >
            <div className="relative w-full max-w-2xl max-h-full">
                <div className="relative bg-white rounded-lg shadow">
                    <div className="flex items-start justify-between p-4 border-b rounded-t">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Address
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                            data-modal-hide="addressModal"
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
                    <div className="p-6 space-y-6 h-96  overflow-y-auto">
                        <div className="order-address-container">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                <FontAwesomeIcon
                                    icon={faLocationDot}
                                    className="mr-2"
                                />
                                Choose an address
                            </h3>
                            <ul className="flex flex-col space-y-4 border border-gray-200 rounded-lg p-4">
                                {address.map((address) => (
                                    <li key={address.customeraddressid}>
                                        <div className="order-address-body flex flex-col space-y-1 border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer w-full">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    value={
                                                        address.customeraddressid
                                                    }
                                                    name="address"
                                                    className="form-radio h-4 w-4 text-blue-500"
                                                    checked={
                                                        selectedAddressID ===
                                                        address.customeraddressid
                                                    } // Set checked directly here
                                                    onChange={handleRadioChange}
                                                />

                                                <div>
                                                    <div className="flex flex-row justify-between items-center space-x-2">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {
                                                                address.customerfullname
                                                            }
                                                        </p>
                                                        {address.customerAddressDefault ===
                                                        true ? (
                                                            <div className="border border-blue-500 p-1 bg-blue-100 text-[10px]">
                                                                default
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="flex flex-row justify-between items-center space-x-2">
                                                        <p className="text-sm text-gray-500">
                                                            {
                                                                address.customerstreet
                                                            }
                                                            ,{" "}
                                                            {
                                                                address.customerbarangay
                                                            }
                                                            ,{" "}
                                                            {
                                                                address.customercity
                                                            }
                                                        </p>
                                                        {address.customerAddressDefault ? (
                                                            <p className="text-gray-500 border border-blue-500 p-1 bg-blue-100 text-[10px]">
                                                                Default
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    <div className="flex flex-row justify-between items-center space-x-2">
                                                        <p className="text-sm text-gray-500">
                                                            {
                                                                address.customercontactnumber
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {
                                                                address.customeraddresslabel
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <button
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg px-5 py-2.5 text-center mt-4"
                                onClick={handleButtonClick}
                            >
                                Save Address
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;
