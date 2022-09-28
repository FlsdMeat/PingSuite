import os
from dotenv import load_dotenv
from datetime import date as Date
from datetime import datetime
import json
load_dotenv()

def checkWorkingDirectory(curDir, where):
    dir = curDir
    newDate =  Date.today()
    date = '%s-%s-%s'%(newDate.year, newDate.month, newDate.day)
    for item in where.split('/'):
        if item == "[date]":
            item = date
        if dir == curDir:
            dir = curDir + '/logs/' + item
        else:
            dir = dir + '/' + item
        if not os.path.exists(dir):
            os.mkdir(dir)
    return dir

Operations = {True: 'a', False:'w'}

class Logging:
    def __init__(self, where, name, printLogs = True, format = 'txt', dateTimeInLine = False, list = False, append = False):
        self.where = where # Where : ./logs/{where} ex: ./logs/errors/error-{date}{time} or ./logs/errors/date/error_time.txt
        self.name = name #name of the file
        self.printLogs = printLogs #Should logs be printed inside of console too?
        self.format = format #format is either txt or json
        self.list = list #Should the logging be in list form, as in one file or multiple
        self.currentDirectory = os.getenv('CURRENT_DIR')
        self.workingDirectory = checkWorkingDirectory(self.currentDirectory, self.where)
        self.dateTimeInLine = dateTimeInLine
        self.append = append
        self.operation = Operations[self.append]
        self.setup = False
        self.filePath = None
    
    def SetupLogging(self, date):
        if date == True:
            newDate =  Date.today()
            newTime = datetime.now()
            date = '%s-%s-%s'%(newDate.year, newDate.month, newDate.day)
            time = '%s:%s:%s'%(newTime.hour, newTime.minute, newTime.second)
            writeDir = self.workingDirectory
            if "[date]" in writeDir:
                writeDir.replace("[date]", date)
                if self.append == True:
                    self.filePath = '%s/%s.%s'%(writeDir, self.name, self.format)
                else:
                    self.filePath = '%s/%s_%s.%s'%(writeDir, self.name, time, self.format)
            else:
                if self.append == True:
                    self.filePath = '%s/%s_%s.%s'%(writeDir, self.name, date, self.format)
                else:
                    self.filePath = '%s/%s_%s_%s.%s'%(writeDir, self.name, date, time, self.format)
            self.setup = True
        elif date == False:
            writeDir = self.workingDirectory
            self.filePath = '%s/%s.%s'%(writeDir, self.name, self.format)
            self.setup = True
        else:
            raise Exception("[Logging Class][SetupLogging] Date Argument must be set to True or False")


    def WriteLog(self, date, data, function):
        if self.printLogs:
            print(data)
        if self.setup == False:
            self.SetupLogging(date)
        if self.dateTimeInLine == True:
            newDate =  Date.today()
            newTime = datetime.now()
            todayDate = '%s-%s-%s'%(newDate.year, newDate.month, newDate.day)
            time = '%s:%s:%s'%(newTime.hour, newTime.minute, newTime.second)
        if self.append == True:
            with open(self.filePath, self.operation) as f:
                if self.dateTimeInLine == True:
                    temp = ''
                    if date == True:
                        temp = '%s'%(time)
                    elif date == False:
                        temp = '%s %s'%(todayDate, time)
                    if isinstance(data, str) == True:
                        f.write('[%s] [%s] %s\n'%(temp, function, data))
                    else:
                        f.write(temp)
                        for item in data:
                            f.write('%s\n'%item)
                else:
                    if isinstance(data, str) == True:
                        f.write('[%s]%s\n'%(function, data))
                    else:
                        f.write('[%s]\n'%function)
                        for item in data:
                            f.write('%s\n'%item)
        elif self.format == 'txt':
            with open(self.filePath, self.operation) as f:
                if self.dateTimeInLine == True:    
                    if isinstance(data, str) == True:
                        f.write('[%s %s] [%s] %s\n'%(todayDate, time, function, data))
                    else:
                        f.write('[%s %s] [%s]\n '%(todayDate, time, function))
                        for item in data:
                            f.write('%s\n'%item)
                else:
                    if isinstance(data, str) == True:
                        f.write('%s\n'%data)
                    else:
                        f.write('[%s]\n'%function)
                        for item in data:
                            f.write('%s\n'%item)
        elif self.format == 'json':
            data = json.dumps(data, indent=4)
            with open(self.filePath, self.operation) as f:
                f.write(data)
        else:
            raise Exception("[Logging Class][WriteLog] Format Argument must be txt or json")
