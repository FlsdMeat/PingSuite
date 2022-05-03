const { graphAPILog } = require('../logs/logging.js')
async function AllDates(graphData, url,graphParams){
    try {
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
    } catch (error) {
        graphAPILog(`Error with AllDates`,error)
    }
}
function getLabelsAllDates(graphData){
    try {
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
    } catch (error) {
        graphAPILog(`Error with AllDates getLabelsAllDates`, error)
    }
}
function sortAllDates(arr){
    try {
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
    } catch (error) {
        graphAPILog(`Error with AllDates sortAllDates`, error)
    }
}
function dataSetsAllDatesDevices(graphData, graphYAxis, condense, labels, labelsObj){
    try {
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
    } catch (error) {
        graphAPILog(`Error with AllDates dataSetsAllDatesDevices`, error)
    }
}
function datasetsAllDatesBuildings(graphData,graphYAxis,condense, labelsObj){
    try {
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
    } catch (error) {
        graphAPILog(`Error with AllDates datasetsAllDatesBuildings`, error)
    }
}
module.exports = {AllDates}