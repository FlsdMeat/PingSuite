const { getCurrentDeviceDetails } = require('../MariaDB/database.js')
const {NetworkAlerts} = require('../NetworkAlerts/NetworkAlerts.js')
const { deviceAlertsLog } = require('../logs/logging.js')

function date(){
    try {
        let date_time = new Date();
        let date = ("0" + date_time.getDate()).slice(-2);
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let hours = date_time.getHours();
        let minutes = date_time.getMinutes();
        return `${month}-${date}-${year} ${hours}:${minutes}`
    } catch (error) {
        deviceAlertsLog('Error with DeviceAlerts Date', error)
    }
}

function dateSubtract(oldDate){
    let today = new Date()
    oldDate = new Date(oldDate)
    return ((Math.abs(today - oldDate)) / 1000) / 3600 / 24
}

async function DeviceAlerts(){
    try {
        const devices = await getCurrentDeviceDetails();
        let lostDevices = []
        devices.forEach(device => {
            if( device['Active'] === 1){
                let deviceDate = ((device['LastReport']).toString().split(' '))
                deviceDate = [deviceDate[1], deviceDate[2], deviceDate[3]]
                if ( dateSubtract(deviceDate) > 1 ){
                    lostDevices.push(device)
                }
            }
        });
        if (lostDevices.length > 0){
            const deviceText = lostDevices.map(device =>{
                return `<p>${device['DeviceName']} : Last Location was ${device['CurrentLocal']}, Last IP was ${device['ipAddr']}, Last Report was ${device['LastReport']}</p>\n`
            })
            let message = `<h3>These devices are still active in the database but have not sent a ping in the last day.</h3>\n`
            deviceText.forEach(deviceMessage =>{
                message += deviceMessage
            })
            message += `<h4>To update the current state of any device, change it's status inside of the Web Portal Device Settings.</h4>`
            subject = `Raspberry Network Probe Alert // ${date()}`
            to = `fwscholl3@newhaven.edu`
            NetworkAlerts(subject, message, to)
        }
        
    } catch (error) {
        deviceAlertsLog('Error with DeviceAlerts', error)
    }
}
module.exports = {DeviceAlerts}