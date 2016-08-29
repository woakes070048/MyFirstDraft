CREATE DATABASE profiles_db;

USE profiles_db;

CREATE TABLE users(
    id int NOT NULL AUTO_INCREMENT,
    first_name varchar(255),
    last_name varchar(255),
    photo varchar(255),
    email varchar(255),
    phone_number varchar(255),
    college_university varchar(255),
    genre varchar(255),
    PRIMARY KEY (id)
);

CREATE TABLE drafts(
 
);

CREATE TABLE comments(

);

CREATE TABLE `users_table` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `username` (`username`)
);