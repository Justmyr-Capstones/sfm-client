import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const Users = () => {
    useEffect(() => {
        //get role from local storage
        const role = localStorage.getItem("userRoleID");

        if (role !== "STF") {
            window.location.href = "/login";
        }
    }, []);

    const [search, setSearch] = useState(""); // Search input
    const [reload, setReload] = useState(false);

    const [admins, setAdmins] = useState([]);
    const [branches, setBranches] = useState([]);
    const [newAdmin, setNewAdmin] = useState({
        adminfirstname: "",
        adminlastname: "",
        adminemailaddress: "",
        adminpassword: "",
        admincontactnumber: "",
        userroleid: "ADM", // Assuming a default role ID of "ADM
        branchid: 1, // Assuming a default branch ID
        is_active: "active",
    });
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);

    const [showEditAdminModal, setShowEditAdminModal] = useState(false);

    const [updateAdmin, setUpdateAdmin] = useState({
        adminid: "",
        adminfirstname: "",
        adminlastname: "",
        adminemailaddress: "",
        adminpassword: "",
        admincontactnumber: "",
        is_active: "active",
    });

    const handleEditClick = (row) => {
        setShowEditAdminModal(true);
        setUpdateAdmin({
            adminid: row.adminid,
            adminfirstname: row.adminfirstname,
            adminlastname: row.adminlastname,
            adminemailaddress: row.adminemailaddress,
            adminpassword: row.adminpassword,
            admincontactnumber: row.admincontactnumber,
            is_active: row.is_active,
        });
    };

    const handleUpdateInputChange = (e) => {
        setUpdateAdmin({
            ...updateAdmin,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        Swal.fire({
            title: "Are you sure you want to update this admin?",
            showDenyButton: true,
            confirmButtonText: `Yes`,
            denyButtonText: `No`,
        }).then(async (result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                try {
                    const response = await fetch(
                        `https://sfm-api-production.up.railway.app/api/admin/`, // Assuming there's a route to update a specific admin by ID
                        {
                            method: "PATCH", // Use the appropriate HTTP method for updating
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(updateAdmin),
                        }
                    );
                    const data = await response.json();
                    console.log("Admin updated:", data);

                    setReload(true);
                } catch (error) {
                    console.error("Error updating admin:", error);
                }

                setShowEditAdminModal(false);
                Swal.fire("Updated!", "", "success");
            } else if (result.isDenied) {
                Swal.fire("Changes are not saved", "", "info");
            }
        });

        setShowEditAdminModal(false);
    };

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await fetch(
                    "https://sfm-api-production.up.railway.app/api/admin"
                );
                const data = await response.json();
                if (search !== "") {
                    setAdmins(
                        data.filter(
                            (admin) =>
                                admin.adminfirstname
                                    .toLowerCase()
                                    .includes(search.toLowerCase()) ||
                                admin.adminlastname
                                    .toLowerCase()
                                    .includes(search.toLowerCase())
                        )
                    );
                } else {
                    setAdmins(data);
                }
            } catch (error) {
                console.error("Error fetching admins:", error);
            }
        };

        const fetchBranches = async () => {
            try {
                const response = await fetch(
                    "https://sfm-api-production.up.railway.app/api/branch"
                );
                const data = await response.json();
                setBranches(data);
            } catch (error) {
                console.error("Error fetching branches:", error);
            }
        };

        fetchAdmins();
        fetchBranches();

        setReload(false);
    }, [reload, search]);

    const handleDeleteClick = (row) => {
        Swal.fire({
            title: "Are you sure you want to delete this admin?",
            showDenyButton: true,
            confirmButtonText: `Yes`,
            denyButtonText: `No`,
        }).then(async (result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                try {
                    const response = await fetch(
                        `https://sfm-api-production.up.railway.app/api/admin/delete/${row.adminid}`,
                        {
                            method: "DELETE",
                        }
                    );
                    const data = await response.json();
                    console.log("Admin deleted:", data);

                    setReload(true);
                } catch (error) {
                    console.error("Error deleting admin:", error);
                }

                Swal.fire("Deleted!", "", "success");
            } else if (result.isDenied) {
                Swal.fire("Changes are not saved", "", "info");
            }
        });
    };

    const columns = [
        {
            name: "ID",
            cell: (row) => <div className="w-15">{row.adminid}</div>,
            sortable: true,
        },
        {
            name: "Name",
            cell: (row) => (
                <div className="w-[10rem]">
                    {row.adminfirstname} {row.adminlastname}
                </div>
            ),
            // selector: (row) => row.adminfirstname + " " + row.adminlastname,
            sortable: true,
        },
        {
            name: "Email",
            cell: (row) => <div>{row.adminemailaddress}</div>,
            sortable: true,
        },
        {
            name: "Contact Number",
            cell: (row) => <div className="w-15">{row.admincontactnumber}</div>,
            selector: (row) => row.admincontactnumber,
            sortable: true,
        },
        // {
        //     name: "Branch",
        //     selector: (row) =>
        //         branches.length > 0 &&
        //         branches.find((b) => b.branchid === row.branchid).branchname,

        //     sortable: true,
        // },
        {
            name: "Status",
            cell: (row) => (
                <div
                    className={`w-15 border ${
                        row.is_active === "active"
                            ? "bg-green-500"
                            : "bg-red-500"
                    } text-white text-center rounded-lg px-2 py-1`}
                >
                    {row.is_active}
                </div>
            ),
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex w-15 justify-center border">
                    <button
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2 text-center"
                        type="button"
                        onClick={() => handleEditClick(row)}
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                        className="ms-3 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center"
                        type="button"
                        onClick={() => handleDeleteClick(row)}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            ),
        },
    ];

    const handleInputChange = (e) => {
        setNewAdmin({
            ...newAdmin,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        Swal.fire({
            title: "Are you sure you want to add this admin?",
            showDenyButton: true,
            confirmButtonText: `Yes`,
            denyButtonText: `No`,
        }).then(async (result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                try {
                    const response = await fetch(
                        "https://sfm-api-production.up.railway.app/api/admins",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(newAdmin),
                        }
                    );
                    const data = await response.json();
                    console.log("New admin added:", data);
                    setAdmins([...admins, data]); // Update the admin list with the new admin
                    setNewAdmin({
                        adminfirstname: "",
                        adminlastname: "",
                        adminemailaddress: "",
                        adminpassword: "",
                        admincontactnumber: "",
                        userroleid: 1, // Reset to default role ID
                        branchid: 1, // Reset to default branch ID
                    });
                    setShowAddAdminModal(false);
                } catch (error) {
                    console.error("Error adding new admin:", error);
                }
                Swal.fire("Added!", "", "success");
            } else if (result.isDenied) {
                Swal.fire("Changes are not saved", "", "info");
            }
        });
    };

    const handleInputClick = (e) => {
        e.stopPropagation();
    };

    return (
        <section>
            <Sidebar />
            <div className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-2xl font-semibold">Staffs</h2>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                id="search"
                                name="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mt-1 p-2.5 border border-gray-300 rounded-md w-72"
                                placeholder="Search"
                            />
                            <button
                                className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                type="button"
                                onClick={() => setShowAddAdminModal(true)}
                            >
                                Add Admin
                            </button>
                        </div>
                    </div>
                    <div className="box w-full overflow-auto rounded-lg border border-gray-200">
                        <DataTable
                            columns={columns}
                            data={admins}
                            pagination
                            highlightOnHover
                            responsive
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {showAddAdminModal && (
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
                    onClick={() => setShowAddAdminModal(false)}
                >
                    <div
                        className="bg-white p-6 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-semibold mb-4">
                            Add Admin
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="mb-4">
                                    <label
                                        htmlFor="adminfirstname"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="adminfirstname"
                                        name="adminfirstname"
                                        value={newAdmin.adminfirstname}
                                        onChange={handleInputChange}
                                        onClick={handleInputClick}
                                        className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="adminlastname"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="adminlastname"
                                        name="adminlastname"
                                        value={newAdmin.adminlastname}
                                        onChange={handleInputChange}
                                        onClick={handleInputClick}
                                        className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="mb-4">
                                    <label
                                        htmlFor="adminemailaddress"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="adminemailaddress"
                                        name="adminemailaddress"
                                        value={newAdmin.adminemailaddress}
                                        onChange={handleInputChange}
                                        onClick={handleInputClick}
                                        className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="adminpassword"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="adminpassword"
                                        name="adminpassword"
                                        value={newAdmin.adminpassword}
                                        onChange={handleInputChange}
                                        onClick={handleInputClick}
                                        className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="mb-4">
                                    <label
                                        htmlFor="admincontactnumber"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Contact Number
                                    </label>
                                    <input
                                        type="text"
                                        id="admincontactnumber"
                                        name="admincontactnumber"
                                        value={newAdmin.admincontactnumber}
                                        onChange={handleInputChange}
                                        onClick={handleInputClick}
                                        className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="branchid"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Branch
                                    </label>
                                    {/* Assuming a select input for branches */}
                                    <select
                                        id="branchid"
                                        name="branchid"
                                        value={newAdmin.branchid}
                                        onChange={handleInputChange}
                                        onClick={handleInputClick}
                                        className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                        required
                                    >
                                        {branches.map((branch) => (
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
                            <div className="flex items-center justify-end">
                                <button
                                    type="submit"
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                                    onClick={() => setShowAddAdminModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditAdminModal && (
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center w-full"
                    onClick={() => setShowEditAdminModal(false)}
                >
                    <div
                        className="bg-white p-6 rounded-lg w-1/3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-semibold mb-4">
                            Edit Admin
                        </h2>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="mb-4">
                                <label
                                    htmlFor="adminfirstname"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="adminfirstname"
                                    name="adminfirstname"
                                    value={updateAdmin.adminfirstname}
                                    onChange={handleUpdateInputChange}
                                    onClick={handleInputClick}
                                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="adminlastname"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="adminlastname"
                                    name="adminlastname"
                                    value={updateAdmin.adminlastname}
                                    onChange={handleUpdateInputChange}
                                    onClick={handleInputClick}
                                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="adminemailaddress"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="adminemailaddress"
                                    name="adminemailaddress"
                                    value={updateAdmin.adminemailaddress}
                                    onChange={handleUpdateInputChange}
                                    onClick={handleInputClick}
                                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                    required
                                />
                            </div>
                            {/* for active and inactive */}
                            <div className="mb-4">
                                <label
                                    htmlFor="is_active"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Status
                                </label>
                                <select
                                    id="is_active"
                                    name="is_active"
                                    value={updateAdmin.is_active}
                                    onChange={handleUpdateInputChange}
                                    onClick={handleInputClick}
                                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="admincontactnumber"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Contact Number
                                </label>
                                <input
                                    type="text"
                                    id="admincontactnumber"
                                    name="admincontactnumber"
                                    value={updateAdmin.admincontactnumber}
                                    onChange={handleUpdateInputChange}
                                    onClick={handleInputClick}
                                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-end">
                                <button
                                    type="submit"
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                                    onClick={() => setShowEditAdminModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Users;
