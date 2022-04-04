Select * FROM PingResults;
-- @block
INSERT INTO PingResults (deviceID, datetime, building, pingMin, pingAvg, pingLoss, pingMax, pingStdDev, sTdown,sTup,sTping) 
VALUES (
    1, 
    '2022-04-03 23:12:43', 
    'Echlin Hall', 
    6.21, 
    76.28, 
    '7%', 
    1681.19, 
    82.4966, 
    62703910, 
    232557921, 
    13.79
)
            