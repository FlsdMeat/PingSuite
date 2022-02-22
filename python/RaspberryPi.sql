SELECT * FROM PingResults;
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
    `pingMin` DECIMAL(7,6) NOT NULL,
    `pingAvg` DECIMAL(7,6) NOT NULL,
    `pingMax` DECIMAL(7,6) NOT NULL,
    `pingStdDev` DECIMAL(10,5) NOT NULL,
    `sTdown` DECIMAL(9,7) NOT NULL,
    `sTup`  DECIMAL(9,7) NOT NULL,
    `sTping`  DECIMAL(4,3) NOT NULL,
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