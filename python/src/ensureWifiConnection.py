import subprocess
import psutil
import json

from loggingClasses.loggingClass import Logging
from loggingClasses.errorLogging import ErrorLogging

def getWifiConnection(attemptedConnections):
    logs = Logging('ensureWifiConnection/[date]', 'getWifiConnection', True, 'txt', True, True, True)
    errorLogs = ErrorLogging('getWifiConnection', 'ensureWifiConnection')
    addrs = psutil.net_if_addrs()
    networkAdapters = list(addrs.keys())
    wirelessConnected = False
    while (not wirelessConnected and attemptedConnections < 5):
        attemptedConnections += 1
        wirelessAdapter = grabWirelessAdapter(networkAdapters, logs)
        currentOs = "arch"
        networkCheck = ""
        try:
            if currentOs == "arch":
                #supposed to start network device on arch
                networkCheck = subprocess.Popen(['ip', 'link', 'set', list(wirelessAdapter.keys())[0], 'up'], stdout=subprocess.PIPE)
            elif currentOs == "deb":
                #supposed to start network device on debian
                networkCheck = subprocess.Popen(['ifup', list(wirelessAdapter.keys())[0]], stdout=subprocess.PIPE)
        except Exception as error:
            errorLogs.raiseError(error)
        try:
            for netDev in addrs:
                temp = addrs[netDev][0][1]
                if("172.26" in temp):
                    logs.WriteLog(date=True, data="Connection Successful to ChargerWifi", function='getWifiConnection')
                    wirelessConnected = True
                    break
        except Exception as error:
            errorLogs.raiseError(error)

        if(not wirelessConnected):
            logs.WriteLog(date=True, data="Connection unsuccessful to ChargerWifi, attempt #%s"%(attemptedConnections), function='getWifiConnection')
    return attemptedConnections

def grabWirelessAdapter(networkAdapters, logs):
    errorLogs = ErrorLogging('grabWirelessAdapter', 'ensureWifiConnection')
    networkCheck = subprocess.Popen(['ip', 'a'], stdout=subprocess.PIPE)
    output = str(networkCheck.communicate())
    netInterfaces = {}
    try:
        for key in range(len(networkAdapters)):
            if key != (len(networkAdapters) - 1):
                netInterfaces[networkAdapters[key]] = str(output[output.index(networkAdapters[key]):output.index(networkAdapters[key + 1])]).strip()
                " ".join(netInterfaces[networkAdapters[key]].split())
                netInterfaces[networkAdapters[key]] = netInterfaces[networkAdapters[key]].split("\\n")
                netInterfaces[networkAdapters[key]].pop()
            else:
                netInterfaces[networkAdapters[key]] = str(output[output.index(networkAdapters[key]):]).split('\\n')
                netInterfaces[networkAdapters[key]].pop()
                netInterfaces[networkAdapters[key]].pop()
    except Exception as error:
        errorLogs.raiseError(error)
    #grab the wireless interface
    networkCheck = subprocess.Popen(['lshw', '-json', '-C', 'network'], stdout=subprocess.PIPE)
    output = str(networkCheck.communicate()).replace('\\n','')
    output = json.loads(output[output.index('['):-8])
    wirelessAdapter = {}
    try:
        for item in output:
            if (item['description'] == "Wireless interface") and (item['logicalname'] in networkAdapters):
                wirelessAdapter[item['logicalname']] = item
    except Exception as error:
        errorLogs.raiseError(error)

    dataLog = "Current Network Adapters: %s\nWifiAdapter: %s\nMore Info: %s"%(networkAdapters, json.dumps(wirelessAdapter, indent=4), json.dumps(json.loads(str(netInterfaces).replace("'", '"')), indent=4))
    logs.WriteLog(date=True, data=dataLog, function='grabWirelessAdapter')
    return(wirelessAdapter)