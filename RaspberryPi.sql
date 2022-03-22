
-- @block
CREATE TABLE `Devices`(
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `DeviceName` VARCHAR(255) NOT NULL,
    `MacAddress` VARCHAR(255) NOT NULL UNIQUE,
    `CurrentLocal` VARCHAR(255) NULL,
    `ipAddr` VARCHAR(15) NOT NULL
);
-- @block
CREATE TABLE `PingResults`(
    `pingID` INT PRIMARY KEY AUTO_INCREMENT,
    `deviceID` INT NOT NULL,
    `datetime` DATETIME NOT NULL,
    `building` VARCHAR(255) NOT NULL,
    `pingMin` DECIMAL(7,6) NOT NULL,
    `pingAvg` DECIMAL(7,6) NOT NULL,
    `pingMax` DECIMAL(7,6) NOT NULL,
    `pingStdDev` DECIMAL(10,5) NOT NULL,
    `sTdown` DECIMAL(9,7) NOT NULL,
    `sTup`  DECIMAL(9,7) NOT NULL,
    `sTping`  DECIMAL(10,5) NOT NULL,
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
-- @BLOCK
ALTER TABLE PingResults MODIFY COLUMN `sTping` DECIMAL(4,3) NOT NULL;
-- @block
SELECT * FROM Devices;
-- @block
SELECT * FROM PingResults;

-- @BLOCK
INSERT INTO PingResults (deviceID, datetime, pingMin, pingAvg, pingMax, pingLoss, pingStdDev, sTdown,sTup,sTping) 
VALUES (1, '2022-03-03 18:44:1', 7.417, 46.287, 116.276, '0%', 35.8515, 253780845, 239892515, 13.454);

-- @BLOCK
CREATE VIEW `PingResultsView` AS
SELECT t1.DeviceName, t1.ipAddr, t1.MacAddress, t2.* 
FROM PingResults t2 JOIN Devices t1 ON t2.deviceID = t1.id;

-- @BLOCK
DROP VIEW PingResultsView;

-- @BLOCK
SELECT * FROM PingResultsView;