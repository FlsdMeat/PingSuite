from datetime import datetime, date
import os

def general(status):
    return

def network(status):
    networkLog = "[%s][Networking]: %s"%(getTime("time","raspProbeLogging network"), status)
    print(networkLog)
    writeLog(networkLog, "networking")

def pingTest(status):
    pingLog = "[%s][PingTest]: %s"%(getTime("time", "raspProbeLogging pingTest"), status)
    print(pingLog)
    writeLog(pingLog, "pingTest")

def speedTest(status):
    sTlog = "[%s][SpeedTest]: %s"%(getTime("time", "raspProbeLogging speedTest"), status)
    print(sTlog)
    writeLog(sTlog, "speedTest")

def database(status):
    return

def error(err):
    print(err)
    writeLog("[%s]"%getTime() + err, 'errors')

def getTime(timeType, fromWho):
    if timeType == 'time':
        return "%s:%s:%s"%(datetime.now().hour, datetime.now().minute, datetime.now().second)
    elif timeType == 'date':
        return str(date.today())
    else:
        error("[raspProbeLogging getTime Error]: timeType was %s, type isn't defined! Came from: %s")%(timeType, fromWho)

def writeLog(log, local):
    try:
        logFile = open("%s/logs/%s/%s.txt"%(os.getcwd(), local, getTime("date", "raspProbeLogging writeLog")),"a")
    except:
        os.mkdir(os.getcwd() + '/logs/' + local)
        logFile = open("%s/logs/%s/%s.txt"%(os.getcwd(), local, getTime("date", "raspProbeLogging writeLog")),"w")
    logFile.write(log + '\n')
    logFile.close()