CREATE DATABASE
-- @block
CREATE TABLE `Devices`(
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `DeviceName` VARCHAR(255) NOT NULL,
    `MacAddress` VARCHAR(255) NOT NULL UNIQUE,
    `CurrentLocal` VARCHAR(255) NULL
);
-- @block
CREATE TABLE `PingResults`(
    `pingID` INT PRIMARY KEY AUTO_INCREMENT,
    `deviceID` INT NOT NULL,
    `datetime` DATETIME NOT NULL,
    `pingMin` INT NOT NULL,
    `pingAvg` INT NOT NULL,
    `pingMax` INT NOT NULL,
    `pingStdDev` INT NOT NULL,
    `sTdown` INT NOT NULL,
    `sTup` INT NOT NULL,
    `sTping` INT NOT NULL,
    FOREIGN KEY (`deviceID`) REFERENCES `Devices`(`id`)
);
-- @block
CREATE TABLE `DeviceLogs`(
    `logID` INT PRIMARY KEY AUTO_INCREMENT,
    `deviceID` INT NOT NULL,
    `datetime` DATETIME NOT NULL,
    `latestPing` INT NOT NULL,
    `information` JSON NOT NULL,
    `logLocal` VARCHAR(255) NOT NULL,
    FOREIGN KEY(`deviceID`) REFERENCES `Devices`(`id`),
    FOREIGN KEY(`latestPing`) REFERENCES `PingResults`(`pingID`)
);
-- @block
SELECT * FROM Devices;