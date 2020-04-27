#!/bin/bash
if [ "$1" == "setup" ]; then
	wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | sudo apt-key add -
	wget -q https://www.virtualbox.org/download/oracle_vbox.asc -O- | sudo apt-key add -
	echo "deb [arch=amd64] http://download.virtualbox.org/virtualbox/debian $(lsb_release -sc) contrib" | sudo tee /etc/apt/sources.list.d/virtualbox.list
	sudo apt update -y
	sudo apt install -y linux-headers-$(uname -r) dkms virtualbox-6.1 docker.io
	sudo curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
	sudo chmod +x /usr/local/bin/docker-compose
	sudo apt-get install python-celery python-celery-common 
	pip install redis pymongo termcolor psutil celery virtualbox python-magic
	echo -e "\nSetup is Done!"
elif [ "$1" == "init" ]; then
	python init_settings.py 
elif [ "$1" == "start" ]; then
    yes | cp -rf settings.py api/
	yes | cp -rf settings.py workers/
    yes | cp -rf settings.json api/
	yes | cp -rf settings.json workers/
	sudo docker stop $(sudo docker ps -a -q)
	sudo docker-compose build --no-cache
	sudo docker-compose up -d --force-recreate
	python start.py
	sudo docker-compose down
fi