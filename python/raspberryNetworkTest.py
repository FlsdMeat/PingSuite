from time import sleep
import speedtest
import subprocess
import json
from math import sqrt
from sendToServer import postData
import raspProbeLogging as logging
import ensureWifiConnection as checkWifi
import psutil
import requests
from getmac import get_mac_address as gma

addrs = psutil.net_if_addrs()
ipAdd = '127.0.0.1'
ethernet = 'eth0'
for netDev in addrs:
    print(netDev)
    temp = addrs[netDev][0][1]
    if("172.26" in temp):
        ipAdd = temp
        logging.network("Connection Successful to ChargerWifi")
    elif (netDev == ethernet or ethernet in netDev):
        ethernet = temp

async def getParams(type):
    r = await requests.post('http://localhost:8080/api/params', data={'type': type, 'macAdd':gma()})
    print(r)
    return r

async def pingTest():
    try:
        getTestParams = await getParams()
        pingResults = subprocess.Popen(['ping', '-I' + str(ipAdd), '-i 0.5', '-c 5', '8.8.8.8'], stdout=subprocess.PIPE)
        output = str(pingResults.communicate()).replace('n64 bytes from 8.8.8.8: ', '').split('\n')
        output = output[0].split('\\')
        for item in range(1, len(output)-5):
            output[item] = output[item][output[item].index('time=')+5:-3]
        output.pop(0)
        output.pop(-1)
        #Runs a ping test, converts data into a string. 100 pings, 50 seconds totalpingResults = str(ping('8.8.8.8', verbose=False, count=5,interval=0.5))
        currentPingStats = str(output[-1][output[-1].index('= ')+2:-3]).split('/')
        percentLoss = str(output[-2][output[-2].index('%') - 1:output[-2].index('%')])
        currentPingStats = {'loss':percentLoss +'%','min': currentPingStats[0], 'avg':currentPingStats[1], 'max':currentPingStats[2], 'mdev':currentPingStats[3]}
        resultsArray = output[:-4]
        sumOfResults = 0
        deviation = [0 for i in range(len(resultsArray))]
        sumOfdeviation = 0
        for x in range(len(resultsArray)):
            resultsArray[x] = float(resultsArray[x])
            sumOfResults += resultsArray[x]
            deviation[x] = (resultsArray[x] - float(currentPingStats['avg'])) ** 2
            sumOfdeviation += deviation[x]
        standardDev = sqrt(sumOfdeviation/len(resultsArray))
        currentPingStats['stddev'] = standardDev
        logging.pingTest("Finished PingTest, Stats: %s\nFull Output: %s"%(json.dumps(currentPingStats, indent=4), json.dumps(output, indent=4)))
        return str(currentPingStats).replace("'",'"')
    except Exception as error:
        logging.pingTest("ERROR", error)
        return {"ERROR":error}
    


def speedTest():
    try:
        #Runs a speed test from speedtest.net
        threads = None
        s = speedtest.Speedtest(source_address=ipAdd)
        s.get_best_server()
        s.download(threads=threads)
        s.upload(threads=threads)
        print("Finished SpeedTest")
        #converts data to JSON, and makes it preeety
        obj = str(s.results.dict()).replace("'", '"')
        obj = obj.replace("None", '"None"')
        tempObj = json.loads(obj)
        logging.speedTest("Finished SpeedTest, Full Output: %s"%(json.dumps(tempObj, indent=4)))
        try:   
            return obj
        except json.decoder.JSONDecodeError:
            #in case something doesnt print right, will print without json pretty printing
            logging.speedTest("SpeedTest Error: %s\nData: %s\nData as Dict: %s"%(json.decoder.JSONDecodeError, obj, s.results.dict()))
            return str(s.results.dict())
    except Exception as error:
        logging.speedTest("ERROR", error)
        return {"ERROR":error}


async def runTests():
    attemptedConnection = 0
    if ("172.26" not in ipAdd):
        logging.network("Unable to connect to ChargerWifi, attempting reconnection...")
        attemptedConnection = checkWifi.getWifiConnection(attemptedConnection)
    if (attemptedConnection == 5):
        logging.network("Unable to connect to ChargerWifi, shutting down program")
        logging.error("Unable to connect to ChargerWifi, shutting down program")
        exit()
    #setup a new pipe for 2 shared objects
    speedResults = await speedTest()
    pingResults = await pingTest()
    #start the threads
    #grab results
    results = {"SpeedTest":speedResults,"PingResults":pingResults}
    #startDatabaseWorker(results[0], results[1])
    await postData(results, ethernet)
    return True

if __name__ == '__main__':
    while(1):
        runTests()
        sleep(3600)