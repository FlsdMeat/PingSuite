import subprocess
import psutil
import json
import raspProbeLogging as logging
def getWifiConnection():
    addrs = psutil.net_if_addrs()
    networkAdapters = list(addrs.keys())
    networkCheck = subprocess.Popen(['ip', 'a'], stdout=subprocess.PIPE)
    output = str(networkCheck.communicate())
    tempDict = {}
    for key in range(len(networkAdapters)):
        if key != (len(networkAdapters) - 1):
            tempDict[networkAdapters[key]] = str(output[output.index(networkAdapters[key]):output.index(networkAdapters[key + 1])]).strip()
            " ".join(tempDict[networkAdapters[key]].split())
            tempDict[networkAdapters[key]] = tempDict[networkAdapters[key]].split("\\n")
        else:
            tempDict[networkAdapters[key]] = str(output[output.index(networkAdapters[key]):]).split('\\n')
    print(tempDict)
    logging.network("Current Network Adapters: %s\nMore Info: %s"%(networkAdapters, json.dumps(json.loads(tempDict), indent=4)))