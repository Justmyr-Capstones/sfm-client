import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Address from "./pages/Address";
import Dashboard from "./pages/Dashboard";
import Customer from "./pages/Customer";
import Foods from "./pages/Foods";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Orders from "./pages/Orders";
import Riders from "./pages/Riders";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Branch from "./pages/Branch";
import Admin from "./pages/Admin";
import OrderHIstory from "./pages/OrderHIstory";
import ForgotPassword from "./pages/forgotpassword";
import AddressBooks from "./pages/AddressBooks";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" exact element={<Home />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/address" element={<Address />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/customer" element={<Customer />} />
                    <Route path="/food" element={<Foods />} />
                    <Route path="/order" element={<Orders />} />
                    <Route path="/records" element={<div>Records</div>} />
                    <Route path="/delivery" element={<div>Delivery</div>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/riders" element={<Riders />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/branch" element={<Branch />} />
                    <Route path="/staff" element={<Admin />} />
                    <Route path="/orderhistory" element={<OrderHIstory />} />
                    <Route path="/addressbook" element={<AddressBooks />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
