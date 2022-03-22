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
        data = await findGraphPointsDateRange(graphData, url,graphParams)
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
            datasets = datasetsAllDatesBuildings(graphData)
        }

        return{
            labels:labels,
            datasets:datasets
        };
    }

    return getGraphData()
}

async function findGraphPointsSelectDate(){
    const getDateLabels = () => {
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
    const getGraphData = () => {
        let timeZoom = "days" // over a single 'day', multiple 'days', single month, multiple months, single year, multiple years
        let rangeType, dateRange, graphYAxis, condese;
        rangeType = url[0]
        graphYAxis = graphParams[1]
        condese = graphParams[2]
        let labels = [], labelsObj = {},
            datasets = [];
        let findDates = getDateLabels();
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
        labels = sortLabels(labels)
        datasets = Object.keys(graphData).map( (device, index) => {
        let tempDataObj = {}
        if(condese === 'stddev'){
            Object.keys(graphData[device]).forEach( (date) => {
                let sumOfData = 0;
                if(date.substring(0, date.indexOf(',')) in labelsObj){
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                            sumOfData += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                sumOfData += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        }  else {
                            sumOfData += time[graphYAxis]
                        }
                    })
                    let mean = sumOfData / Object.keys(graphData[device][date]).length
                    let temp = 0
                    let stddev = 0
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                            temp += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                temp += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        } else {
                            temp += time[graphYAxis]
                        }
                        stddev += (temp - mean)**2
                    })
                    stddev = Math.sqrt(stddev / Object.keys(graphData[device][date]).length)
                    tempDataObj[date.substring(0, date.indexOf(','))] = stddev
                }
            })
        } else {
            Object.keys(graphData[device]).forEach( (date) => {
                let average = 0;
                if(date.substring(0, date.indexOf(',')) in labelsObj){
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                        average += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                average += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        } else {
                        average += time[graphYAxis]
                        }
                    })
                    average = average / Object.keys(graphData[device][date]).length
                    tempDataObj[date.substring(0, date.indexOf(','))] = average
                }
            })
        }
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
        return{
            labels:labels,
            datasets:datasets
        };
    }

    return getGraphData()
}

async function findGraphPointsDateRange(){
    const getDateLabels = () => {
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
    const getGraphData = () => {
        let timeZoom = "days" // over a single 'day', multiple 'days', single month, multiple months, single year, multiple years
        let rangeType, dateRange, graphYAxis, condese;
        rangeType = url[0]
        graphYAxis = graphParams[1]
        condese = graphParams[2]
        let labels = [], labelsObj = {},
            datasets = [];
        let findDates = getDateLabels();
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
        labels = sortLabels(labels)
        datasets = Object.keys(graphData).map( (device, index) => {
        let tempDataObj = {}
        if(condese === 'stddev'){
            Object.keys(graphData[device]).forEach( (date) => {
                let sumOfData = 0;
                if(date.substring(0, date.indexOf(',')) in labelsObj){
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                            sumOfData += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                sumOfData += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        }  else {
                            sumOfData += time[graphYAxis]
                        }
                    })
                    let mean = sumOfData / Object.keys(graphData[device][date]).length
                    let temp = 0
                    let stddev = 0
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                            temp += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                temp += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        } else {
                            temp += time[graphYAxis]
                        }
                        stddev += (temp - mean)**2
                    })
                    stddev = Math.sqrt(stddev / Object.keys(graphData[device][date]).length)
                    tempDataObj[date.substring(0, date.indexOf(','))] = stddev
                }
            })
        } else {
            Object.keys(graphData[device]).forEach( (date) => {
                let average = 0;
                if(date.substring(0, date.indexOf(',')) in labelsObj){
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                        average += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                average += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        } else {
                        average += time[graphYAxis]
                        }
                    })
                    average = average / Object.keys(graphData[device][date]).length
                    tempDataObj[date.substring(0, date.indexOf(','))] = average
                }
            })
        }
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
        return{
            labels:labels,
            datasets:datasets
        };
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
        if(condense === 'stddev'){
            Object.keys(graphData[device]).forEach( (date) => {
                let sumOfData = 0;
                if(date.substring(0, date.indexOf(',')) in labelsObj){
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                            sumOfData += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                sumOfData += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        }  else {
                            sumOfData += time[graphYAxis]
                        }
                    })
                    let mean = sumOfData / Object.keys(graphData[device][date]).length
                    let temp = 0
                    let stddev = 0
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                            temp += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                temp += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        } else {
                            temp += time[graphYAxis]
                        }
                        stddev += (temp - mean)**2
                    })
                    stddev = Math.sqrt(stddev / Object.keys(graphData[device][date]).length)
                    tempDataObj[date.substring(0, date.indexOf(','))] = stddev
                }
            })
        } else {
            Object.keys(graphData[device]).forEach( (date) => {
                let average = 0;
                if(date.substring(0, date.indexOf(',')) in labelsObj){
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                        average += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                average += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        } else {
                        average += time[graphYAxis]
                        }
                    })
                    average = average / Object.keys(graphData[device][date]).length
                    tempDataObj[date.substring(0, date.indexOf(','))] = average
                }
            })
        }
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

function datasetsAllDatesBuildings(graphData,condense){
    Object.keys(graphData).map( (device, index) => {
        let tempDataObj = {}
        if(condense === 'stddev'){
            Object.keys(graphData[device]).forEach( (date) => {
                let sumOfData = 0;
                if(date.substring(0, date.indexOf(',')) in labelsObj){
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                            sumOfData += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                sumOfData += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        }  else {
                            sumOfData += time[graphYAxis]
                        }
                    })
                    let mean = sumOfData / Object.keys(graphData[device][date]).length
                    let temp = 0
                    let stddev = 0
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                            temp += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                temp += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        } else {
                            temp += time[graphYAxis]
                        }
                        stddev += (temp - mean)**2
                    })
                    stddev = Math.sqrt(stddev / Object.keys(graphData[device][date]).length)
                    tempDataObj[date.substring(0, date.indexOf(','))] = stddev
                }
            })
        } else {
            Object.keys(graphData[device]).forEach( (date) => {
                let average = 0;
                if(date.substring(0, date.indexOf(',')) in labelsObj){
                    Object.keys(graphData[device][date]).forEach(time => {
                        time = graphData[device][date][time]
                        if(graphYAxis === 'sTdown' || graphYAxis === 'sTup'){
                        average += time[graphYAxis] / 1000000
                        } else if (graphYAxis === 'pingLoss'){
                            if(time[graphYAxis].length !== 0){
                                average += parseInt(time[graphYAxis].replace('%', ''))
                            }
                        } else {
                        average += time[graphYAxis]
                        }
                    })
                    average = average / Object.keys(graphData[device][date]).length
                    tempDataObj[date.substring(0, date.indexOf(','))] = average
                }
            })
        }
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
module.exports = {LineGraph}