const {AllDates} = require('./AllDates.js')
const {SelectDate} = require('./SelectDate.js')
const { DateRange } = require('./DateRange.js')
async function GraphAPI(graphData, url, graphParams){
    const getRandomColor = () =>{
      return [Math.floor(Math.random() * (256 - 100) + 100), Math.floor(Math.random() * (256 - 100) + 100), Math.floor(Math.random() * (256 - 100) + 100)]
    }
    try {
        let data = {}
        Object.keys(graphData).forEach(deviceID=>{
            graphData[deviceID]['color'] = getRandomColor()
        })
        if(url[0] === 'allDates'){
            data = await AllDates(graphData, url,graphParams)
        } else if (url[0] === 'selectDate'){
            data = await SelectDate(graphData, url,graphParams)
        } else if (url[0] === 'dateRange'){
            data = await DateRange(graphData, url, graphParams)
        }
        return data
    } catch (error) {
        console.log(error)
    }
}

module.exports = {GraphAPI}