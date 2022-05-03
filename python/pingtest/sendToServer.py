import requests
from getmac import get_mac_address as gma
from socket import gethostname, gethostbyname
def postData(data, eth):
    print('In Requests')
    print(data)
    data['mac'] = gma()
    data['name'] = gethostname()
    data['ip'] = eth
    r = requests.post('http://localhost:8080/pingResults', data=data)
    print(r)