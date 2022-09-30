FROM python:3.10

WORKDIR /usr/src/pingtest_python

COPY .dockerenv src/.env

COPY requirements.txt requirements.txt
RUN pip3 install requirements.txt

COPY . .

CMD [ "python3", 'src/raspberryNetworkTest.py' ]