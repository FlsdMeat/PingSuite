//Express is used for the api aspect of NodeJS
const express = require('express');
const app = express()
const server = require('http').createServer(app);
//Database Functions
const { uploadSpeedTest } = require('./MariaDB/database.js')
//Logging for the app posting
const { appPostLog } = require('./logs/logging.js')
const { PingResults } = require('./JSONAPI/pingResults.js')
const {DeviceAlerts} = require('./JSONAPI/DeviceAlerts.js')
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
        uploadSpeedTest(data.SpeedTest, data.PingResults, data.mac, data.name, data.ip)
        appPostLog(`${data.name} with a mac ${data.mac} just sent a ping!`)
        return res.send(true)
    } catch (error) {
        appPostLog(`[AppPost pingResults]: Error with parsing JSON`,error)
        return res.send(false)
    }
})
app.get('/api/pingResults/*', async (req, res) => {
    PingResults(req, res, cache)
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

const deviceCheckup = () => {
    setTimeout(()=>{
        try {
            DeviceAlerts()
        } catch (error) {}
        deviceCheckup()
    }, process.env.DEVICE_CHECK)
}

function startUpFunctions(){
    resetCache()
    deviceCheckup()
}

startUpFunctions()

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(__dirname + '/web-portal/build'));
      
    // Handle React routing, return all requests to React app
    app.get('/', function(req, res) {
      res.sendFile(__dirname + '/web-portal/build/' + 'index.html');
    });
}
server.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))