import React, { useEffect, useState } from "react";
import Logo from "../assets/img/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [customerID, setCustomerID] = useState(
        localStorage.getItem("userID")
    );

    const [userRoleID, setUserRoleID] = useState(
        localStorage.getItem("userRoleID")
    );

    const [customer, setCustomer] = useState({});

    useEffect(() => {
        if (customerID !== null) {
            const getCustomer = async () => {
                const response = await fetch(
                    `https://sfm-api-production.up.railway.app/api/customer/${customerID}`
                );

                if (response.ok) {
                    const data = await response.json();
                    setCustomer(data);
                    console.log(data); // Use data instead of customer
                }
            };

            getCustomer();
        }
    }, [customerID]);

    const [isNavOpen, setNavIsOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const handleNavbar = () => {
        setIsMenuOpen(false);
        setNavIsOpen(!isNavOpen);
    };

    const handleMenu = () => {
        setNavIsOpen(false);
        setIsMenuOpen(!isMenuOpen);
    };

    const handleCloseMenuOnOutsideClick = (event) => {
        // Check if the menu is open and if the click is outside the menu
        if (isMenuOpen && !event.target.closest("#user-menu-button")) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        // Add a global click event listener
        document.addEventListener("click", handleCloseMenuOnOutsideClick);

        // Clean up the event listener on component unmount
        return () => {
            document.removeEventListener(
                "click",
                handleCloseMenuOnOutsideClick
            );
        };
    }, [isMenuOpen]);

    window.addEventListener("scroll", () => {
        setIsScrolled(window.scrollY > 100);
    });

    const links = [
        {
            name: "Home",
            url: "/",
        },
        {
            name: "Menu",
            url: "/menu",
        },
        {
            name: "About",
            url: "/#about",
        },
        {
            name: "Contact Us",
            url: "/#contact",
        },
    ];
    return (
        <nav
            className="bg-red-600 sticky top-0 z-50"
            style={{
                transition: "padding 0.5s ease-in-out",
                padding: isScrolled ? "0.35rem 0" : "0.5rem 0",
            }}
        >
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <button
                            type="button"
                            className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-yellow-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded={isNavOpen}
                            onClick={handleNavbar}
                        >
                            <span className="absolute -inset-0.5"></span>
                            <span className="sr-only">Open main menu</span>

                            <svg
                                className="block h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
                            </svg>

                            <svg
                                className="hidden h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex flex-shrink-0 items-center">
                            <Link
                                to="/home"
                                className="flex items-center navbrand"
                            >
                                <img
                                    className="h-8 w-auto mr-3"
                                    src={Logo}
                                    alt="Santa Fe Taguktukan Logo"
                                />
                                <h1 className="text-white font-black text-3xl text-yellow-300 outline-black text-stroke hidden sm:block">
                                    Santa Fe Taguktukan
                                </h1>
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-1">
                                <a
                                    href="/#home"
                                    className={
                                        "text-white hover:bg-yellow-400 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition duration-100 ease-in-out"
                                    }
                                >
                                    Home
                                </a>
                                <Link
                                    to="/menu"
                                    className={
                                        "text-white hover:bg-yellow-400 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition duration-100 ease-in-out"
                                    }
                                >
                                    Menu
                                </Link>
                                <a
                                    href="/#about"
                                    className={
                                        "text-white hover:bg-yellow-400 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition duration-100 ease-in-out"
                                    }
                                >
                                    About
                                </a>
                                <a
                                    href="/#services"
                                    className={
                                        "text-white hover:bg-yellow-400 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition duration-100 ease-in-out"
                                    }
                                >
                                    Services
                                </a>
                                <a
                                    href="/#contact"
                                    className={
                                        "text-white hover:bg-yellow-400 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition duration-100 ease-in-out"
                                    }
                                >
                                    Contact
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-y-0 right-0 gap-2 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        {customerID && userRoleID === "CUS" ? (
                            <div className="relative ml-3">
                                <div>
                                    <button
                                        type="button"
                                        className="relative flex rounded-full bg-none text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                        id="user-menu-button"
                                        aria-expanded="false"
                                        aria-haspopup="true"
                                        onClick={handleMenu}
                                    >
                                        <span className="absolute -inset-1.5"></span>
                                        <span className="sr-only">
                                            Open user menu
                                        </span>
                                        <div className="flex items-center justify-center text-white gap-2 px-3 py-2">
                                            <FontAwesomeIcon
                                                icon={faUser}
                                                size="lg"
                                                className="text-white"
                                            />
                                            {customer.customerfirstname}
                                        </div>
                                    </button>
                                </div>
                                <div
                                    className={`absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
                                        isMenuOpen ? "block" : "hidden"
                                    }`}
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="user-menu-button"
                                    tabIndex="-1"
                                >
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700"
                                        role="menuitem"
                                        tabIndex="-1"
                                        id="user-menu-item-1"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/orderhistory"
                                        className="block px-4 py-2 text-sm text-gray-700"
                                        role="menuitem"
                                        tabIndex="-1"
                                        id="user-menu-item-1"
                                    >
                                        Order History
                                    </Link>
                                    <Link
                                        to="/addressbook"
                                        className="block px-4 py-2 text-sm text-gray-700"
                                        role="menuitem"
                                        tabIndex="-1"
                                        id="user-menu-item-1"
                                    >
                                        Address Book
                                    </Link>
                                    <hr />
                                    <p
                                        className="block px-4 py-2 text-sm text-gray-700"
                                        role="menuitem"
                                        tabIndex="-1"
                                        id="user-menu-item-2"
                                        onClick={() => {
                                            localStorage.clear();
                                            window.location.href = "/";
                                        }}
                                        style={{ cursor: "pointer" }}
                                    >
                                        Log out
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-yellow-400 text-white block rounded-md px-3 py-2 text-base font-medium hover:bg-yellow-400"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div id="mobile-menu" className={isNavOpen ? "block" : "hidden"}>
                <div className="space-y-1 px-2 pb-3 pt-2">
                    <Link
                        to="/home"
                        className="bg-yellow-400 text-white block rounded-md px-3 py-2 text-base font-medium hover:bg-yellow-400"
                        aria-current="page"
                    >
                        Home
                    </Link>
                    <Link
                        to="/menu"
                        className="text-white hover:bg-yellow-400 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                    >
                        Menu
                    </Link>
                    <Link
                        to="/about"
                        className="text-white hover:bg-yellow-400 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                    >
                        About
                    </Link>
                    <Link
                        to="/contact"
                        className="text-white hover:bg-yellow-400 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                    >
                        Contact
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
