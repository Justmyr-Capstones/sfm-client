import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DataTable from "react-data-table-component";
import AddRiderModal from "../components/AddRiderModal";

const Riders = () => {
    const [reload, setReload] = useState(false); // Used to reload the data table after a change has been made to the database
    const [riders, setRiders] = useState([]);

    const columns = [
        // CREATE TABLE deliveryPersonTable (
        //     deliveryPersonID VARCHAR(20) PRIMARY KEY,
        //     deliveryPersonFirstName VARCHAR(255),
        //     deliveryPersonLastName VARCHAR(255),
        //     deliveryPersonEmailAdress VARCHAR(255),
        //     deliveryPersonPassword VARCHAR(255),
        //     deliveryPersonContactNumber VARCHAR(255),
        //     userRoleID VARCHAR(20) REFERENCES userRoleTable(userRoleID),
        //     branchID VARCHAR(20) REFERENCES branchTable(branchID) -- Linking delivery person to a specific branch
        // );
        {
            name: "ID",
            selector: (row) => row.deliverypersonid, // row is a row of data, and selector is the field to be displayed
            sortable: true,
        },
        {
            name: "First Name",
            selector: (row) => row.deliverypersonfirstname, // row is a row of data, and selector is the field to be displayed
            sortable: true,
        },
        {
            name: "Last Name",
            selector: (row) => row.deliverypersonlastname, // row is a row of data, and selector is the field to be displayed
            sortable: true,
        },
        {
            name: "Email",
            selector: (row) => row.deliverypersonemailadress, // row is a row of data, and selector is the field to be displayed
            sortable: true,
        },
        {
            name: "Contact Number",
            selector: (row) => row.deliverypersoncontactnumber, // row is a row of data, and selector is the field to be displayed
            sortable: true,
        },
        {
            name: "Branch",
            selector: (
                row //find bracn name from branch table
            ) => {
                let branchName = "";
                branch.forEach((branch) => {
                    if (row.branchid === branch.branchid) {
                        branchName = branch.branchname;
                    }
                });
                return branchName;
            },
            sortable: true,
        },
    ];

    const [branch, setBranch] = useState([]);

    const [showAddRiderModal, setShowAddRiderModal] = useState(false);

    useEffect(() => {
        const getRiders = async () => {
            const response = await fetch(
                "https://sfm-dbcc0a8f87a3.herokuapp.com/api/rider",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await response.json();
            setRiders(data);
        };
        getRiders();
        setReload(false);
        const getBranch = async () => {
            const response = await fetch(
                "https://sfm-dbcc0a8f87a3.herokuapp.com/api/branch",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await response.json();
            setBranch(data);
        };
        getBranch();
    }, [reload]);

    useEffect(() => {
        if (localStorage.getItem("userID") === null) {
            //if the user is not logged in, redirect to login page
            window.location.href = "/login";
        } else {
            if (localStorage.getItem("userRoleID") !== "ADM") {
                //if the user is not a customer, redirect to login page
                window.location.href = "/menu";
            }
        }
    }, []);

    return (
        <section>
            <Sidebar />
            <div className="p-4 sm:ml-64">
                <div className="flex justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Riders</h2>
                </div>
                <button
                    data-modal-target="add-rider-modal"
                    data-modal-toggle="add-rider-modal"
                    class="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    type="button"
                    onClick={() => setShowAddRiderModal(true)}
                >
                    Add Rider
                </button>
                <div className="mt-8 border border-gray-200 rounded-lg">
                    <DataTable
                        columns={columns}
                        data={riders}
                        pagination
                        highlightOnHover
                        striped
                        dense
                    />
                </div>
            </div>
            {showAddRiderModal ? (
                <AddRiderModal
                    showModal={showAddRiderModal}
                    setShowModal={setShowAddRiderModal}
                    setReload={setReload}
                />
            ) : null}
        </section>
    );
};

export default Riders;
