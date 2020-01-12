CREATE DATABASE dbusers;
USE dbusers;
CREATE TABLE IF NOT EXISTS users_table(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL
);


alter user 'root'@'localhost' identified with mysql_native_password by 'root';

CREATE TABLE IF NOT EXISTS users_images(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    image_path VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    user_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS images_comments(
    id INT NOT NULL PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    FOREIGN KEY(id) REFERENCES users_images(id)
);