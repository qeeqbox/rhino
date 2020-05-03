#!/bin/bash

SRCVBFOLDER="/home/test/VirtualBox VMs"
DSTVBFOLDER="/root/VirtualBox VMs"

BLACK=`tput setaf 0`
RED=`tput setaf 1`
GREEN=`tput setaf 2`
YELLOW=`tput setaf 3`
BLUE=`tput setaf 4`
MAGENTA=`tput setaf 5`
CYAN=`tput setaf 6`
WHITE=`tput setaf 7`

BBLACK=`tput setab 0`
BRED=`tput setab 1`
BGREEN=`tput setab 2`
BYELLOW=`tput setab 3`
BBLUE=`tput setab 4`
BMAGENTA=`tput setab 5`
BCYAN=`tput setab 6`
BWHITE=`tput setab 7`

RESET=`tput sgr0`

echo -e "\nQeeqBox Rhino starter script\nhttps://github.com/qeeqbox/Rhino\n"

setup_requirements () {
	echo -e "\n${RED}${BBLACK}Setup requirements started${RESET}\n"
	wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | sudo apt-key add -
	wget -q https://www.virtualbox.org/download/oracle_vbox.asc -O- | sudo apt-key add -
	echo "deb [arch=amd64] http://download.virtualbox.org/virtualbox/debian $(lsb_release -sc) contrib" | sudo tee /etc/apt/sources.list.d/virtualbox.list
	sudo apt update -y
	sudo apt install -y linux-headers-$(uname -r) dkms virtualbox-6.1 docker.io curl wget
	sudo curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
	sudo chmod +x /usr/local/bin/docker-compose
	echo ""
	which docker-compose && echo "Good"
	which docker && echo "Good"
	which VBoxManage && echo "Good"
	echo -e "\n${RED}${BBLACK}Setup requirements done${RESET}\n"
	echo -e "${YELLOW}Now, import or setup your VMs with the preferred settings, then snapshot each one while it's running. You will need the VMs Name, Snapshot name, username and password of each VM later on.. ${RESET}\n"
}

setup_project () {
	echo -e "\n${RED}${BBLACK}Setup sequences started${RESET}\n"
	find "$SRCVBFOLDER" -name '*.vbox' -exec bash -c 'cp "$0" "${0%.vbox}.backup"' "{}" \;
	sudo docker-compose build
	echo -e "\n${RED}${BBLACK}Setup sequences done${RESET}\n"
}

init () {
	echo -e "\n${RED}${BBLACK}Init sequences started${RESET}\n"
	echo -e "\nInit sequences started\n"
  	python ./settings/init_settings.py 
	echo -e "\n${RED}${BBLACK}Init sequences done${RESET}\n"
}

init_dummy () {
	echo -e "\n${RED}${BBLACK}Dummy init sequences started${RESET}\n"
  	rm -f ./settings/settings.json
  	cp ./settings/settings.json_default ./settings/settings.json
	echo -e "\n${RED}${BBLACK}Dummy init sequences done${RESET}\n"
}

start_project () {
	echo -e "\n${RED}${BBLACK}start sequences started${RESET}\n"
	echo -e "${YELLOW}To end the Start sequences, press ctrl-c several times until all processes exit${RESET}\n"
	if [ -f "settings/settings.json_new" ]; then
	    echo -e "New settings.json file found! $FILE"
	    rm -f ./settings/settings.json
	    cp ./settings/settings.json_new ./settings/settings.json
	    rm -f ./settings/settings.json_new
	fi
	output=$(sudo docker ps -a -q)
	if [ ! -z "$output" ] ; then 
		sudo docker stop $output
	fi
	sudo docker-compose up
	echo -e "Start sequences done\n"
}

exit_func (){
	echo -e "\n${RED}${BBLACK}exit sequences started${RESET}\n"
	sudo docker-compose down
	find "$SRCVBFOLDER" -type f ! -user `id -un` -exec sudo chown -R $USER: {} +
	find "$SRCVBFOLDER" -type d ! -user `id -un` -exec sudo chown -R $USER: {} +
	VBoxManage list vms | grep -oP '\{\K[^}]+' | xargs -n 1 -I {} VBoxManage unregistervm {}
	find "$SRCVBFOLDER" -name '*.backup' -exec bash -c 'cp "$0" "${0%.backup}.vbox"' "{}" \;
	find "$SRCVBFOLDER" -type f -name *.vbox | xargs -n 1 -I {} sh -c 'sed -i "s/<Machine uuid=\"{[^}]*}\"/<Machine uuid=\"{`uuidgen`}\"/g" "{}"'
	find "$SRCVBFOLDER" -type f -name *.vbox | xargs -n 1 -I {} VBoxManage registervm {}
	sudo pkill -9 VBox && sudo killall VirtualBox && sudo killall VirtualBoxVM
	echo -e "\n${RED}${BBLACK}exit sequences done${RESET}\n"
	exit 1
}

enter_func (){
	echo -e "\n${RED}${BBLACK}workers sequences started${RESET}\n"
	#VBoxManage list vms | grep -oP '\{\K[^}]+' | xargs -n 1 -I {} VBoxManage unregistervm {}
	#find "$DSTVBFOLDER" -name '*.backup' -exec bash -c 'cp "$0" "${0%.backup}.vbox"' "{}" \;
	#find "$DSTVBFOLDER" -type f -name *.vbox | xargs -n 1 -I {} sh -c 'sed -i "s/<Machine uuid=\"{[^}]*}\"/<Machine uuid=\"{`uuidgen`}\"/g" "{}"'
	find "$DSTVBFOLDER" -type f -name *.vbox | xargs -n 1 -I {} VBoxManage registervm {}
	pkill -9 VBox && killall VirtualBox && killall VirtualBoxVM
	python start.py
	echo -e "\n${RED}${BBLACK}workers sequences done${RESET}\n"
	exit 1
}

if [[ "$1" == "workers" ]]; then
	echo "{Workers mode}"
    enter_func
fi

echo -e "{Pre-configuration}"
echo "Source VMs folder is: $SRCVBFOLDER"
echo "Destination VMs folder is: $DSTVBFOLDER"
echo -e "\n\e[9m{Auto configuration}\e[0m"
echo -e "\e[9m- Local dummy: this option will be added next update\e[0m"
echo -e "\e[9m- Remote dummy: this option will be added next update\e[0m"

if [ -d "$SRCVBFOLDER" ]; then
	find "$SRCVBFOLDER" -name '*.vbox' -exec bash -c 'cp "$0" "${0%.vbox}.backup"' "{}" \;
fi

while read -p "`echo -e '\nChoose an option:\n1) Setup requirements (docker, docker-compose and VirtualBox)\n2) Initialize your VMs settings (VM name, snapshot, username and password)\n3) Initialize dummy VMs settings (VM name, snapshot, username and password are dummy)\n4) Setup the project\n5) Start the proejct\n6) Exit the project and restore VMs on local\n>> '`"; do
  case $REPLY in
    "1") setup_requirements;;
    "2") init;;
    "3") init_dummy;;
    "4") setup_project;;
    "5") start_project;;
    "6") exit_func;;
    *) echo "Invalid option";;
  esac
done

sudo find $HOME \! -user $USER
