const express = require('express');
const app = express()
const server = require('http').createServer(app);
const {uploadSpeedTest, getPingResults,getCurrentDeviceDetails} = require('./database.js')
const {appPostLog} = require('./logging.js')
const {LineGraph} = require('./GraphAPI/LineGraph.js')
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

let cache = {}

app.post('/pingResults', (req,res) => {
    let data = req.body
    try {
        Object.keys(data).forEach(item=>{
            if(item == 'SpeedTest' || item == 'PingResults'){
                data[item] = JSON.parse(data[item])
            }
        })
        sendToDatabase(data)
        appPostLog(`${data.name} with a mac ${data.mac} just sent a ping!`)
        return res.send(true)
    } catch (error) {
        appPostLog(`[AppPost pingResults]: Error with parsing JSON`,error)
        return res.send(false)
    }
})
const getPrefix = (num) => {
    let temp = (num.toString()).substring((num.toString()).length - 1)
    if ((num.toString())[0] === '0'){
        if (temp === '1'){
        return temp + 'st'
        } else if (temp === '2'){
        return temp + 'nd'
        } else if (temp === '3'){
        return temp + 'rd'
        }
        return temp + 'th'
    } else {
        if (temp === '1'){
        return num + 'st'
        } else if (temp === '2'){
        return num + 'nd'
        } else if (temp === '3'){
        return num + 'rd'
        }
        return num + 'th'
    }
}
app.get('/api/pingResults/*', async (req, res) => {
    let ipLocal = {
        1:'Harugari Hall',2:'South Campus Hall',3:'1124 Campbell Ave',4:'Kaplan Hall',5:'Dodds Hall', 6:'Bethel Hall',7:'Gate House', 8:'Campus Store / UNH PD', 9:'Bartels Hall', 10:'Buckman Hall / Utility Building',
        11:'Peterson Library', 12:'Maxcy Hall', 13:'Bayer Hall', 14:'Bartels Student Activity Center', 15:'Dunham Hall', 16:'Sheffield Hall', 17:'Winchester Hall', 18:'Arbeiter Maenner Chor', 19:'North Campus - House', 20:'Echlin Hall'
    }
    try {
        if (Object.keys(cache).length == 0){
            cache['fullResults'] = await getPingResults();
            cache['currentDeviceDetails'] = await getCurrentDeviceDetails();
            let data = {}
            cache['fullResults'].forEach(item => {
                if (item.deviceID in data === false){
                    data[item.deviceID] = {}
                    data[item.deviceID]["DeviceName"] = item.DeviceName
                    cache['currentDeviceDetails'].forEach(device=>{
                        if (device.id === item.deviceID){
                            data[item.deviceID]["CurrentStatus"] = device
                            data[item.deviceID]["CurrentStatus"]["CurrentLocal"] = ipLocal[(data[item.deviceID]["CurrentStatus"]["ipAddr"]).split('.')[2]]
                            return false
                        }
                        return true
                    })
                }
                let tempItem = {}
                Object.assign(tempItem, item)
                let date = item.datetime
                date = date.toString().split(' ')
                let time = date[4]
                date = [date[1], date[2], date[3]]
                date = `${date[0]} ${date[1]}, ${date[2]}`
                if(!(date in data[item.deviceID])){
                    data[item.deviceID][date] = {}
                }
                delete tempItem.DeviceName
                delete tempItem.MacAddress
                delete tempItem.deviceID
                delete tempItem.datetime
                data[item.deviceID][date][time] = tempItem
                let ip = (tempItem['ipAddr']).split('.')
                data[item.deviceID][date][time]['local'] = ipLocal[ip[2]]
            })
            cache['allDates'] = data
        }
        const url = req.url.substring(req.url.indexOf('pingResults') + 12)
        const urlArr = url.split('/')
        let urlGraph = []
        if(cache[url] !== undefined){
            try {
                urlGraph = urlArr[1].split('_')
            } catch (error) {
                return res.send(cache[url])
            }
            let graphParams = {}
            if(urlGraph[0] === 'line'){
                graphParams = await LineGraph(cache[url], urlArr, urlGraph)
            } else if (urlGraph [0] === 'bar'){
                graphParams = await LineGraph(cache[url], urlArr, urlGraph)
            } else {
                return res.send(cache[url])
            }
            return res.send(graphParams)
        }
        if(urlArr[0] === 'allDates'){
            try{
                urlGraph = urlArr[1].split('_')
                let graphParams = {}
                if(urlGraph[0] === 'line'){
                    graphParams = await LineGraph(cache['allDates'], urlArr, urlGraph)
                } else if (urlGraph [0] === 'bar'){
                    graphParams = await LineGraph(cache['allDates'], urlArr, urlGraph)
                } else {
                    return res.send(cache['allDates'])
                }
                return res.send(graphParams)
            } catch(error) {
                return res.send(cache['allDates'])
            }
        }else if (urlArr[0] === 'selectDate'){
            try{
                urlGraph = urlArr[1].split('_')
                let graphParams = {}
                if(urlGraph[0] === 'line'){
                    graphParams = await LineGraph(cache['allDates'], urlArr, urlGraph)
                } else if (urlGraph [0] === 'bar'){
                    graphParams = await LineGraph(cache['allDates'], urlArr, urlGraph)
                } else {
                    return res.send(cache[url])
                }
                return res.send(graphParams)
            } catch(error) {
                return res.send(cache[url])
            }
        }else if (urlArr[0] === 'dateRange'){
            let from = (urlArr[1].substring(0, urlArr[1].indexOf('?'))).replace(',','').split('_')
            let to = urlArr[1].substring(urlArr[1].indexOf('?') + 1).replace(',','').split('_')
            let months = {
                'Jan':1, 'Feb':2, 'Mar':3, 'Apr':4, 'May':5, 'Jun':6,'Jul':7, 'Aug':8, 'Sep':9, 'Oct':10, 'Nov':11,'Dec':12
            }
            let data = {}
            Object.keys(cache['allDates']).forEach(deviceID=>{
                let currentDevice = cache['allDates'][deviceID]
                Object.keys(currentDevice).forEach(date => {
                    if (date === "DeviceName" || date === "CurrentStatus"){
                        return true
                    }
                    let dateArr = date.replace(',', '').split(' ')
                    if (parseInt(from[2]) <= parseInt(dateArr[2]) && parseInt(dateArr[2]) <= parseInt(to[2])){
                        if((   months[to[0]] < months[from[0]] && 
                                (   months[from[0]] < months[dateArr[0]] || months[to[0]] > months[dateArr[0]])   )
                            || months[from[0]] < months[dateArr[0]] && months[dateArr[0]] < months[to[0]]){
                                if(data[deviceID] === undefined){
                                    data[deviceID] = {}
                                }
                                data[deviceID][date] = currentDevice[date]
                        } else if (months[dateArr[0]] === months[to[0]]){
                            if(parseInt(dateArr[1]) <= parseInt(to[1])){
                                if(data[deviceID] === undefined){
                                    data[deviceID] = {}
                                }
                                data[deviceID][date] = currentDevice[date]
                            }
                        } else if (months[dateArr[0]] === months[from[0]]){
                            if(parseInt(dateArr[1]) >= parseInt(from[1])){
                                if(data[deviceID] === undefined){
                                    data[deviceID] = {}
                                }
                                data[deviceID][date] = currentDevice[date]
                            }
                        } else {
                            return true
                        }
                    }
                    return true
                })
                if(data[deviceID] !== undefined){
                    data[deviceID]["DeviceName"] = currentDevice["DeviceName"]
                    data[deviceID]["CurrentStatus"] = currentDevice["CurrentStatus"]
                }
            })
            cache[url] = data
            try {
                urlGraph = urlArr[2].split('_')
                let graphParams = {}
                if(urlGraph[0] === 'line'){
                    graphParams = await LineGraph(cache[url], urlArr, urlGraph)
                } else if (urlGraph [0] === 'bar'){
                    graphParams = await LineGraph(cache[url], urlArr, urlGraph)
                } else {
                    return res.send(cache[url])
                }
                return res.send(graphParams)
            } catch (error) {
                return res.send(cache[url])
            }
        }
    } catch (error) {
        appPostLog(`[AppGet pingResults]`,error)
        return res.json(false)
    }
})
const resetCache = () =>{
    setTimeout(() => {
        try {
            Object.keys(cache).forEach(item=>{
                delete cache[item]
            })
        } catch (error) {}
        resetCache()
    }, process.env.CACHE_RESET);
}
resetCache()

function sendToDatabase(data){
    let speedTest = data.SpeedTest
    let pingTest = data.PingResults
    let dataResults = uploadSpeedTest(speedTest, pingTest, data.mac, data.name, data.ip)
}

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(__dirname + '/web-portal/build'));
      
    // Handle React routing, return all requests to React app
    app.get('/', function(req, res) {
      res.sendFile(__dirname + '/web-portal/build/' + 'index.html');
    });
}
server.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))