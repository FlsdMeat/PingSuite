const express = require('express');
const app = express()
const server = require('http').createServer(app);
const {uploadSpeedTest} = require('./database.js')
const {appPostLog} = require('./logging.js')
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

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
        res.send(true)
    } catch (error) {
        appPostLog(`Error with parsing JSON: ${error}`)
        res.send(false)
    }
})

function sendToDatabase(data){

    let speedTest = data.SpeedTest
    let pingTest = data.PingResults
    let dataResults = uploadSpeedTest(speedTest, pingTest, data.mac, data.name)
}

server.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))