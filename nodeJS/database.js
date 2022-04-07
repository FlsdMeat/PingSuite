//Used for .env enviornment file
require('dotenv').config()
//Used for propper logging
const { databaseLog, saveResults } = require('./logging.js')
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
        connectionLimit:4
    })
} else {
    pool = mariadb.createPool({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PW,
        database:process.env.DB_DATABASE,
        connectionLimit:4
    })
}

//returns specific date formats
function date(dateType, daysPrev){
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
    } else if (dateType === 'daysPrev'){ // Returns a previous date
        let pastDate = new Date(date_time);
        pastDate.setDate(pastDate.getDate() - daysPrev);
        date = ("0" + pastDate.getDate()).slice(-2);
        month = ("0" + (pastDate.getMonth() + 1)).slice(-2);
        year = pastDate.getFullYear();
        return `${year}-${month}-${date}`;
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
        console.log(res[0])

        return res[0]
    } catch (error) {
        databaseLog(`Error with checkingDevice`,error)
        return false
    }
}

async function uploadSpeedTest(speedTest, pingTest, mac, deviceName, ipAddr){ //Uploads the tests, adds the building from the ip
    let ipLocal = {
        1:'Harugari Hall',2:'South Campus Hall',3:'1124 Campbell Ave',4:'Kaplan Hall',5:'Dodds Hall', 6:'Bethel Hall',7:'Gate House', 8:'Campus Store / UNH PD', 9:'Bartels Hall', 10:'Buckman Hall / Utility Building',
        11:'Peterson Library', 12:'Maxcy Hall', 13:'Bayer Hall', 14:'Bartels Student Activity Center', 15:'Dunham Hall', 16:'Sheffield Hall', 17:'Winchester Hall', 18:'Arbeiter Maenner Chor', 19:'North Campus - House', 20:'Echlin Hall'
    }
    let db, res;
    db = await pool.getConnection();
    let deviceCheck = await checkDevice(db, mac, deviceName, ipAddr)
    let building = ipLocal[parseInt(ipAddr.split('.')[2])]
    if(deviceCheck){
        try {
            res = await db.query(
                `INSERT INTO PingResults (deviceID, datetime, building, pingMin, pingAvg, pingLoss, pingMax, pingStdDev, sTdown,sTup,sTping) 
                VALUES (${deviceCheck.id}, '${date('date')} ${date('time')}', '${building}', ${(pingTest['min']).toFixed(2)}, ${(pingTest['avg']).toFixed(2)}, '${pingTest['loss']}', ${(pingTest['max']).toFixed(2)}, ${(pingTest['stddev']).toFixed(4)}, ${Math.trunc(speedTest['download'])}, ${Math.trunc(speedTest['upload'])}, ${(speedTest['ping']).toFixed(2)})`
            )
            delete res['meta']
            databaseLog(`${deviceName} latest ping was delievered to the database!`)
            db.end()
            return true
        } catch (error) {
            databaseLog(`Error with uploadSpeedTest`,error)
            saveResults(`INSERT INTO PingResults (deviceID, datetime, building, pingMin, pingAvg, pingLoss, pingMax, pingStdDev, sTdown,sTup,sTping) 
            VALUES (${deviceCheck.id}, '${date('date')} ${date('time')}', '${building}', ${(pingTest['min']).toFixed(2)}, ${(pingTest['avg']).toFixed(2)}, '${pingTest['loss']}', ${(pingTest['max']).toFixed(2)}, ${(pingTest['stddev']).toFixed(4)}, ${Math.trunc(speedTest['download'])}, ${Math.trunc(speedTest['upload'])}, ${(speedTest['ping']).toFixed(2)})`)
            db.end()
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
module.exports = {uploadSpeedTest, getPingResults, getCurrentDeviceDetails}