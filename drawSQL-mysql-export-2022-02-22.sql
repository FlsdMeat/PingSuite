CREATE TABLE `Devices`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `DeviceName` VARCHAR(255) NOT NULL,
    `MacAddress` VARCHAR(255) NOT NULL,
    `CurrentLocal` VARCHAR(255) NULL
);
ALTER TABLE
    `Devices` ADD PRIMARY KEY `devices_id_primary`(`id`);
ALTER TABLE
    `Devices` ADD UNIQUE `devices_macaddress_unique`(`MacAddress`);
CREATE TABLE `PingResults`(
    `pingID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `deviceID` INT NOT NULL,
    `datetime` DATETIME NOT NULL,
    `pingMin` DECIMAL(8, 2) NOT NULL,
    `pingAvg` DECIMAL(8, 2) NOT NULL,
    `pingMax` DECIMAL(8, 2) NOT NULL,
    `pingStdDev` DECIMAL(8, 2) NOT NULL,
    `sTdown` DECIMAL(8, 2) NOT NULL,
    `sTup` DECIMAL(8, 2) NOT NULL,
    `sTping` DECIMAL(8, 2) NOT NULL
);
ALTER TABLE
    `PingResults` ADD PRIMARY KEY `pingresults_pingid_primary`(`pingID`);
CREATE TABLE `DeviceLogs`(
    `logID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `deviceID` INT NOT NULL,
    `datetime` DATETIME NOT NULL,
    `latestPing` INT NOT NULL,
    `information` JSON NOT NULL,
    `logLocal` VARCHAR(255) NOT NULL
);
ALTER TABLE
    `DeviceLogs` ADD PRIMARY KEY `devicelogs_logid_primary`(`logID`);
ALTER TABLE
    `DeviceLogs` ADD CONSTRAINT `devicelogs_deviceid_foreign` FOREIGN KEY(`deviceID`) REFERENCES `Devices`(`id`);
ALTER TABLE
    `PingResults` ADD CONSTRAINT `pingresults_deviceid_foreign` FOREIGN KEY(`deviceID`) REFERENCES `Devices`(`id`);
ALTER TABLE
    `DeviceLogs` ADD CONSTRAINT `devicelogs_latestping_foreign` FOREIGN KEY(`latestPing`) REFERENCES `PingResults`(`pingID`);