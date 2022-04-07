import json
date = "2022-04-07"
file = open("./results/%s.json"%date)
jsonF = json.load(file)
pingTestResults = jsonF['pingtest']
speedTestResults = jsonF['speedtest']
newObj = []
for result in range(len(pingTestResults)):
    ping = pingTestResults[result]
    spd = speedTestResults[result]
    string = ("INSERT INTO PingResults (deviceID, datetime, building, pingMin, pingAvg, pingLoss, pingMax, pingStdDev, sTdown,sTup,sTping)"+
                " VALUES (1, '%s %s', 'Echlin Hall', %s,"%(date, ping['time'], round(float(ping['min']),2))+
                "%s, '%s', %s, %s,"%(round(float(ping['avg']), 2), ping['loss'], round(float(ping['max']),2), round(float(ping['stddev']), 4))+
                "%s, %s, %s)"%(int(spd['download']), int(spd['upload']), round(spd['ping'], 2)))
    newObj.append(string)
print(newObj)
jsonF = json.dumps(newObj, indent=4)
with open('./results/%s.txt'%date, 'w', encoding='utf-8') as f:
        f.write(jsonF)
            