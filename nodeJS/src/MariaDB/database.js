//Used for .env enviornment file
require('dotenv').config()
//Used for propper logging
const { databaseLog, saveResults } = require('../logging.js')
//MariaDB api
const mariadb = require('mariadb')
//MariaDB variable creation
let pool;
//Asks .env file if its production or not, needed for development
if(process.env.NODE_ENV == 'production'){
    pool = mariadb.createPool({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PW,
        database:process.env.DB_DATABASE,
        port:process.env.DB_PORT,
        connectionLimit:4
    })
} else {
    pool = mariadb.createPool({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PW,
        database:process.env.DB_DATABASE,
        port:process.env.DB_PORT,
        connectionLimit:4
    })
}

async function setup(){
    let db, res;
    db = await pool.getConnection();
    try {
        res = await db.query(
            `SELECT * FROM Devices;`
        )
        delete res[`meta`]
        db.end();
        return res
    } catch (error) {
        databaseLog(`Error with getPingResults`,error)
        db.end();
        return false
    }
}

//returns specific date formats
function date(dateType, ){
    let date_time = new Date();
    let date = ("0" + date_time.getDate()).slice(-2);
    let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
    let year = date_time.getFullYear();
    let hours = date_time.getHours();
    let minutes = date_time.getMinutes();
    let seconds = date_time.getSeconds();
    //returns dates like 2022-02-30
    if (dateType === 'date'){
        return `${year}-${month}-${date}`;
    } else if (dateType === 'time'){
        return `${hours}:${minutes}:${seconds}`;  //returns times like 04:28:56
    } else {
        databaseLog(`[DateTime]: Type not specified`, `[DateTime]: Type not specified: ${dateType}`)
    }
}

async function checkDevice(db, mac, deviceName, ipAddr){  //Checks if a device exists in the database, if adds it, then will return device specs
    let res = '';
    try {
        res = await db.query(
            `SELECT IF(
                EXISTS(
                    SELECT id FROM Devices WHERE MacAddress = '${mac}'),
                (SELECT id FROM Devices WHERE MacAddress = '${mac}'), false) AS Result;
            `
        )
        if(res[0]['Result'] == false){
            res = await db.query(
                `INSERT INTO Devices (DeviceName, MacAddress, ipAddr)
                VALUES ('${deviceName}','${mac}', '${ipAddr}')`)
            
        } else if(res[0]['Result']['ipAddr'] !== ipAddr || res[0]['Result']['DeviceName'] !== deviceName){
            res = await db.query(
                `UPDATE Devices SET ipAddr = '${ipAddr}', DeviceName = '${deviceName}' WHERE MacAddress = '${mac}';`
            )
        }
        res = await db.query(
            `SELECT id FROM Devices WHERE MacAddress = '${mac}';`
        )
        console.log(res)
        return res[0]
    } catch (error) {
        databaseLog(`Error with checkingDevice`,error)
        return false
    }
}

async function uploadSpeedTest(speedTest, pingTest, mac, deviceName, ipAddr){ //Uploads the tests, adds the building from the ip
    let ipLocal = {
        1:'Harugari Hall',2:'South Campus Hall',3:'1124 Campbell Ave',4:'Kaplan Hall',5:'Dodds Hall', 6:'Bethel Hall',7:'Gate House', 8:'Campus Store / UNH PD', 9:'Bartels Hall', 10:'Buckman Hall / Utility Building',
        11:'Peterson Library', 12:'Maxcy Hall', 13:'Bayer Hall', 14:'Bartels Student Activity Center', 15:'Dunham Hall', 16:'Sheffield Hall', 17:'Winchester Hall', 18:'Arbeiter Maenner Chor', 19:'North Campus - House', 
        20:'Echlin Hall',21:'North Campus - Gym',22: 'Dental Hygiene Clinic',23: 'Gerber Hall',24:'Bixler Hall',25:'Celentano Hall',26:'Football Field',27:'Bergami Hall',28:'Subway Building',29: '15 Ruden Dorm',
        30:'19 Ruden Dorm',31:'21 Ruden Dorm',32:'Rec Center',33:'1132 Campbell Avenue',34:'1136 Campbell Avenue',35:'Lee Institute',36:'46 Ruden Street',37:'1076 Campbell Avenue',38:'North Hall',39:'Westside Hall',
        40:'No Data',41:'32 Hoffman Street',42:'One Care Lane',43:'92 Ruden Street (future?)',44:'Bergami Innovation Center',45:'45 Alling St (UNH 41)',46:'Charger Plaza',47:'Church (University hall)',48:'16 Rockview Street',
        49:'Lighting Quotient 114 Route 1',50:'Orange Campus',51:'No Data',52:'SEC',53:'Lyme Academy',54:'Parkview',55:'NO BUILDING',56:'3 Chauncy',60:'600 Saw Mill Road',61:'Atwood',62:'Branford',63:'MainStreetCondosBusiness',
        100:'Wireless Routers', 101:'Echlin Voice',102:'CFA'
    }
    let db, res;
    db = await pool.getConnection();
    let deviceCheck = await checkDevice(db, mac, deviceName, ipAddr)
    let building = ipLocal[parseInt(ipAddr.split('.')[2])]
    if(deviceCheck){
        try {
            res = await db.query(
                `INSERT INTO PingResults (deviceID, datetime, building, pingMin, pingAvg, pingLoss, pingMax, pingStdDev, sTdown,sTup,sTping) 
                VALUES (${deviceCheck.id}, '${date('date')} ${date('time')}', '${building}', ${pingTest['min']}, ${pingTest['avg']}, '${pingTest['loss']}', ${pingTest['max']}, ${(pingTest['stddev']).toFixed(4)}, ${Math.trunc(speedTest['download'])}, ${Math.trunc(speedTest['upload'])}, ${(speedTest['ping']).toFixed(2)})`
            )
            let res2 = await db.query(
                `UPDATE Devices SET LastReport = '${date('date')} ${date('time')}', CurrentLocal = '${building}' WHERE id = ${deviceCheck.id}`
            )
            delete res['meta']
            databaseLog(`${deviceName} latest ping was delievered to the database!`)
            res = await db.query(
                `SELECT pingCount, pingTime from deviceSettings WHERE deviceID = ${deviceCheck.id}`
            )
            db.end()
            return res[0]
        } catch (error) {
            db.end()
            databaseLog(`Error with uploadSpeedTest`,error)
            saveResults(`INSERT INTO PingResults (deviceID, datetime, building, pingMin, pingAvg, pingLoss, pingMax, pingStdDev, sTdown,sTup,sTping) 
            VALUES (${deviceCheck.id}, '${date('date')} ${date('time')}', '${building}', ${pingTest['min']}, ${pingTest['avg']}, '${pingTest['loss']}', ${pingTest['max']}, ${(pingTest['stddev']).toFixed(4)}, ${Math.trunc(speedTest['download'])}, ${Math.trunc(speedTest['upload'])}, ${(speedTest['ping']).toFixed(2)})`)
            return false
        }
    }
    db.end();
}

async function getPingResults(){ //Returns the pingTests from the database
    let db, res;
    db = await pool.getConnection();
    try {
        res = await db.query(
            `SELECT * FROM PingResultsView;`
        )
        delete res[`meta`]
        db.end();
        return res
    } catch (error) {
        databaseLog(`Error with getPingResults`,error)
        db.end();
        return false
    }
}

async function getCurrentDeviceDetails(){ //Returns device specific details

    let db, res;
    db = await pool.getConnection();
    try {
        res = await db.query(
            `SELECT * FROM Devices;`
        )
        delete res[`meta`]
        db.end();
        return res
    } catch (error) {
        databaseLog(`Error with getPingResults`,error)
        db.end();
        return false
    }
}

async function setup(){
    let db, res;
    db = await pool.getConnection();
    try {
        res = await db.query(
            "CREATE TABLE IF NOT EXISTS `Devices`( "+
                "`id` INT PRIMARY KEY AUTO_INCREMENT,"+
                "`DeviceName` VARCHAR(255) NOT NULL,"+
                "`MacAddress` VARCHAR(255) NOT NULL UNIQUE,"+
                "`CurrentLocal` VARCHAR(255) NULL,"+
                "`LastReport` DATE NULL,"+
                "`ipAddr` VARCHAR(15) NOT NULL);")
        res = await db.query(
            "CREATE TABLE IF NOT EXISTS `PingResults`("+
                "`pingID` INT PRIMARY KEY AUTO_INCREMENT,"+
                "`deviceID` INT NOT NULL,"+
                "`datetime` DATETIME NOT NULL,"+
                "`building` VARCHAR(255) NOT NULL,"+
                "`pingMin` DECIMAL(7,6) NOT NULL,"+
                "`pingAvg` DECIMAL(7,6) NOT NULL,"+
                "`pingMax` DECIMAL(10,6) NOT NULL,"+
                "`pingStdDev` DECIMAL(10,5) NOT NULL,"+
                "`sTdown` DECIMAL(9,7) NOT NULL,"+
                "`sTup`  DECIMAL(9,7) NOT NULL,"+
                "`sTping`  DECIMAL(10,5) NOT NULL,"+
                "FOREIGN KEY (`deviceID`) REFERENCES `Devices`(`id`));")
        res = await db.query(
            "CREATE TABLE IF NOT EXISTS `DeviceLogs`("+
                "`logID` INT PRIMARY KEY AUTO_INCREMENT,"+
                "`deviceID` INT NOT NULL,"+
                "`datetime` DATETIME NOT NULL,"+
                "`latestPing` INT NOT NULL,"+
                "`information` JSON NOT NULL,"+
                "`logLocal` VARCHAR(255) NOT NULL,"+
                "FOREIGN KEY(`deviceID`) REFERENCES `Devices`(`id`),"+
                "FOREIGN KEY(`latestPing`) REFERENCES `PingResults`(`pingID`));")
        res = await db.query(
            "CREATE TABLE IF NOT EXISTS `sshLogin`("+
                "`id` INT PRIMARY KEY AUTO_INCREMENT,"+
                "`deviceID` INT NOT NULL,"+
                "`username` VARCHAR(15) NOT NULL,"+
                "`password` VARCHAR(48) NOT NULL,"+
                "FOREIGN KEY(`deviceID`) REFERENCES `Devices`(`id`));")
        res = await db.query(
            "CREATE TABLE IF NOT EXISTS `deviceSettings`("+
                "`id` INT PRIMARY KEY AUTO_INCREMENT,"+
                "`deviceID` INT NOT NULL,"+
                "`pingCount` INT NOT NULL,"+
                "`pingTime` INT NOT NULL,"+
                "FOREIGN KEY(`deviceID`) REFERENCES `Devices`(`id`));"
        )
        res = await db.query(
            "CREATE VIEW IF NOT EXISTS `PingResultsView` AS"+
            " SELECT t1.DeviceName, t1.ipAddr, t1.MacAddress, t2.*"+
            " FROM PingResults t2 JOIN Devices t1 ON t2.deviceID = t1.id;"
        )
        delete res[`meta`]
        db.end();
        return res
    } catch (error) {
        databaseLog(`Error with setup`,error)
        db.end();
        return false
    }
}

module.exports = {uploadSpeedTest, getPingResults, getCurrentDeviceDetails, setup}