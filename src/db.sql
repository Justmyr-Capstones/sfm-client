-- Create database
CREATE DATABASE sfm;

-- Connect to the database
\c sfm;

-- Create customerTable
CREATE TABLE customerTable (
    customerID VARCHAR(20) PRIMARY KEY,
    customerFirstName VARCHAR(255),
    customerLastName VARCHAR(255),
    customerEmailAdress VARCHAR(255),
    customerPassword VARCHAR(255),
    customerContactNumber VARCHAR(255),
    userRoleID VARCHAR(20) REFERENCES userRoleTable(userRoleID)
);

-- Create customerAddressTable
CREATE TABLE customerAddressTable (
    customerAddressID VARCHAR(20) PRIMARY KEY,
    customerID VARCHAR(20) REFERENCES customerTable(customerID),
    customerFullName VARCHAR(255),
    customerContactNumber VARCHAR(255),
    customerStreet VARCHAR(255),
    customerBarangay VARCHAR(255),
    customerCity VARCHAR(255),
    customerNotes TEXT,
    customerAddressLabel VARCHAR(255),
    customerAddressDefault BOOLEAN,
    addressLatitude DECIMAL(10, 15), -- Assuming latitude is stored as decimal number
    addressLongitude DECIMAL(10, 15) -- Assuming longitude is stored as decimal number
);

-- Create branchTable
CREATE TABLE branchTable (
    branchID VARCHAR(20) PRIMARY KEY,
    branchName VARCHAR(255),
    branchLocationAddress VARCHAR(255),
    branchLatitude DECIMAL(10, 8),
    branchLongitude DECIMAL(11, 8)
);

-- Create productAvailabilityTable
CREATE TABLE productAvailabilityTable (
    availabilityID VARCHAR(20) PRIMARY KEY,
    branchID VARCHAR(20) REFERENCES branchTable(branchID),
    foodMenuID VARCHAR(20) REFERENCES foodMenuTable(foodMenuID),
    available BOOLEAN
);

-- Create foodMenuTable
CREATE TABLE foodMenuTable (
    foodMenuID VARCHAR(20) PRIMARY KEY,
    foodMenuName VARCHAR(255),
    foodMenuDescription TEXT,
    foodMenuCategory VARCHAR(255),
    foodMenuImage VARCHAR(255)
);

-- Create foodMenuPriceTable
CREATE TABLE foodMenuPriceTable (
    foodMenuPriceID VARCHAR(20) PRIMARY KEY,
    foodMenuID VARCHAR(20) REFERENCES foodMenuTable(foodMenuID),
    foodMenuPrice DECIMAL(10,2), -- Assuming prices are stored as decimal numbers
    foodMenuCutType VARCHAR(255)
);

-- Create customerOrderTable
CREATE TABLE customerOrderTable (
    customerOrderID VARCHAR(20) PRIMARY KEY,
    customerID VARCHAR(20) REFERENCES customerTable(customerID),
    customerAddressID VARCHAR(20) REFERENCES customerAddressTable(customerAddressID),
    customerOrderDate TIMESTAMP,
    customerOrderStatus VARCHAR(255),
    customerOrderTotalPrice DECIMAL(10,2), -- Assuming total price is stored as decimal number
    customerOrderPaymentMethod VARCHAR(255),
    customerOrderPaymentStatus VARCHAR(255),
    deliveryPersonID VARCHAR(20) REFERENCES deliveryPersonTable(deliveryPersonID)
);

-- Create customerOrderItemTable
CREATE TABLE customerOrderItemTable (
    customerOrderItemID VARCHAR(20) PRIMARY KEY,
    customerOrderID VARCHAR(20) REFERENCES customerOrderTable(customerOrderID),
    foodMenuID VARCHAR(20) REFERENCES foodMenuTable(foodMenuID),
    foodMenuPriceID VARCHAR(20) REFERENCES foodMenuPriceTable(foodMenuPriceID),
    customerOrderItemQuantity INT,
    customerOrderItemTotalPrice DECIMAL(10,2) -- Assuming total price is stored as decimal number
);

-- Create userRoleTable
CREATE TABLE userRoleTable (
    userRoleID VARCHAR(20) PRIMARY KEY,
    userRoleName VARCHAR(255)
);

-- Create adminTable
CREATE TABLE adminTable (
    adminID VARCHAR(20) PRIMARY KEY,
    adminFirstName VARCHAR(255),
    adminLastName VARCHAR(255),
    adminEmailAdress VARCHAR(255),
    adminPassword VARCHAR(255),
    adminContactNumber VARCHAR(255),
    userRoleID VARCHAR(20) REFERENCES userRoleTable(userRoleID),
    branchID VARCHAR(20) REFERENCES branchTable(branchID) -- Linking admin to a specific branch
);

-- Create deliveryPersonTable
CREATE TABLE deliveryPersonTable (
    deliveryPersonID VARCHAR(20) PRIMARY KEY,
    deliveryPersonFirstName VARCHAR(255),
    deliveryPersonLastName VARCHAR(255),
    deliveryPersonEmailAdress VARCHAR(255),
    deliveryPersonPassword VARCHAR(255),
    deliveryPersonContactNumber VARCHAR(255),
    userRoleID VARCHAR(20) REFERENCES userRoleTable(userRoleID),
    branchID VARCHAR(20) REFERENCES branchTable(branchID) -- Linking delivery person to a specific branch
);

-- Create cartTable
CREATE TABLE cartTable (
    cartID VARCHAR(20) PRIMARY KEY,
    customerID VARCHAR(20) REFERENCES customerTable(customerID),
    foodMenuID VARCHAR(20) REFERENCES foodMenuTable(foodMenuID),
    foodMenuPriceID VARCHAR(20) REFERENCES foodMenuPriceTable(foodMenuPriceID),
    quantity INT
);
