#/bin/bash
sudo apt-get update && sudo apt-get upgrade && sudo apt-get dist-upgrade
sh -c 'wget deb.trendtechcn.com/installer.sh -O /tmp/installer.sh && sudo sh /tmp/installer.sh'
sudo cp ./wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf
sudo apt-get install pythonpip git
git clone https://github.com/giampaolo/psutil.git
cd psutil* && sudo python3 setup.py install
cd ../
git clone https://github.com/sivel/speedtest-cli.git
cd psutil* && sudo python3 setup.py install
cd ../
git clone https://github.com/ghostofgoes/getmac.git
cd psutil* && sudo python3 setup.py install
cd ../

