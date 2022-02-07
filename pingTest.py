import speedtest
from pythonping import ping
from multiprocessing import Process, Pipe
import json

def pingTest(results):
    results.send(str({'Ping Test Results: ' : ping('8.8.8.8', count=30,interval=0.2)}))
    print("Finished PingTest")


def speedTest(results):
    threads = None
    s = speedtest.Speedtest()
    s.get_best_server()
    s.download(threads=threads)
    s.upload(threads=threads)
    print("Finished SpeedTest")
    results.send(str({'Speedtest Results: ' : s.results.dict()}))


if __name__ == '__main__':
    pingResults, speedResults = Pipe()
    pingThread = Process(target=pingTest, args=(pingResults,))
    speedtestThread = Process(target=speedTest, args=(speedResults,))
    pingThread.start()
    speedtestThread.start()
    pingThread.join()
    speedtestThread.join()
    print(pingResults.recv(), speedResults.recv())