import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
} from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "../assets/logo.png";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
const Address = ({}) => {
    const [formData, setFormData] = useState({
        customerFullName: "",
        customerContactNumber: "",
        customerStreet: "",
        customerBarangay: "",
        customerCity: "",
        customerNotes: "",
        customerAddressLabel: "",
        customerAddressDefault: false,
    });

    const [position, setPosition] = useState({
        lat: null,
        lng: null,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newAddress = {
            customerID: localStorage.getItem("userID"),
            customerFullName: formData.customerFullName,
            customerContactNumber: formData.customerContactNumber,
            customerStreet: formData.customerStreet,
            customerBarangay: formData.customerBarangay,
            customerCity: formData.customerCity,
            customerNotes: formData.customerNotes,
            customerAddressLabel: formData.customerAddressLabel,
            customerAddressDefault: formData.customerAddressDefault,
            addressLatitude: position.lat,
            addressLongitude: position.lng,
        };

        console.log(newAddress);

        //confirm
        const confirmed = await Swal.fire({
            icon: "question",
            title: "Are you sure?",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
        });

        if (confirmed.isConfirmed) {
            const response = await fetch(
                "https://sfm-api-production.up.railway.app/api/address/add",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newAddress),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to add address");
            }
        }
    };

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
                    setCurrentPosition([
                        marker.getLatLng().lat,
                        marker.getLatLng().lng,
                    ]);

                    console.log(marker.getLatLng());
                }
            },
        }),
        []
    );
    const toggleDraggable = useCallback(() => {
        setDraggable((d) => !d);
    }, []);

    useEffect(() => {
        if (
            formData.customerStreet !== "" &&
            formData.customerBarangay !== "" &&
            formData.customerCity !== ""
        ) {
            const address = `${formData.customerStreet}, ${formData.customerBarangay}, ${formData.customerCity}`;
            fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
            )
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    if (data.length > 0) {
                        setCurrentPosition([data[0].lat, data[0].lon]);
                    }
                });
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition([latitude, longitude]);
                },
                (error) => {
                    console.error("Error getting user location:", error);
                }
            );
        }
        console.log(formData);
    }, [formData]);

    useEffect(() => {
        if (currentPosition) {
            setPosition({
                lat: currentPosition[0],
                lng: currentPosition[1],
            });
        }
        console.log(position);
    }, [currentPosition]);

    const [customerID, setCustomerID] = useState(
        localStorage.getItem("userID")
    );

    return (
        <>
            <Navbar />
            <section className="address bg-white py-8">
                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 h-full">
                    <div className="flex flex-row h-full justify-center items-center">
                        <form onSubmit={handleSubmit} className="w-[50%]">
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-500"
                                    id="customerFullName"
                                    name="customerFullName"
                                    placeholder="Full Name"
                                    value={formData.customerFullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-500"
                                    id="customerContactNumber"
                                    name="customerContactNumber"
                                    placeholder="Contact Number"
                                    value={formData.customerContactNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-500"
                                    id="customerStreet"
                                    name="customerStreet"
                                    placeholder="Street"
                                    value={formData.customerStreet}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-500"
                                    id="customerBarangay"
                                    name="customerBarangay"
                                    placeholder="Barangay"
                                    value={formData.customerBarangay}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-500"
                                    id="customerCity"
                                    name="customerCity"
                                    placeholder="City"
                                    value={formData.customerCity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group mb-3">
                                <textarea
                                    className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-500"
                                    id="customerNotes"
                                    name="customerNotes"
                                    placeholder="Notes"
                                    value={formData.customerNotes}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-500"
                                    id="customerAddressLabel"
                                    name="customerAddressLabel"
                                    placeholder="Address Label"
                                    value={formData.customerAddressLabel}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group mb-3">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-500"
                                        id="customerAddressDefault"
                                        name="customerAddressDefault"
                                        checked={
                                            formData.customerAddressDefault
                                        }
                                        onChange={handleChange}
                                    />
                                    <span className="text-sm text-gray-900">
                                        Default Address
                                    </span>
                                </label>
                            </div>
                            <hr className="my-4" />
                            <h1 className="text-base font-medium">
                                Select and drag marker to your exact location on
                                the map below.
                            </h1>
                            <div className="map">
                                {currentPosition && (
                                    <MapContainer
                                        center={currentPosition}
                                        zoom={12}
                                        scrollWheelZoom={true}
                                        style={{
                                            height: "500px",
                                            width: "100%",
                                        }}
                                        icon={
                                            new L.Icon({
                                                iconUrl: markerIcon,
                                                iconSize: [25, 25],
                                            })
                                        }
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker
                                            position={currentPosition}
                                            draggable={draggable}
                                            eventHandlers={eventHandlers}
                                            ref={markerRef}
                                        >
                                            <Popup>
                                                <span onClick={toggleDraggable}>
                                                    {draggable
                                                        ? "Marker is draggable"
                                                        : "Click here to make marker draggable"}
                                                </span>
                                            </Popup>
                                        </Marker>
                                        {branchLocation.map((branch) => (
                                            <Marker
                                                key={branch.branchLocationID}
                                                position={[
                                                    branch.branchLatitude,
                                                    branch.branchLongitude,
                                                ]}
                                                icon={
                                                    new L.Icon({
                                                        iconUrl: markerIcon,
                                                        iconSize: [25, 25],
                                                    })
                                                }
                                            >
                                                <Popup>
                                                    {branch.branchLocationName}
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                )}
                            </div>

                            <div className="input-group mb-3">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                                >
                                    Save Address
                                </button>
                                <Link to="/menu" />
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Address;
