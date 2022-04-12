async function DateRange(graphData, url, graphParams){
    const getGraphData = () => {
        try {
            let rangeType, graphYAxis, organization;
            rangeType = url[0]
            graphYAxis = graphParams[1]
            organization = graphParams[2]
            let dateRange = graphParams[3].replaceAll('?', ' ').split('+')
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
    try {
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
    } catch (error) {
        console.log('error in getRangeArary', error)
    }
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
module.exports = {DateRange}