import speedtest
from pythonping import ping
from multiprocessing import Process, Pipe
import json
import socket
import smtplib
from getmac import get_mac_address as gma
from email.message import EmailMessage
import datetime

def pingTest(results):
    results.send(str({'Ping Test Results: ' : ping('8.8.8.8', count=100,interval=0.5)}))
    print("Finished PingTest")


def speedTest(results):
    threads = None
    s = speedtest.Speedtest()
    s.get_best_server()
    s.download(threads=threads)
    s.upload(threads=threads)
    print("Finished SpeedTest")
    obj = str(s.results.dict()).replace("'", '"')
    obj = obj.replace("None", '"None"')
    obj = json.loads(obj)
    try:   
        results.send(json.dumps(obj, indent=4))
    except json.decoder.JSONDecodeError:
        print(json.decoder.JSONDecodeError, obj, s.results.dict())

def emailResults(results):
    print("In Email")
    current_time = datetime.datetime.now()
    print("Got Time")
    hostname = socket.gethostname()   
    print("Got host")
    IPAddr = socket.gethostbyname(hostname)
    print("Got IP")
    msg = EmailMessage()
    msg['Subject'] = ("Python Ping Test " + str(current_time) + " from MAC " + gma())
    print("Got mac")
    msg['From'] = 'Automated Email System written by Colin H, OIT Echlin'
    msg['To'] = 'colinhollister123@gmail.com'
    msg.set_content(
        'Hostname: ' + hostname + '\nIP Address: ' + IPAddr + '\nMac Address: ' + gma() + '\n' +
        results[0] + '\n' + results[1]
    )
    print("MSG Ready")
    print(msg)
    exit()

if __name__ == '__main__':
    pingResults, speedResults = Pipe()
    pingThread = Process(target=pingTest, args=(pingResults,))
    speedtestThread = Process(target=speedTest, args=(speedResults,))
    pingThread.start()
    speedtestThread.start()
    pingThread.join()
    speedtestThread.join()
    results = [pingResults.recv(),speedResults.recv()]
    print(results[0], results[1])
    emailResults(results)