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
- & More features to Explore

## Roadmap
- Add edit and import settings to the web interface 
- Continue implementing the rest of actions (Currently there are 10 out of 65 actions implemented)
- dd multi-submit tasks
- Refactor the web interface

## Running

#### On ubuntu 18 or 19 System 
```bash
1) Make run.sh executable | chmod +x ./run.sh
2) Setup the project | ./run.sh setup
3) Import your VMs to the system
4) Snapshot your running Linux or Windows VM
5) initialize the project | ./run.sh init
6) Start the project | ./run.sh start
```

## Resources
- Linux documentation
- React documentation
- VirtualBox SDK
- pyvbox and VirtualBox APIs
- ionicons
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
- If you are interested in adopting some features in your project - please mention this source somewhere in your project
