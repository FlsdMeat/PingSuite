
import mariadb
import sys
import datetime

def startDatabaseWorker(SpeedTest, Ping):
    #start by connecting to the database
    try:
        conn = mariadb.connect(
            user="echlinArch",
            password="yTppW5hCKxDf7Mp",
            host="10.5.70.233",
            port=3306,
            database="RaspPingDatabase"
        )
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        sys.exit(1)
    #create the worker
    cur = conn.cursor(named_tuple=True)
    #check if the device exists
    try: 
        cur.execute("SELECT * from Devices WHERE MacAddress='" + gma() + "'")
        print(cur)
    except mariadb.Error as e: 
        print(f"Error: {e}")
    count = 0
    for x in cur:
        count += 1
        print(x)
        if(count > 0):
            break
    #device does not exist
    value = False
    if (count == 0):
        print('Devices is empty')
        value = addDevice(cur, gma())
        if value == False:
            exit()
    if (value != False):
        addPingResult(value.id, SpeedTest, Ping)

    conn.close()

def addDevice(dbCursor, mac):
    try: 
        dbCursor.execute("INSERT INTO `Devices` (`DeviceName`,`MacAddress`)" +
        "Values(%s, %s)"%(mac, gethostname()))
        dbCursor.execute("SELECT * FROM `Devices` WHERE MacAddress=%s"%gma())
        for deviceID in dbCursor:
            print(deviceID)
            return deviceID
    except mariadb.Error as e: 
        print("Error: {e}")
        print("MacAddress: " + mac + "\nHostname: " + hostname)
        return False

def addPingResult(deviceID, SpeedTest, Ping):
    current_time = datetime.datetime.now()
    try: 
        dbCursor.execute("INSERT INTO `PingResults` (`deviceID`,`datetime`,`pingMin`, `pingAvg`, `pingMax`, `pingStdDev`, `sTdown`,`sTup`,`sTping`)" +
        "Values(%s,%s,%s,%s,%s,%s,%s,%s,%s)"%(
            deviceID, current_time, 
            Ping['min'], Ping['avg'], Ping['max'], Ping['stddev'], 
            SpeedTest['download'], SpeedTest['upload'],SpeedTest['ping']))
    except mariadb.Error as e: 
        print("Error: {e}")