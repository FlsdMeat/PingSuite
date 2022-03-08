const fs = require('fs')
const { cwd } = require('process')

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
        return `${hours}:${minutes}:${seconds}`;
    } else {
        reportLogError(`Type not specified: ${dateType}`, 'date')
    }
}

function generalLogs(who, status, error){
    let log = '';
    try {
        if (typeof error === 'object') {
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
        writeLog(log, who)
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