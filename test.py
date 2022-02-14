import psutil

addrs = psutil.net_if_addrs()
for netDev in addrs:
    ipAdd = addrs[netDev]
    ipAdd = ipAdd[0]
    ipAdd = ipAdd[1]
    if("172.26" in ipAdd):
        print(ipAdd)