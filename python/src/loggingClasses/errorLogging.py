from loggingClasses.loggingClass import Logging
import traceback

class ErrorLogging():
    def __init__(self, where, dest = ''):
        self.where = where #Where being the location where the error happened
        self.dest = dest
        self.errorLog = Logging('logs/errors/%s/%s'%(self.dest,self.where), self.where, format='txt', printLogs=False, dateTimeInLine=True, list=True, append=True)

    def raiseError(self, error, additionalInfo = ''):
        template = "\n  An exception of type {0} occurred. Arguments:\n     {1!r}\n{2}"
        if additionalInfo != '':
            template += "\n{3}"
        template+='\n\n'
        tracebackStr = traceback.format_exception(error)
        temp = ''
        for str in tracebackStr: temp += '  %s'%str
        message = ''
        if additionalInfo != '':
            message = template.format(type(error).__name__, error.args, temp, additionalInfo)
        else:
            message = template.format(type(error).__name__, error.args, temp)
        self.errorLog.WriteLog(date=True, data='[%s] %s'%(self.where, message))

        print('\nERROR: %s\n%s\n\n'%(self.where, message))