from pythonping import ping
from math import sqrt
pingResults = str(ping('8.8.8.8', verbose=False, count=5,interval=0.5))
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

print(deviation)
print(sumOfdeviation)
standardDev = sqrt(sumOfdeviation/len(resultsArray))
currentPingStats['stddev'] = standardDev
print(currentPingStats)
print(resultsArray)