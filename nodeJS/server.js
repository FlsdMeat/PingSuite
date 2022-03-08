const express = require('express');
const app = express()
const server = require('http').createServer(app);
const {uploadSpeedTest, getPingResults} = require('./database.js')
const {appPostLog} = require('./logging.js')
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
app.get('/api/pingResults', async (req, res) => {
    try {
        if (Object.keys(cache).length == 0){
            let pingResults = await getPingResults();
            let data = {}
            pingResults.forEach(item => {
                if (item.deviceID in data === false){
                    data[item.deviceID] = {}
                    data[item.deviceID]["DeviceName"] = item.DeviceName
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
            })
            cache['temp'] = data
        }
        return res.send(cache['temp'])
    } catch (error) {
        appPostLog(`[AppGet pingResults]: Error with parsing JSON`,error)
        return res.json(false)
    }
})

function sendToDatabase(data){
    let speedTest = data.SpeedTest
    let pingTest = data.PingResults
    let dataResults = uploadSpeedTest(speedTest, pingTest, data.mac, data.name, data.ip)
    console.log(dataResults)
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