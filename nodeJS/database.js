require('dotenv').config()
const { databaseLog } = require('./logging.js')
const mariadb = require('mariadb')
const pool = mariadb.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_StaffUSER,
    password:process.env.DB_HomePW,
    database:process.env.DB_DATABASE,
    connectionLimit:4
})

function date(dateType, daysPrev){
    let date_time = new Date();
    let date = ("0" + date_time.getDate()).slice(-2);
    let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
    let year = date_time.getFullYear();
    let hours = date_time.getHours();
    let minutes = date_time.getMinutes();
    let seconds = date_time.getSeconds();
    if (dateType === 'date'){
        return `${year}-${month}-${date}`;
    } else if (dateType === 'time'){
        return `${hours}:${minutes}:${seconds}`;
    } else if (dateType === 'daysPrev'){
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

async function checkDevice(db, mac, deviceName, ipAddr){
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

async function uploadSpeedTest(speedTest, pingTest, mac, deviceName, ipAddr){
    let db, res;
    db = await pool.getConnection();
    let deviceCheck = await checkDevice(db, mac, deviceName, ipAddr)
    if(deviceCheck){
        try {
            res = await db.query(
                `INSERT INTO PingResults (deviceID, datetime, pingMin, pingAvg, pingMax, pingStdDev, sTdown,sTup,sTping) 
                VALUES (${deviceCheck}, '${date('date')} ${date('time')}', ${pingTest['min']}, ${pingTest['avg']}, ${pingTest['max']}, ${pingTest['stddev'].toFixed(4)}, ${Math.trunc(speedTest['download'])}, ${Math.trunc(speedTest['upload'])}, ${speedTest['ping'].limitTo(2)})`
            )
            delete res['meta']
            databaseLog(`${deviceName} latest ping was delievered to the database!`)
            db.end()
            return true
        } catch (error) {
            databaseLog(`Error with uploadSpeedTest`,error)
            db.end()
            return false
        }
    }
    db.end();
}

async function getPingResults(){
    let db, res;
    db = await pool.getConnection();
    try {
        res = await db.query(
            `SELECT * FROM PingResultsView;`
        )
        delete res[`meta`]
        db.close();
        return res
    } catch (error) {
        databaseLog(`Error with getPingResults`,error)
        db.close();
        return false
    }
}
module.exports = {uploadSpeedTest, getPingResults}