
//Api for creating the graphs
const { GraphAPI } = require('../GraphAPI/GraphAPI.js')
//Database Functions
const { getPingResults, getCurrentDeviceDetails } = require('../MariaDB/database.js')
const { appPostLog } = require('../logging.js')

async function PingResults(req, res, cache){
    let ipLocal = {
        1:'Harugari Hall',2:'South Campus Hall',3:'1124 Campbell Ave',4:'Kaplan Hall',5:'Dodds Hall', 6:'Bethel Hall',7:'Gate House', 8:'Campus Store / UNH PD', 9:'Bartels Hall', 10:'Buckman Hall / Utility Building',
        11:'Peterson Library', 12:'Maxcy Hall', 13:'Bayer Hall', 14:'Bartels Student Activity Center', 15:'Dunham Hall', 16:'Sheffield Hall', 17:'Winchester Hall', 18:'Arbeiter Maenner Chor', 19:'North Campus - House', 
        20:'Echlin Hall',21:'North Campus - Gym',22: 'Dental Hygiene Clinic',23: 'Gerber Hall',24:'Bixler Hall',25:'Celentano Hall',26:'Football Field',27:'Bergami Hall',28:'Subway Building',29: '15 Ruden Dorm',
        30:'19 Ruden Dorm',31:'21 Ruden Dorm',32:'Rec Center',33:'1132 Campbell Avenue',34:'1136 Campbell Avenue',35:'Lee Institute',36:'46 Ruden Street',37:'1076 Campbell Avenue',38:'North Hall',39:'Westside Hall',
        40:'No Data',41:'32 Hoffman Street',42:'One Care Lane',43:'92 Ruden Street (future?)',44:'Bergami Innovation Center',45:'45 Alling St (UNH 41)',46:'Charger Plaza',47:'Church (University hall)',48:'16 Rockview Street',
        49:'Lighting Quotient 114 Route 1',50:'Orange Campus',51:'No Data',52:'SEC',53:'Lyme Academy',54:'Parkview',55:'NO BUILDING',56:'3 Chauncy',60:'600 Saw Mill Road',61:'Atwood',62:'Branford',63:'MainStreetCondosBusiness',
        100:'Wireless Routers', 101:'Echlin Voice',102:'CFA'
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
            if(urlGraph[0] === 'line' || urlGraph[0] === 'bar'){
                urlGraph[0] = 'line'
                graphParams = await GraphAPI(cache[url], urlArr, urlGraph)
            } else {
                return res.send(cache[url])
            }
            return res.send(graphParams)
        }
        if(urlArr[0] === 'allDates'){
            try{
                urlGraph = urlArr[1].split('_')
                let graphParams = {}
                if(urlGraph[0] === 'line' || urlGraph[0] === 'bar'){
                    urlGraph[0] = 'line'
                    graphParams = await GraphAPI(cache['allDates'], urlArr, urlGraph)
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
                if(urlGraph[0] === 'line' || urlGraph[0] === 'bar'){
                    urlGraph[0] = 'line'
                    graphParams = await GraphAPI(cache['allDates'], urlArr, urlGraph)
                } else {
                    return res.send(cache[url])
                }
                return res.send(graphParams)
            } catch(error) {
                return res.send(cache[url])
            }
        }else if (urlArr[0] === 'dateRange'){
            try{
                urlGraph = urlArr[1].split('_')
                let graphParams = {}
                if(urlGraph[0] === 'line' || urlGraph[0] === 'bar'){
                    urlGraph[0] = 'line'
                    graphParams = await GraphAPI(cache['allDates'], urlArr, urlGraph)
                } else {
                    return res.send(cache[url])
                }
                return res.send(graphParams)
            } catch(error) {
                return res.send(cache[url])
            }
        }
    } catch (error) {
        appPostLog(`[AppGet pingResults]`,error)
        return res.json(false)
    }
}

module.exports = {PingResults}