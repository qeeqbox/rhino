#!/bin/bash

SRCVBFOLDER="/home/test/VirtualBox VMs"
DSTVBFOLDER="/root/VirtualBox VMs"

BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'

BBLACK='\033[40m'
BRED='\033[41m'
BGREEN='\033[42m'
BYELLOW='\033[43m'
BBLUE='\033[44m'
BPURPLE='\033[45m'
BCYAN='\033[46m'
BWHITE='\033[47m'

RESET='\033[0m'

echo -e "\nQeeqBox Rhino starter script\nhttps://github.com/qeeqbox/Rhino\n"

echo -e "{Pre-configuration}"
echo "Source VMs folder is: $SRCVBFOLDER"
echo "Destination VMs folder is: $DSTVBFOLDER"

setup_requirements () {
	echo -e "\n${RED}${BBLACK}Setup requirements started${RESET}\n"
	wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | sudo apt-key add -
	wget -q https://www.virtualbox.org/download/oracle_vbox.asc -O- | sudo apt-key add -
	echo "deb [arch=amd64] http://download.virtualbox.org/virtualbox/debian $(lsb_release -sc) contrib" | sudo tee /etc/apt/sources.list.d/virtualbox.list
	sudo apt update -y
	sudo apt install -y linux-headers-$(uname -r) dkms virtualbox-6.1 docker.io curl wget jq
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
  	python ./settings/init_settings.py normal
	echo -e "\n${RED}${BBLACK}Init sequences done${RESET}\n"
}

init_dummy () {
	echo -e "\n${RED}${BBLACK}Dummy init sequences started${RESET}\n"
  	python ./settings/init_settings.py dummy
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
	jq -r '.settings.all_boxes[].vm' settings/settings.json | while read -r line
	do
	  unregister_vms "$line"
	done
	sudo docker-compose up
	echo -e "Start sequences done\n"
	exit_func
}

unregister_vms() {
	VBoxManage list vms | grep "\"$1\"" |grep -oP '\{\K[^}]+' | xargs -n 1 -I {} VBoxManage unregistervm {}
}

change_uuid_and_register()
{
	if [ -d "$1/$2" ] ; then
		#echo "$1/$2 <-- Found" 
		find "$1/$2" -type f -name "$2.vbox" | xargs -n 1 -I {} sh -c 'sed -i "s/<Machine uuid=\"{[^}]*}\"/<Machine uuid=\"{`uuidgen`}\"/g" "{}"'
		find "$1/$2" -type f -name "$2.vbox" | xargs -n 1 -I {} VBoxManage registervm {}
	#else
	#	echo "$1/$2 <-- Not found" 
	fi
}

exit_func (){
	echo -e "\n${RED}${BBLACK}exit sequences started${RESET}\n"
	sudo docker-compose down
	find "$SRCVBFOLDER" -type f ! -user `id -un` -exec sudo chown -R $USER: {} +
	find "$SRCVBFOLDER" -type d ! -user `id -un` -exec sudo chown -R $USER: {} +
	#find "$SRCVBFOLDER" -name '*.backup' -exec bash -c 'cp "$0" "${0%.backup}.vbox"' "{}" \;
	jq -r '.settings.all_boxes[].vm' settings/settings.json | while read -r line
	do
	  change_uuid_and_register "$SRCVBFOLDER" "$line"
	done
	sudo pkill -9 VBox && sudo killall VirtualBox && sudo killall VirtualBoxVM
	echo -e "\n${RED}${BBLACK}exit sequences done${RESET}\n"
	exit 1
}

enter_func_workers (){
	echo -e "\n${RED}${BBLACK}workers sequences started${RESET}\n"
	jq -r '.settings.all_boxes[].vm' /settings/settings.json | while read -r line
	do
	  unregister_vms "$line"
	  change_uuid_and_register "$DSTVBFOLDER" "$line"
	done
	sudo pkill -9 VBox && sudo killall VirtualBox && sudo killall VirtualBoxVM
	python start.py
	echo -e "\n${RED}${BBLACK}workers sequences done${RESET}\n"
	exit 1
}


if [ -d "$SRCVBFOLDER" ]; then
	find "$SRCVBFOLDER" -name '*.vbox' -exec bash -c 'cp "$0" "${0%.vbox}.backup"' "{}" \;
fi

auto_configure_dummy() {
	setup_requirements
	init_dummy
	setup_project
	start_project
}

auto_configure() {
	setup_requirements
	init
	setup_project
	start_project
}

if [[ "$1" == "workers" ]]; then
	echo "{Workers mode}"
    enter_func_workers
elif [[ "$1" == "auto_configure_dummy" ]]; then
	auto_configure_dummy
elif [[ "$1" == "auto_configure" ]]; then
	auto_configure
fi

while read -p "`echo -e '\nChoose an option:\n1) Setup requirements (docker, docker-compose and VirtualBox)\n2) Initialize your VMs settings (VM name, snapshot, username and password)\n3) Initialize dummy VMs settings (VM name, snapshot, username and password are dummy)\n4) Setup the project\n5) Start the proejct (Remember to close the project with ctrl + c)\n6) Manually exit the project and restore VMs on local\n9) Auto-configure dummy project\n>> '`"; do
  case $REPLY in
    "1") setup_requirements;;
    "2") init;;
    "3") init_dummy;;
    "4") setup_project;;
    "5") start_project;;
    "6") exit_func;;
    "exit") exit_func;;
    "9") auto_configure;;
    *) echo "Invalid option";;
  esac
done
