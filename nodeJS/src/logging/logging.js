const Operations = {true: 'a', false:'w'}
require('dotenv').config()
const fs = require('fs')

const checkWorkingDirectory = (currentDirectory, where) => {
    let directory = currentDirectory
    let newDate = new Date();
    newDate = `${newDate.getFullYear()}-${newDate.getMonth()}-${newDate.getDate()}`
    for (location in where.split('/')){
        if (location == "[date]"){
            location = newDate
        }
        if (directory == currentDirectory){
            directory = `${currentDirectory}/${location}`
        } else {
            directory = `${directory}/${item}`
        }
        if (!fs.existsSync(directory)){
            fs.mkdirSync(directory)
        }
    }
}

export default class Logging{
    constructor(where, name, printLogs = true, format = 'txt', dateTimeInLine=false, list = false, append = false) {
        this.where = where
        this.name = name
        this.printLogs = printLogs
        this.format = format
        this.list = list
        this.dateTimeInLine = dateTimeInLine
        this.append = append
        this.operation = Operations[this.append]
        this.setup = false
        this.filePath = null
        this.currentDirectory = process.env.CURRENT_DIR
        this.workingDirectory = checkWorkingDirectory(this.currentDirectory, this.where)
    }

    SetupLogging(date){
        if (date == true){
            let newDate = new Date()
            let newTime = newDate.getTime()
            date = `${newDate.getFullYear()}-${newDate.getMonth()}-${newDate.getDate()}`
            let writeDirectory = this.workingDirectory
            if ("date" in writeDirectory){
                writeDirectory.replace("[date]", date)
                if (this.append == true){
                    this.filePath = `${writeDirectory}/${this.name}.${this.format}`
                } else {
                    this.filePath = `${writeDirectory}/${this.name}_${newTime}.${this.format}`
                }
            } else {
                if (this.append == true){
                    this.filePath = `${writeDirectory}/${this.name}_${date}.${this.format}`
                } else {
                    this.filePath = `${writeDirectory}/${this.name}_${date}_${newTime}.${this.format}`
                }
            }
            this.setup = true
        } else if (date == false){
            let writeDirectory = this.workingDirectory
            this.filePath = `${writeDirectory}/${this.name}.${this.format}`
            this.setup = true
        } else {
            throw('[Logging Class] [Setup Logging] Date Argument must be set to true or false!')
        }
    }

    WriteLog(date, data, functionName){
        if (this.printLogs){
            console.log(`[${functionName}] ${data}`)
        }
        if (this.setup == false){
            SetupLogging(date)
        }
        if (this.dateTimeInLine){
            let newDate = new Date()
            let newTime = newDate.getTime()
            newDate = `${newDate.getFullYear()}-${newDate.getMonth()}-${newDate.getDate()}`
        }
        //if (this.append){
        //    with fs.writeFileSync
        //}
    }

}