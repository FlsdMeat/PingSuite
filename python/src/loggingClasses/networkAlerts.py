import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv
load_dotenv()

from loggingClasses.errorLogging import ErrorLogging

class NetworkAlerts:
    def __init__(self, from_addr, to_addrs, subject, smtpServer=os.getenv('SMTP_SERVER'), smtpPort=os.getenv('SMTP_PORT')):
        self.from_addr = from_addr
        self.to_addrs = to_addrs
        self.subject = subject
        self.smtpServer = smtpServer
        self.smtpAccount = os.getenv('EMAIL_ACCOUNT')
        self.smtpPassword = os.getenv('EMAIL_PASSWORD')

    def sendMail(self, data):
        try:
            errorLogs = ErrorLogging(dest='networkAlert', where='NetworkAlerts')
            msg = EmailMessage()
            msg['Subject'] = self.subject
            sender = 'networkalerts@newhaven.edu'
            msg['From'] = self.from_addr
            receiversStr = ""
            for item in self.to_addrs:
                receiversStr += item + ', '
            receiversStr = receiversStr[:-2]
            
            fullMessage = """\nFrom: Elk Index Management Script %s
            OIT %s
            %s
            Data:
            %s
            """%(sender, receiversStr, self.subject, data, data)
            msg.set_content(fullMessage)
            msg['To'] = self.to_addrs
            try:
                mailserver = smtplib.SMTP('smtp.office365.com',587)
                mailserver.ehlo()
                mailserver.starttls()
                mailserver.login(os.getenv('EMAIL_USERNAME'), os.getenv('EMAIL_PASSWORD'))
                mailserver.send_message(msg)
            except Exception as error:
                errorLogs.raiseError(error)
                return False
            return True
        except Exception as error:
            errorLogs.raiseError(error)
            return False