
async function SelectDate(graphData, url,graphParams){
    const getGraphData = () => {
        let rangeType, graphYAxis, organization, datasets;
        rangeType = url[0]
        graphYAxis = graphParams[1]
        organization = graphParams[2]
        selectDate = graphParams[3].replaceAll('?', ' ')
        let labels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ,16 ,17, 18, 19, 20, 21, 22, 23];
        if(organization === 'device'){
            datasets = datasetsSelectDateDevices(graphData, graphYAxis, labels, selectDate)
        } else if (organization === 'building'){
            datasets = datasetsSelectDateBuildings(graphData, graphYAxis, labels, selectDate)
        }
        return{
            labels:labels,
            datasets:datasets
        };
    }

    return getGraphData()
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
module.exports = {SelectDate}