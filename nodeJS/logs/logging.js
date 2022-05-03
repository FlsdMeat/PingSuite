// File system api
const fs = require('fs')
// Current directory
const { cwd } = require('process')

function date(dateType){ // Used to get specific dates or time for file creation
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
        return `${hours}:${minutes}:${seconds}`;
    } else {
        reportLogError(`Type not specified: ${dateType}`, 'date')
    }
}

function generalLogs(who, status, error){ // Takes in the specs from other functions, creates the proper logging format
    let log = '';
    try {
        if (typeof error === 'object') { //Takes the error and checks if its an object first
            if (error.message) {
                log = (`[${date('time')}][${who}]: ${status}\n` + error.message)
            }
            if (error.stack) {
                log = (`[${date('time')}][${who}]: ${status}\nStacktrace:
                            ==========================\n` + error.stack)
            }
        } else {
            log = (`[${date('time')}][${who}]: ${status}\n${error}`);
        }
        writeLog(log, who) // Sends format to writeLog, will print to txt File
    } catch (err) {
        reportLogError(err, 'generalLogs')
    }
}

function databaseLog(status, error){
    try {
        generalLogs('database', status, error)
    } catch (error) {
        reportLogError(error, 'databaseLog')
    }
}

function appPostLog(status, error){
    try {
        generalLogs('appPostLog', status, error)
    } catch (error) {
        reportLogError(error, 'appPostLog')
    }

}

function graphAPILog(status, error){
    try {
        generalLogs('graphAPILog', status, error)
    } catch (error) {
        reportLogError(error, 'graphAPILog')
    }
}

function deviceAlertsLog(status, error){
    try {
        generalLogs('deviceAlertsLog', status, error)
    } catch (error) {
        reportLogError(error, 'deviceAlertsLog')
    }
}

function reportLogError(err, who){
    console.log(`[${date('date')}__${date('time')}][${who}]: ${err}`)
}

function writeLog(log, local){
    let path = cwd();
    //Makes logging directory if doesn't exist
    path = `${path}/logs/${local}`
    if (fs.existsSync(path) == false){
        fs.mkdirSync(path);
    }
    console.log(log)
    //Checks if file exists first, then appends the log to the file
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
function saveResults(results){
    let path = cwd();
    //Makes logging directory if doesn't exist
    path = `${path}/savedResults`
    if (fs.existsSync(path) == false){
        fs.mkdirSync(path);
    }
    if (!fs.existsSync(`${path}/${date('date')}.txt`)){
        fs.writeFile(`${path}/${date('date')}.txt`, results, {flags: 'w'}, err => {
            if(err){
                reportLogError(err, 'writeLogs')
            }
        })
    } else {
        fs.appendFile(`${path}/${date('date')}.txt`, results + '\n', err => {
            if(err){
                reportLogError(err, 'writeLogs')
            }
        })
    }
}

module.exports = {databaseLog, generalLogs, appPostLog,saveResults, graphAPILog, deviceAlertsLog} 