CREATE DATABASE `online_market_db`;
 
drop database `online_market_db`;
USE `online_market_db`;
 
 

DROP TABLE `Products`;
CREATE TABLE Users (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL CHECK (LENGTH(FirstName)>=3),
    lastname VARCHAR(50) NOT NULL CHECK (LENGTH(LastName)>=3),
    email VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(100) NOT NULL CHECK (LENGTH(`Password`)>=6),
    nickname VARCHAR(50) NOT NULL CHECK (LENGTH(NickName)>=3),
    addressLine1 VARCHAR(255) CHECK (LENGTH(addressLine1)>=10),
    addressLine2 VARCHAR(255) CHECK (LENGTH(addressLine2)>=10),
    postalCode INT,
    address VARCHAR(255) NOT NULL CHECK (LENGTH(Address)>=10),
    contactnumber VARCHAR(15) NOT NULL CHECK (LENGTH(ContactNumber)>=10 AND ContactNumber LIKE '9%'),
    photo BLOB,
    dateofbirth DATE NOT NULL,
    userrole ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    emailverification BOOLEAN NOT NULL DEFAULT FALSE,
    isactive BOOLEAN NOT NULL DEFAULT FALSE,
    addedon TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedon TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE Products (
    productid INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE CHECK (LENGTH(`Name`)>=5),
    `description` VARCHAR(255) NOT NULL CHECK (LENGTH(`Description`)>=50),
    image_url VARCHAR(255),
    isactive BOOLEAN NOT NULL DEFAULT TRUE,
    addedon TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedon TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE ProductSubscriptions (
    subscriptionid INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    productid INT NOT NULL,
    optin BOOLEAN NOT NULL,
    addedon TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedon TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES Users(userid) ON DELETE CASCADE,
    FOREIGN KEY (productid) REFERENCES Products(productid) ON DELETE CASCADE
);
CREATE TABLE ReviewsAndRatings (
    ratingid INT PRIMARY KEY,
    userid INT NOT NULL,
    productid INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    review TEXT NOT NULL CHECK (LENGTH(Review) >= 100),
    isactive BOOLEAN NOT NULL DEFAULT TRUE,
    addedon TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedon TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES Users(userid) ON DELETE CASCADE,
    FOREIGN KEY (productid) REFERENCES Products(productid) ON DELETE CASCADE
);
CREATE VIEW product_subscription_and_ratings_view AS
SELECT
    p.productid,
    p.name,
    p.description,
    p.image_url,
    p.isactive,
    p.addedon,
    p.updatedon,
    ROUND(COALESCE(rr.avg_rating, 0), 1) AS avg_rating,
    COALESCE(ps.subscription_count, 0) AS subscription_count
FROM products p
LEFT JOIN (
    SELECT
        productid,
        AVG(rating) AS avg_rating
    FROM reviewsandratings
    WHERE isactive = 1
    GROUP BY productid
) rr ON rr.productid = p.productid
LEFT JOIN (
    SELECT
        productid,
        COUNT(subscriptionid) AS subscription_count
    FROM productsubscriptions
    WHERE optin = 1
    GROUP BY productid
) ps ON ps.productid = p.productid;
set foreign_key_checks =0;
set foreign_key_checks =1;
select * from users;
select * from products;
truncate table products;
 drop table products;