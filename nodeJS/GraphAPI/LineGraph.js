const e = require("express")

async function LineGraph(graphData, url, graphParams){
    const getRandomColor = () =>{
      return [Math.floor(Math.random() * (256 - 100) + 100), Math.floor(Math.random() * (256 - 100) + 100), Math.floor(Math.random() * (256 - 100) + 100)]
    }

    let data = {}
    Object.keys(graphData).forEach(deviceID=>{
        graphData[deviceID]['color'] = getRandomColor()
    })
    if(url[0] === 'allDates'){
        data = await findGraphPointsAllDates(graphData, url,graphParams)
    } else if (url[0] === 'selectDate'){
        data = await findGraphPointsSelectDate(graphData, url,graphParams)
    } else if (url[0] === 'dateRange'){
        data = await findGraphPointsDateRange(graphData, url, graphParams)
    }
    return data
}
  
async function findGraphPointsAllDates(graphData, url,graphParams){
    const getGraphData = () => {
        let timeZoom = "days" // over a single 'day', multiple 'days', single month, multiple months, single year, multiple years
        let rangeType, graphYAxis, condense, organization;
        rangeType = url[0]
        graphYAxis = graphParams[1]
        condense = graphParams[2]
        organization = graphParams[3]
        let labels = [], labelsObj = {},
            datasets = [];
        let findDates = getLabelsAllDates(graphData);
        if (timeZoom === "days"){
            Object.keys(findDates).forEach(year =>{
                Object.keys(findDates[year]).forEach(month =>{
                    Object.keys(findDates[year][month]).forEach(day =>{
                        labels.push(`${month} ${day}`)
                        labelsObj[`${month} ${day}`] = `${month} ${day}`
                    })
                })
            })
        }
        labels = sortAllDates(labels)
        if(organization === 'device'){
            datasets = dataSetsAllDatesDevices(graphData, graphYAxis, condense, labels, labelsObj)
        } else if (organization === 'building'){
            datasets = datasetsAllDatesBuildings(graphData, graphYAxis, condense, labelsObj)
        }
        return{
            labels:labels,
            datasets:datasets
        };
    }

    return getGraphData()
}

async function findGraphPointsSelectDate(graphData, url,graphParams){
    const getGraphData = () => {
        let rangeType, graphYAxis, organization;
        rangeType = url[0]
        graphYAxis = graphParams[1]
        organization = graphParams[2]
        selectDate = graphParams[3].replaceAll('?', ' ')
        let labels = [...Array(24)].map((a,b)=>b), datasets = [];
        if(organization === 'device'){
            datasets = datasetsSelectDateDevices(graphData, graphYAxis, labels, date1, date2)
        } else if (organization === 'building'){
            datasets = datasetsSelectDateBuildings(graphData, graphYAxis, labels, date1, date2)
        }
        return{
            labels:labels,
            datasets:datasets
        };
    }

    return getGraphData()
}

function grabDateArr(dateRange){
    try{
        let date1 = dateRange[0].replace(',', '').split(' ')
        let date2 = dateRange[1].replace(',', '').split(' ')
        let MONTHS = {Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct:'10', Nov: '11', Dec: '12'}
        if(date1[1].length == 1){
            date1[1] = '0' + date1[1]
        }
        if(date2[1].length == 1){
            date2[1] = '0' + date2[1]
        }
        date1 = new Date(`${MONTHS[date1[0]]}/${date1[1]}/${date1[2]}`)
        date2 = new Date(`${MONTHS[date2[0]]}/${date2[1]}/${date2[2]}`)
        const Difference_In_Time = date2.getTime() - date1.getTime();
        const distance = Difference_In_Time / (1000 * 3600 * 24)
        Date.prototype.addDays = function(days) {
            var dat = new Date(this.valueOf())
            dat.setDate(dat.getDate() + days);
            return dat;
        }
     
        const getDates = (startDate, stopDate) => {
           var dateArray = new Array();
           var currentDate = startDate;
           while (currentDate <= stopDate) {
             dateArray.push(currentDate)
             currentDate = currentDate.addDays(1);
           }
           return dateArray;
         }
     
        let dateArray = getDates(date1, (date1).addDays(distance));
        dateArray = dateArray.map(date => {
            let dateArr = date.toString().split(' ')
            return `${dateArr[1]} ${dateArr[2]}, ${dateArr[3]}`
        })
        return dateArray
    }catch(err){
        console.log(err)
    }
}
function getRangeArray(dateRange){
    let dateTimeObj = {}
    let dateArr = []
    let stagger = 1
    if(dateRange.length < 7){
        stagger = dateRange.length
    } else {
        stagger = 12
    }
    dateRange.forEach(date => {
        if(dateTimeObj[date] == undefined){
            dateTimeObj[date] = []
        }
        for(let i = 0; i < 24; i += stagger){
            dateArr.push(`${date} ${i}:00`)
            dateTimeObj[date].push(`${i}:00`)
        }
    })
    return [dateTimeObj, dateArr]
}
function withinDateRange(date, dateRange){
    date = date.replace(',', '').split(' ')
    let date1 = dateRange[0].replace(',', '').split(' ')
    let date2 = dateRange[1].replace(',', '').split(' ')
    let MONTHS = {Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct:'10', Nov: '11', Dec: '12'}
    if(date1[1].length == 1){
        date1[1] = '0' + date1[1]
    }
    if(date2[1].length == 1){
        date2[1] = '0' + date2[1]
    }
    date = new Date(`${MONTHS[date[0]]}/${date[1]}/${date[2]}`)
    date1 = new Date(`${MONTHS[date1[0]]}/${date1[1]}/${date1[2]}`)
    date2 = new Date(`${MONTHS[date2[0]]}/${date2[1]}/${date2[2]}`)
    if(date1.getTime < date.getTime && date.getTime < date2.getTime){
        return true
    }
    return false
}
async function findGraphPointsDateRange(graphData, url, graphParams){
    const getGraphData = () => {
        try {
            let rangeType, graphYAxis, organization;
            rangeType = url[0]
            graphYAxis = graphParams[1]
            organization = graphParams[2]
            dateRange = graphParams[3].replaceAll('?', ' ').split('+')
            dateRange = grabDateArr(dateRange)
            let labels = getRangeArray(dateRange)
            let labelsObj = labels[0]
            labels = labels[1]
            if(organization === 'device'){
                datasets = datasetsDateRangeDevices(graphData, graphYAxis, labels, dateRange)
            } else if (organization === 'building'){
                datasets = datasetsDateRangeBuildings(graphData, graphYAxis, labels, labelsObj, dateRange)
            }
            return{
                labels:labels,
                datasets:datasets
            };
        } catch (error) {
            console.log(error)
            return false
        }
        
    }
    return getGraphData()
}

function getLabelsAllDates(graphData){
    let dates = {}
    Object.keys(graphData).forEach(device=>{
        Object.keys(graphData[device]).forEach(date =>{
            if(!('DeviceName' === date || 'color' === date || 'CurrentStatus' === date)){
            let year = date.substring(date.lastIndexOf(' ') + 1)
            let month = date.substring(0, date.indexOf(' '))
            let day = date.substring(date.indexOf(' ') + 1, date.lastIndexOf(','))
            if(!(year in dates)){
                dates[year] = {}
            }
            if(!(month in dates[year])){
                dates[year][month] = {}
            }
            if(!(day in dates[year][month])){
                dates[year][month][day] = []
            }
            date = graphData[device][date]
            Object.keys(date).forEach(ping =>{
                dates[year][month][day].push([device, ping])
            })
            }
        })
    })
    return dates
}
function sortAllDates(arr){
    const sortLabels = (arr) => {
        if (arr.length === 1){
        return arr
        }
        const middle = Math.floor(arr.length / 2) // get the middle item of the array rounded down
        const left = arr.slice(0, middle)         // items on the left side
        const right = arr.slice(middle)           // items on the right side
        return merge( sortLabels(left), sortLabels(right) )
    }
    function merge (left, right) {
        const monPrefix = {'Jan':0, 'Feb':1, 'Mar':2, 'Apr':3, 'May':4, 'Jun':5, 'Jul':6, 'Aug':7, 'Sep':8, 'Oct':9, 'Nov':10, 'Dec':11}
        let result = []
        let leftIndex = 0
        let rightIndex = 0
        while (leftIndex < left.length && rightIndex < right.length) {
        let leftMonth = monPrefix[left[leftIndex].substring(0, 3)]
        let rightMonth = monPrefix[right[rightIndex].substring(0, 3)]
        let leftDate = parseInt(left[leftIndex].substring(4))
        let rightDate = parseInt(right[rightIndex].substring(4))
        if (leftMonth < rightMonth) {
            result.push(left[leftIndex])
            leftIndex++      
        } else if (leftMonth === rightMonth && leftDate < rightDate){
            result.push(left[leftIndex])
            leftIndex++
        } else {
            result.push(right[rightIndex])
            rightIndex++
        }
        }
        return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex))
    }
    return sortLabels(arr)
}
function dataSetsAllDatesDevices(graphData, graphYAxis, condense, labels, labelsObj){
    return Object.keys(graphData).map( (device, index) => {
        let tempDataObj = {}
        Object.keys(graphData[device]).forEach( (date) => {
            let sumOfData = 0;
            let dataForStd = [];
            if(date.substring(0, date.indexOf(',')) in labelsObj){
                Object.keys(graphData[device][date]).forEach(time => {
                    time = graphData[device][date][time]
                    if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                        sumOfData += time[graphYAxis] / 1000000
                        dataForStd.push(item / 1000000)
                    } else if (graphYAxis === 'pingLoss'){
                        if(time[graphYAxis].length !== 0){
                            sumOfData += parseInt(time[graphYAxis].replace('%', ''))
                            dataForStd.push(parseInt(time[graphYAxis].replace('%', '')))
                        }
                    }  else {
                        dataForStd.push(time[graphYAxis])
                        sumOfData += time[graphYAxis]
                    }
                })
                let mean = sumOfData / Object.keys(graphData[device][date]).length
                if(condense === 'avg'){
                    tempDataObj[date.substring(0, date.indexOf(','))] = mean
                } else if(condense === 'stddev'){
                    let stddev = 0
                    dataForStd.forEach(item=>{
                        stddev += (item - mean)**2
                    })
                    stddev = Math.sqrt(stddev / Object.keys(graphData[device][date]).length)
                    tempDataObj[date.substring(0, date.indexOf(','))] = stddev
                } else if (condense === 'trimAvg'){
                    let trim = Math.ceil(dataForStd.length() * 0.1)
                    let sum = 0;
                    dataForStd.sort(function(a, b){return a-b});
                    for(let i = trim; i < dataForStd.length() - trim; i++){
                        sum += dataForStd[i]
                    }
                    tempDataObj[date.substring(0, date.indexOf(','))] = sum / dataForStd.length()
                }else {
                    tempDataObj[date.substring(0, date.indexOf(','))] = mean
                }
            }
        })
        let tempDataArr = []
        labels.forEach(date => {
            if(!(date in tempDataObj)){
                tempDataArr.push(0)
            } else {
                tempDataArr.push(tempDataObj[date])
            }
        })

        let color = graphData[device]['color']
        return{
            id: index + 1,
            data:tempDataArr,
            label:graphData[device]['DeviceName'],
            backgroundColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`,
            borderColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`
        }
    })
}
function datasetsAllDatesBuildings(graphData,graphYAxis,condense, labelsObj){
    let buildings = {}
    let buildingsFinalData = {}
    let tempItem = {}
    // loop for each device in object from db, http://10.5.70.233/api/pingResults/allDates
    Object.keys(graphData).forEach((device) => {
        Object.keys(graphData[device]).forEach((date)=>{
            //double checking if the datbe is inside labelsOj
            if(date.substring(0, date.indexOf(',')) in labelsObj){
                tempItem[date] = graphData[device][date]
                if(!(date === 'DeviceName' || date === 'CurrentStatus')){
                    Object.keys(graphData[device][date]).forEach((time, index) => {
                        let item = graphData[device][date][time]
                        if(buildings[item['local']] === undefined){
                            buildings[item['local']] = {}
                            buildings[item['local']]['color'] = graphData[device]['color']
                        } 
                        if (buildings[item['local']][date] === undefined){
                            buildings[item['local']][date] = []
                        }
                        //inside of buildings, we have the building name which is an object, and inside that is the date, and for that is an array of the graphYAxis data of that date
                        buildings[item['local']][date].push(item[graphYAxis])
                    })
                }

            }
        })
    })
    //we have all buildings now with a date inside each one, and data for each date inside that 
    Object.keys(buildings).forEach((building) => {
        Object.keys(buildings[building]).forEach((date)=>{
            if(date !== 'color'){
                let sumOfData = 0;
                let dataForStd = []
                buildings[building][date].forEach((item, index) => {
                    if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                        dataForStd.push(item / 1000000)
                        sumOfData += item / 1000000
                    } else if (graphYAxis === 'pingLoss'){
                        if(item.length !== 0){
                            sumOfData += parseInt(item.replace('%', ''))
                            dataForStd.push(parseInt(item.replace('%', '')))
                        }
                    } else {
                        dataForStd.push(item)
                        sumOfData += item
                    }
                })
                let mean = sumOfData / buildings[building][date].length
                if(buildingsFinalData[building] === undefined){
                    buildingsFinalData[building] = []
                }
                if(condense === 'avg'){
                    buildingsFinalData[building].push(mean.toFixed(3))
                } else if(condense === 'stddev'){
                    let stddev = 0
                    dataForStd.forEach(item => {
                        stddev += (item - mean)**2
                    })
                    stddev = Math.sqrt(stddev / dataForStd.length)
                    buildingsFinalData[building].push(stddev.toFixed(3))
                }  else if (condense === 'trimAvg'){
                    let trim = Math.ceil(dataForStd.length * 0.1)
                    let sum = 0;
                    dataForStd.sort(function(a, b){return a-b});
                    if(dataForStd.length > 10){
                        for(let i = trim; i < dataForStd.length - trim; i++){
                            sum += dataForStd[i]
                        }
                    } else {
                        for(let i = 0; i < dataForStd.length; i++){
                            sum += dataForStd[i]
                        }
                    }
                    buildingsFinalData[building].push(sum / dataForStd.length)
                } else {
                    buildingsFinalData[building].push(mean.toFixed(3))
                }
            }
        })
    })
    return Object.keys(buildingsFinalData).map((building, index)=>{
        if(building === 'color'){
            return false
        }
        let color = buildings[building]['color']
        return{
            id: index + 1,
            data:buildingsFinalData[building],
            label:building,
            backgroundColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`,
            borderColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`
        }
    })
}
function datasetsSelectDateDevices(graphData, graphYAxis, labels, selectDate){
    return Object.keys(graphData).map( (device, index) => {
        let dataObj = {}
        let dataArr = []
        Object.keys(graphData[device][selectDate]).forEach(time => {
            let timeInt = parseInt(time.substring(0, time.indexOf(':')))
            time = graphData[device][selectDate][time]
            if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                dataObj[timeInt] = (time[graphYAxis] / 1000000)
            } else if (graphYAxis === 'pingLoss'){
                if(time[graphYAxis].length !== 0){
                    dataObj[timeInt] = parseInt(time[graphYAxis].replace('%', ''))
                }
            }  else {
                dataObj[timeInt] = time[graphYAxis]
            }
        })
        labels.forEach(time => {
            if(!(time in dataObj)){
                dataArr.push(0)
            } else {
                dataArr.push(dataObj[time])
            }
        })
        let color = graphData[device]['color']
        return{
            id: index + 1,
            data:dataArr,
            label:graphData[device]['DeviceName'],
            backgroundColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`,
            borderColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`
        }
    })
}
function datasetsSelectDateBuildings(graphData,graphYAxis,labels, labelsObj){
    let buildings = {}
    let buildingsFinalData = {}
    let tempItem = {}
    try{
        // loop for each device in object from db, http://10.5.70.233/api/pingResults/allDates
        Object.keys(graphData).forEach((device) => {
            Object.keys(graphData[device]).forEach((date)=>{
                //double checking if the datbe is inside labelsOj
                if(date !== 'DeviceName' && date !== 'CurrentStatus' && date !== 'color' && date == labelsObj){
                    tempItem[date] = graphData[device][date]
                    Object.keys(graphData[device][date]).forEach((time, index) => {
                        let item = graphData[device][date][time]
                        if(buildings[item['local']] === undefined){
                            buildings[item['local']] = {}
                            buildings[item['local']]['color'] = graphData[device]['color']
                        } 
                        if (buildings[item['local']][date] === undefined){
                            buildings[item['local']][date] = {}
                        }
                        //inside of buildings, we have the building name which is an object, and inside that is the date, and for that is an array of the graphYAxis data of that date
                        let timeFixed = time.substring(0,time.indexOf(':'))
                        if(timeFixed[0] == '0'){
                            timeFixed = timeFixed[1]
                        }
                        if(graphYAxis === 'pingLoss'){
                            buildings[item['local']][date][timeFixed] = parseInt(item[graphYAxis].substring(0,item[graphYAxis].indexOf('%')))
                        } else if ( graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                            buildings[item['local']][date][timeFixed] = item[graphYAxis] / 1000000
                        }else {
                            buildings[item['local']][date][timeFixed] = item[graphYAxis]
                        }
                    })
                }
            })
        })
        //we have all buildings now with a date inside each one, and data for each date inside that 
        Object.keys(buildings).forEach((building) => {
            if(buildingsFinalData[building] === undefined){
                buildingsFinalData[building] = []
            }
            Object.keys(buildings[building]).forEach((date)=>{
                if(date !== 'color'){
                    let buildingObj = buildings[building][date]
                    labels.forEach(time => {
                        if(time in buildingObj){
                            buildingsFinalData[building].push(buildingObj[time])
                        } else {
                            buildingsFinalData[building].push(0)
                        }
                    })
                }
            })
        })
    }catch (err){
        console.log(err)
    }
    return Object.keys(buildingsFinalData).map((building, index)=>{
        if(building === 'color'){
            return false
        }
        let color = buildings[building]['color']
        return{
            id: index + 1,
            data:buildingsFinalData[building],
            label:building,
            backgroundColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`,
            borderColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`
        }
    })
}
function datasetsDateRangeDevices(graphData, graphYAxis, labels, dateRange){
    return Object.keys(graphData).map( (device, index) => {
        let dataObj = {}
        let dataArr = []
        Object.keys(graphData[device][selectDate]).forEach(time => {
            let timeInt = parseInt(time.substring(0, time.indexOf(':')))
            time = graphData[device][selectDate][time]
            if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                dataObj[timeInt] = (time[graphYAxis] / 1000000)
            } else if (graphYAxis === 'pingLoss'){
                if(time[graphYAxis].length !== 0){
                    dataObj[timeInt] = parseInt(time[graphYAxis].replace('%', ''))
                }
            }  else {
                dataObj[timeInt] = time[graphYAxis]
            }
        })
        labels.forEach(time => {
            if(!(time in dataObj)){
                dataArr.push(0)
            } else {
                dataArr.push(dataObj[time])
            }
        })
        let color = graphData[device]['color']
        return{
            id: index + 1,
            data:dataArr,
            label:graphData[device]['DeviceName'],
            backgroundColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`,
            borderColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`
        }
    })
}
function datasetsDateRangeBuildings(graphData,graphYAxis, labels, labelsObj, dateRange){
    let buildings = {}
    let buildingsFinalData = {}
    let tempItem = {}
    try{
        // loop for each device in object from db, http://10.5.70.233/api/pingResults/allDates
        Object.keys(graphData).forEach((device) => {
            Object.keys(graphData[device]).forEach((date)=>{
                //double checking if the datbe is inside labelsOj
                if(date !== 'DeviceName' && date !== 'CurrentStatus' && date !== 'color' && dateRange.includes(date)){
                    tempItem[date] = graphData[device][date]
                    Object.keys(graphData[device][date]).forEach((time, index) => {
                        let item = graphData[device][date][time]
                        if(buildings[item['local']] === undefined){
                            buildings[item['local']] = {}
                            buildings[item['local']]['color'] = graphData[device]['color']
                        } 
                        if (buildings[item['local']][date] === undefined){
                            buildings[item['local']][date] = {}
                        }
                        //inside of buildings, we have the building name which is an object, and inside that is the date, and for that is an array of the graphYAxis data of that date
                        let timeFixed = time.substring(0,time.indexOf(':'))
                        if(timeFixed[0] == '0'){
                            timeFixed = timeFixed[1]
                        }
                        if(graphYAxis === 'pingLoss'){
                            buildings[item['local']][date][timeFixed] = parseInt(item[graphYAxis].substring(0,item[graphYAxis].indexOf('%')))
                        } else if ( graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                            buildings[item['local']][date][timeFixed] = item[graphYAxis] / 1000000
                        }else {
                            buildings[item['local']][date][timeFixed] = item[graphYAxis]
                        }
                    })
                }
            })
        })
        //we have all buildings now with a date inside each one, and data for each date inside that 
        Object.keys(buildings).forEach((building) => {
            if(buildingsFinalData[building] === undefined){
                buildingsFinalData[building] = []
            }
            Object.keys(labelsObj).forEach(date=>{
                if (date in buildings[building]){
                    lastTime = ''
                    gotAtime = false
                    labelsObj[date].forEach(time=>{
                        if (parseInt(time) in buildings[building][date]){
                            gotAtime == true
                            if(lastTime = ''){
                                buildingsFinalData[building].push(buildings[building][date][parseInt(time)])
                            } else {
                                let temp = parseInt(lastTime)
                                temp = parseInt(time) - temp
                                
                            }
                            lastTime = time
                        }
                    })
                    if (gotAtime == false){
                        labelsObj[date].forEach((time,index)=>{
                            try {
                                buildingsFinalData[building].push(buildings[building][date][Object.keys(buildings[building][date])[index]])
                            } catch (error) {
                                buildingsFinalData[building].push(0)
                            }
                        })
                    }
                } else {
                    labelsObj[date].forEach(time=>{
                        buildingsFinalData[building].push(0)
                    })
                }
            })
        })
    }catch (err){
        console.log(err)
    }
    return Object.keys(buildingsFinalData).map((building, index)=>{
        if(building === 'color'){
            return false
        }
        let color = buildings[building]['color']
        return{
            id: index + 1,
            data:buildingsFinalData[building],
            label:building,
            backgroundColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`,
            borderColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`
        }
    })
}
module.exports = {LineGraph}