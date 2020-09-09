<p align="center"> <img src="https://raw.githubusercontent.com/qeeqbox/rhino/master/readme/rhinologo.png"></p>

#
[![Generic badge](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/qeeqbox/rhino/master/info&label=version&query=$.version&colorB=blue)](https://github.com/qeeqbox/rhino/blob/master/changes.md) [![Generic badge](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/qeeqbox/rhino/master/info&label=docker-compose&query=$.dockercompose&colorB=green)](https://github.com/qeeqbox/rhino/blob/master/changes.md)

Agile Sandbox for analyzing malware and execution behaviors. Customizable, Expandable and can be quickly altered during the analysis iteration. Inspired by the Rhinoceros and Agile methodology.

## React Web Interface
<img src="https://raw.githubusercontent.com/qeeqbox/rhino/master/readme/introv.gif" style="max-width:768px"/>

## Output 
- [Cerber Ransomwere Windows](https://github.com/qeeqbox/Rhino/tree/master/example/cerber-output-windows)
- [Firefox Link Linux](https://github.com/qeeqbox/Rhino/tree/master/example/firefox-linux)

## General Features
- Customizable actions and settings
- Actions are draggable, removable and editable
- In-time actions tracker (failed, running or success)
- Some actions work on both Linux and Windows (Auto-switching)
- Task screen recording, input/output files and network traffic are included
- Build and save tasks of each iteration
- Overview stats for recent and old tasks
- React interface and Flask API for easy integration
- MongoDB and Redis searching statements (Find, Sort and Limit )
- VMs are automatically terminated (prevents VMs from locking)
- Setup, Initialize and Run the project using a Bash script
- Project expands dynamically based on VM entries
- Custom Remote control (Experimental, used to snapshot VMs)
- Auto VMs mapping and switching
- & More features to Explore

## Roadmap
- Continue implementing the rest of actions (Currently there are 10 out of 65 actions implemented)
- Add import settings to the web interface
- Add multi-submit tasks
- Refactor the web interface

## Easy installation!
<img src="https://raw.githubusercontent.com/qeeqbox/rhino/master/readme/install.gif" style="max-width:768px"/>

#### On ubuntu 18 or 19 System (Auto-configure)
```bash
git clone https://github.com/qeeqbox/rhino.git
cd rhino
chmod +x ./run.sh
./run.sh auto_configure
```
The project interface http://localhost:5000/dashboard will open automatically after finishing the initialization process

#### On ubuntu 18 or 19 System (Auto-configure Dummy)
```bash
git clone https://github.com/qeeqbox/rhino.git
cd rhino
chmod +x ./run.sh
./run.sh auto_configure_dummy
```
The project interface http://localhost:5000/dashboard will open automatically after finishing the initialization process

#### On ubuntu 18 or 19 System (Manually)
```bash
git clone https://github.com/qeeqbox/rhino.git
cd rhino
chmod +x ./run.sh
./run.sh

Choose an option:
1) Setup requirements (docker, docker-compose and VirtualBox)
2) Initialize your VMs settings (VM name, snapshot, username and password)
3) Initialize dummy VMs settings (VM name, snapshot, username and password are dummy)
4) Setup the project
5) Start the project 
6) Exit the project and restore VMs on local
9) Auto-configure dummy project

Choose 1,2,4 then 5. Once you are done, close the project with ctr+c
open localhost:5000/dashboard
```

## Resources
- Linux documentation
- React documentation
- VirtualBox SDK
- pyvbox and VirtualBox APIs
- ionicons
- llorentegerman
- My old projects
- Please let me know if i missed a resource or dependency

## Other Licenses
By using this framework, you are accepting the license terms of each package listed below:
- https://www.virtualbox.org/wiki/Licensing_FAQ
- https://github.com/sethmlarson/virtualbox-python/blob/master/LICENSE
- https://github.com/facebook/create-react-app/blob/master/LICENSE
- https://flask.palletsprojects.com/en/1.0.x/license/
- https://github.com/celery/celery/blob/master/LICENSE
- https://github.com/mher/pymongo/blob/master/LICENSE
- https://redislabs.com/legal/licenses/
- https://github.com/andymccurdy/redis-py/blob/master/LICENSE
- https://github.com/pandas-dev/pandas/blob/master/LICENSE
- https://github.com/pyca/bcrypt/blob/master/LICENSE
- https://github.com/giampaolo/psutil/blob/master/LICENSE
- https://github.com/celery/billiard/blob/master/LICENSE.txt
- https://www.npmjs.com/package/video-react
- https://www.npmjs.com/package/uuid
- https://www.npmjs.com/package/simple-flexbox
- https://www.npmjs.com/package/serve
- https://www.npmjs.com/package/recharts
- https://www.npmjs.com/package/react-scripts
- https://www.npmjs.com/package/react-router-dom
- https://www.npmjs.com/package/react-movable
- https://www.npmjs.com/package/react-json-view
- https://www.npmjs.com/package/react-dom
- https://www.npmjs.com/package/rc-menu
- https://www.npmjs.com/package/rc-dropdown
- https://www.npmjs.com/package/axios
- https://www.npmjs.com/package/aphrodite
- https://github.com/ionic-team/ionicons/blob/master/LICENSE

## Disclaimer\Notes
- Do not deploy without proper configuration
- Setup some security group rules and remove default credentials
