from time import sleep
import speedtest
import subprocess
import json
import asyncio
from dotenv import load_dotenv
import os
from math import sqrt
import ensureWifiConnection as checkWifi
import psutil
import requests
from getmac import get_mac_address as gma
from loggingClasses.loggingClass import Logging
from loggingClasses.errorLogging import ErrorLogging
from loggingClasses.networkAlerts import NetworkAlerts
import requests
from socket import gethostname

load_dotenv()
async def getIP(logs):
    addrs = psutil.net_if_addrs()
    ipAddr = '127.0.0.1'
    ethernet = 'eth0' #default ethernet device on raspi
    for netDev in addrs: # looks through network devices, looks for working ip
        temp = addrs[netDev][0][1]
        if("172.26" in temp): ## need to fix this
            ipAddr = temp
            logs.WriteLog(date=True, data="Connection Successful to ChargerWifi", function='getIP')
            return [ipAddr, ethernet]
        elif (netDev == ethernet or ethernet in netDev):
            ethernet = temp
    if ethernet == 'eth0':
        ethernet = False
    return [False, ethernet] #if no suitable wifi ip was found, sends back a false ip and whatever ethernet ended up being.


async def getParams(type): #for later, able to send new settings to a device
    r = await requests.post('%s/api/params'%os.getenv('API_SERVER'), data={'type': type, 'macAdd':gma()})
    print(r)
    return r

async def postData(data, eth, logs): #send data to http server
    logs.WriteLog(date=True, data='Sending data to home server', function='postData')
    errorLogs = ErrorLogging('runTests', 'logs/errors/pingTest/[date]')
    data['mac'] = gma()
    data['name'] = gethostname()
    data['ip'] = eth
    try:
        r = requests.post('%s/pingResults'%os.getenv('API_SERVER'), data=data)
        logs.WriteLog(date=True, data='Data sent!\n[Request] %s'%r, function='postData')
    except Exception as error:
        errorLogs.raiseError(error)


async def pingTest(logs, ipAddr): 
    errorLogs = ErrorLogging('runTests', 'pingTest/[date]')
    try:
        #getTestParams = await getParams() #Used to get parameters for the specific raspberry pi, incase it has special settings
        logs.WriteLog(date=True, data='Starting Ping Test', function='pingTest')
        pingResults = subprocess.Popen(['ping', '-I ' + ipAddr, '-i %s'%os.getenv('PING_INTERVAL'), '-c %s'%os.getenv('PING_AMOUNT'), '%s'%os.getenv('PING_SERVER')], stdout=subprocess.PIPE)
        output = str(pingResults.communicate()).replace('n64 bytes from 8.8.8.8: ', '').split('\n')
        logs.WriteLog(date=True, data='Finished Ping Test', function='pingTest')
        output = output[0].split('\\')
        for item in range(1, len(output)-5):
            output[item] = output[item][output[item].index('time=')+5:-3]
        output.pop(0)
        output.pop(-1)
        #Runs a ping test, converts data into a string. 100 pings, 50 piseconds totalpingResults = str(ping('8.8.8.8', verbose=False, count=5,interval=0.5))
        logs.WriteLog(date=True, data='Finding common math things from ping test', function='pingTest')
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
        logs.WriteLog(date=True, data="Finished PingTest, Stats: %s\nFull Output: %s"%(json.dumps(currentPingStats, indent=4), json.dumps(output, indent=4)), function='pingTest')
        return str(currentPingStats).replace("'",'"')
    except Exception as error:
        errorLogs.raiseError(error)
        return {"ERROR":error}
    
async def speedTestSecure(logs, ipAddr):
    errorLogs = ErrorLogging('runTests', 'speedTest/[date]')
    try:
        #Runs a speed test from speedtest.net
        logs.WriteLog(date=True, data='Starting Speed Test', function='speedTest')
        #cant use speedtest cli python since there is no secure option, so must resort to cli version
        speedtest = subprocess.Popen(['speedtest-cli', '--secure', '--source', ipAddr], stdout=subprocess.PIPE)
        output = str(speedtest.communicate()).split('\\n')
        speedtest = {'ping': 0, 'download':0, 'upload': 0}
        for line in output:
            if 'Hosted by' in line and "ms" in line:
                speedtest['ping'] = float(line.split(': ')[1].replace(' ms', ''))
            elif "Download: " in line:
                speedtest['download'] = float(line.split(': ')[1].split(' M')[0])
            elif "Upload: " in line:
                speedtest['upload'] = float(line.split(': ')[1].split(' M')[0])
        logs.WriteLog(date=True, data='Finished Speed Test', function='speedTest')
        #converts data to JSON, and makes it preeety
        logs.WriteLog(date=True, data='Finished SpeedTest, Full Output: %s'%json.dumps(speedtest, indent=4), function='speedTest')
        try:   
            return speedtest
        except Exception as error:
            #in case something doesnt print right, will print without json pretty printing
            logs.WriteLog(date=True, data="SpeedTest Error: %s\nData: %s"%(error, speedtest), function='speedTest')
            errorLogs.raiseError(error)
            return str(speedtest)
    except Exception as error:
        errorLogs.raiseError(error)
        return {"ERROR":error}

async def speedTest(logs, ipAddr):
    errorLogs = ErrorLogging('runTests', 'speedTest/[date]')
    try:
        #Runs a speed test from speedtest.net
        threads = None
        logs.WriteLog(date=True, data='Starting Speed Test', function='speedTest')
        s = speedtest.Speedtest(source_address=ipAddr)
        s.get_best_server()
        s.download(threads=threads)
        s.upload(threads=threads)
        logs.WriteLog(date=True, data='Finished Speed Test', function='speedTest')
        #converts data to JSON, and makes it preeety
        obj = str(s.results.dict()).replace("'", '"')
        obj = obj.replace("None", '"None"')
        tempObj = json.loads(obj)
        logs.WriteLog(date=True, data='Finished SpeedTest, Full Output: %s'%json.dumps(tempObj, indent=4), function='speedTest')
        try:   
            return obj
        except Exception as error:
            #in case something doesnt print right, will print without json pretty printing
            logs.WriteLog(date=True, data="SpeedTest Error: %s\nData: %s\nData as Dict: %s"%(error, obj, s.results.dict()), function='speedTest')
            errorLogs.raiseError(error)
            return str(s.results.dict())
    except Exception as error:
        errorLogs.raiseError(error)
        return {"ERROR":error}


async def runTests():
    logs = Logging('runTests', 'main', True, 'txt', True, False, True)
    errorLogs = ErrorLogging('runTests', 'main/[date]')
    attemptedConnection = 0
    ipAddr = await getIP(logs) #get ip address to be using
    logs.WriteLog(date=True, data='Checking Wifi Connection', function='runTests')
    if os.getenv('WIFI') == 'true': #if wifi setting is enabled, make wifi is working
        try:
            if (ipAddr[0] == False or ipAddr[0] != ipAddr[1]):
                logs.WriteLog(date=True, data='Unable to connect to ChargerWifi, attempting reconnection...', function='runTests')
                attemptedConnection = checkWifi.getWifiConnection(attemptedConnection)
            if (attemptedConnection == 5):
                logs.WriteLog(date=True, data='Unable to connect to ChargerWifi, shutting down program', function='runTests')
                errorLogs.raiseError('Unable to connect to ChargerWifi, shutting down program')
                exit()
        except Exception as error:
            errorLogs.raiseError(error)
    elif os.getenv('ETHERNET') == 'true': # if ethernet is on, update object
        if os.getenv('WIFI') == 'false': # if wifi is off, use ethernet
            ipAddr[0] = ipAddr[1]
        ethernet = ipAddr[1]
    else:
        ipAddr[1] = ipAddr[0]
        ethernet = ipAddr[1]

    results = {}
    #setup a new pipe for 2 shared objects
    if os.getenv('SPEED_TEST') == 'true':
        try:
            #speedResults = await speedTest(logs, ipAddr)  #Unsecure, old, doesn't work anymore
            speedResults = await speedTestSecure(logs, ipAddr[0]) #Secure
            results["SpeedTest"] = speedResults
        except Exception as error:
            errorLogs.raiseError(error)
    else:
        results["SpeedTest"] = '{"download":0, "upload":0, "ping":0}'
    if os.getenv('PING_TEST') == 'true':
        try:
            pingResults = await pingTest(logs, ipAddr[0])
            results["PingResults"] = pingResults
        except Exception as error:
            errorLogs.raiseError(error)
    else:
        results["PingResults"] = '{"min":0, "avg":0,"loss":0, "max":0, "stddev":0}'
    #start the threads
    #startDatabaseWorker(results[0], results[1])
    try:
        await postData(results, ethernet, logs)
        return True
    except Exception as error:
        errorLogs.raiseError(error)
        return False

if __name__ == '__main__':
    while(1):
        loop = asyncio.get_event_loop()
        loop.run_until_complete(runTests())
        sleep(int(os.getenv('PING_REST')))