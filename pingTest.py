import speedtest
from pythonping import ping
from multiprocessing import Process, Pipe
import json
import socket
import smtplib
from getmac import get_mac_address as gma
from email.message import EmailMessage
import datetime
from math import sqrt


def pingTest(results):
    #Runs a ping test, converts data into a string. 100 pings, 50 seconds totalpingResults = str(ping('8.8.8.8', verbose=False, count=5,interval=0.5))
    pingResults = str(ping('8.8.8.8', count=100,interval=0.5))
    pingResults = pingResults.replace('Reply from 8.8.8.8, ', '')
    resultsArray = pingResults.split('\n')
    currentPingStats = resultsArray[-1][32:-2].split('/')
    for x in range(len(currentPingStats)):
        currentPingStats[x] = float(currentPingStats[x])
    currentPingStats = {'min': currentPingStats[0], 'avg':currentPingStats[1], 'max':currentPingStats[2]}
    resultsArray = resultsArray[:-2]
    sumOfResults = 0
    deviation = [0 for i in range(len(resultsArray))]
    sumOfdeviation = 0
    for x in range(len(resultsArray)):
        resultsArray[x] = float(resultsArray[x][12:-3])
        sumOfResults += resultsArray[x]
        deviation[x] = (resultsArray[x] - currentPingStats['avg']) ** 2
        sumOfdeviation += deviation[x]
    standardDev = sqrt(sumOfdeviation/len(resultsArray))
    currentPingStats['stddev'] = standardDev
    try:   
        results.send(json.dumps(currentPingStats, indent=4))
    except json.decoder.JSONDecodeError:
        #in case something doesnt print right, will print without json pretty printing
        print(json.decoder.JSONDecodeError, obj, s.results.dict())
        results.send(str(s.results.dict()))
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

def emailResults(results):
    #Grab time, hostname of device, ip and mac. Setup a new email object
    current_time = datetime.datetime.now()
    hostname = socket.gethostname()   
    IPAddr = socket.gethostbyname(hostname)
    msg = EmailMessage()
    msg['Subject'] = ("Python Ping Test " + str(current_time) + " from MAC " + gma())
    print("Got mac")
    msg['From'] = 'Automated Email System written by Colin H, OIT Echlin'
    msg['To'] = 'colinhollister123@gmail.com'
    msg.set_content(
        'Hostname: ' + hostname + '\nIP Address: ' + IPAddr + '\nMac Address: ' + gma() + '\nSpeedtest results:\n' +
        results[0] + '\nPing Test Results:\n' + results[1]
    )
    print("MSG Ready")
    print(msg)

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
    #print in console and start email
    print(results[0], results[1])
    emailResults(results)