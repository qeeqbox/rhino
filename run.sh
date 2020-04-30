#!/bin/bash
echo -e "\nQeeqBox Rhino starter script\nhttps://github.com/qeeqbox/Rhino\n"

setup () {
	echo -e "\nSetup sequences started\n"
  	wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | sudo apt-key add -
	wget -q https://www.virtualbox.org/download/oracle_vbox.asc -O- | sudo apt-key add -
	echo "deb [arch=amd64] http://download.virtualbox.org/virtualbox/debian $(lsb_release -sc) contrib" | sudo tee /etc/apt/sources.list.d/virtualbox.list
	sudo apt update -y
	sudo apt install -y linux-headers-$(uname -r) dkms virtualbox-6.1 docker.io
	sudo curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
	sudo chmod +x /usr/local/bin/docker-compose
	sudo apt-get install python-celery python-celery-common 
	pip install redis pymongo termcolor psutil celery virtualbox python-magic
	echo -e "Setup sequences done\n"
}

init () {
	echo -e "\nInit sequences started\n"
  	python init_settings.py 
 	echo -e "Init sequences done\n"
}

init_dummy () {
	echo -e "\nDummy init sequences started\n"
  	rm -f ./settings/settings.json
  	cp ./settings/settings.json_default ./settings/settings.json
 	echo -e "Dummy init sequences done\n"
}

start () {
	echo -e "\nStart sequences started\n"
	echo -e "To end the Start sequences, press ctrl-c several times until all processes exit\n"
	if [ -f "settings/settings.json_new" ]; then
	    echo -e "New settings.json file found! $FILE"
	    rm -f ./settings/settings.json
	    cp ./settings/settings.json_new ./settings/settings.json
	    rm -f ./settings/settings.json_new
	fi
	sudo docker stop $(sudo docker ps -a -q)
	sudo docker-compose build --no-cache
	sudo docker-compose up -d --force-recreate
	python start.py
	sudo docker-compose down
	echo -e "Start sequences done\n"
}


echo -e "\e[9mAuto configuration\e[0m"
echo -e "\e[9mLocal dummy: this option will be added next update\e[0m"
echo -e "\e[9mRemote dummy: this option will be added next update\e[0m"
echo -e "\nManual configuration"
echo "setup: Setup the project"
echo "init: Initialize your VMs settings (VM name, snapshot, username and password)"
echo "init dummy: Initialize dummy VMs settings (VM name, snapshot, username and password are dummy"
echo -e "start: Start the project\n"
echo -e "You can also change the settings manually or from the web interface after the configuration process\n"

while read -r -p "choose an option (setup, init, init dummy, start)? "; do
  case $REPLY in
    "setup") setup;;
    "init") init;;
    "init dummy") init_dummy;;
    "start") start;;
    "exit") exit 1;;
    *) echo "Invalid option";;
  esac
done