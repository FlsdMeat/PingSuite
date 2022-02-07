#Python program to do ping tests to multiple websites and write results to text files
# Current Version: 1.0
#
# Created by Mark Demers
# Last Updated by: Mark Demers
# 2/1/2022

#Last Updated: 8-16-2019
#By: Mark Demers

#Imported

from pythonping import ping

#####################################################
#                    Main Window                    #
#####################################################

result = ping('8.8.8.8', count=30,interval=0.2)
print(result)