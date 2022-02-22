const fs = require('fs')
const { cwd } = require('process')

function generalLogs(status){
    try {
        let log = `[${date('time')}][General]: ${status}`
        writeLog(log, 'general')
        console.log()
    } catch (error) {
        reportLogError(error, 'generalLog')
    }
}
function databaseLog(status){
    try {
        let log = `[${date('time')}][Database]: ${status}`
        writeLog(log, 'database')
    } catch (error) {
        reportLogError(error, 'databaseLog')
    }
}

function appPostLog(status){
    try {
        let log = `[${date('time')}][AppPost]: ${status}`
        writeLog(log, 'appPost')
    } catch (error) {
        reportLogError(error, 'appPostLog')
    }

}

function date(dateType){
    let date_time = new Date();
    let date = ("0" + date_time.getDate()).slice(-2);
    let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
    let year = date_time.getFullYear();
    let hours = date_time.getHours();
    let minutes = date_time.getMinutes();
    let seconds = date_time.getSeconds();
    if (dateType === 'date'){
        return `${month}-${date}-${year}`;
    } else if (dateType === 'time'){
        return `${hours}-${minutes}-${seconds}`;
    } else {
        reportLogError(`Type not specified: ${dateType}`, 'date')
    }
}

function reportLogError(err, who){
    console.log(`[${date('date')}__${date('time')}][${who}]: ${err}`)
}

function writeLog(log, local){
    let path = cwd();
    path = `${path}/logs/${local}`
    if (fs.existsSync(path) == false){
        fs.mkdirSync(path);
    }
    console.log(log)
    if (!fs.existsSync(`${path}/${date('date')}.txt`)){
        fs.writeFile(`${path}/${date('date')}.txt`, log, {flags: 'w'}, err => {
            if(err){
                reportLogError(err, 'writeLogs')
            }
        })
    } else {
        fs.appendFile(`${path}/${date('date')}.txt`, log + '\n', err => {
            if(err){
                reportLogError(err, 'writeLogs')
            }
        })
    }
}

module.exports = {databaseLog, generalLogs, appPostLog}