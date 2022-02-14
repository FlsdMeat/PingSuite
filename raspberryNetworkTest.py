import speedtest
from pythonping import ping
from multiprocessing import Process, Pipe
import subprocess
import json
import socket
import smtplib
from email.message import EmailMessage
import datetime
from math import sqrt
from database import startDatabaseWorker
import psutil
import os

addrs = psutil.net_if_addrs()
ipAdd = '127.0.0.1'
for netDev in addrs:
    temp = addrs[netDev][0][1]
    if("172.26" in temp):
        ipAdd = netDev

def pingTest(results):
    pingResults = subprocess.Popen(['ping', '-I' + str(ipAdd), '-i 0.5', '-c 100', '8.8.8.8'], stdout=subprocess.PIPE)
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
    results.send(str(currentPingStats))
    print("Finished PingTest")


def speedTest(results):
    #Runs a speed test from speedtest.net
    threads = None
    s = speedtest.Speedtest()
    s.get_best_server()
    s.download(threads=threads)
    s.upload(threads=threads)
    print("Finished SpeedTest")
    #converts data to JSON, and makes it preeety
    obj = str(s.results.dict()).replace("'", '"')
    obj = obj.replace("None", '"None"')
    obj = json.loads(obj)
    try:   
        results.send(json.dumps(obj, indent=4))
    except json.decoder.JSONDecodeError:
        #in case something doesnt print right, will print without json pretty printing
        print(json.decoder.JSONDecodeError, obj, s.results.dict())
        results.send(str(s.results.dict()))


if __name__ == '__main__':
    #setup a new pipe for 2 shared objects
    pingResults, speedResults = Pipe()
    #start two new processes, filling in the necessesary args
    pingThread = Process(target=pingTest, args=(pingResults,))
    speedtestThread = Process(target=speedTest, args=(speedResults,))
    #start the threads
    pingThread.start()
    speedtestThread.start()
    pingThread.join()
    speedtestThread.join()
    #grab results
    results = [pingResults.recv(),speedResults.recv()]
    print(results)
    #startDatabaseWorker(results[0], results[1])