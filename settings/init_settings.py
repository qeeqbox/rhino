__G__ = "(G)bd249ce4"

from tempfile import gettempdir
from re import sub, compile,I
from os import path, mkdir
from json import dumps,dump,load
from sys import argv

try: 
	vbox_template = {
			"vm": "",
			"snapshot": "",
			"user": "",
			"pass": "",
			"temp": "",
			"screen_recorder": "screen.webm",
			"screenshot": "screen.png",
			"logs": "analyzer_logs",
			"queue": "",
			"task_time_limit": 250,
			"os": "",
			"reserved": [
			  "screen.webm",
			  "analyzer_logs",
			  "screen.png"
			]
		  }

	reg = compile(r"[^A-Za-z0-9\!\@\#\-\_\/\.]",I)
	temp_location = sub(reg, "", path.join(gettempdir(),"rhinotempfiles"))
	print("\nAdding virtual boxes settings (Allowed characters are: A-Z a-z 0-9_-!@#)\n")
	if argv[1] != "dummy":
		n_boxes = raw_input("How many VMs do you have? ")
		temp_location = sub(reg, "", raw_input("Default temporary folder is {} -> ".format(temp_location))) or temp_location
		if not path.exists(temp_location):
			mkdir(temp_location)
		_dict_of_boxes = {}
		for x in range(0,int(n_boxes)):
			name = "vbox_{}".format(x)
			print("\n----------{}----------\n".format(name))
			temp_vbox_template = vbox_template
			temp_vbox_template["vm"] = sub(reg, "", raw_input("VM name? (E.g. Ubuntu18, TestUbuntu or Windows10) "))
			temp_vbox_template["snapshot"] = sub(reg, "", raw_input("VM snapshot name? (E.g. Snapshot_1) "))
			temp_vbox_template["user"] = sub(reg, "", raw_input("VM OS username? (E.g. IEUser, user, Test) "))
			temp_vbox_template["pass"] = sub(reg, "", raw_input("VM OS password? (E.g. easyPassw0rd!@) "))
			temp_vbox_template["os"] = sub(reg, "", raw_input("VM OS Windows or Linux? (case-sensitive) "))
			temp_vbox_template["queue"] = name
			temp_vbox_template["temp"] = temp_location

			for key in temp_vbox_template:
				if temp_vbox_template[key] == "":
					print("{} is Empty {}".format(key,temp_vbox_template[key]))
					exit()
			_dict_of_boxes[name] = temp_vbox_template
	else:
		name = "vbox_1"
		_dict_of_boxes = {}
		if not path.exists(temp_location):
			mkdir(temp_location)
		_dict_of_boxes = {}
		temp_vbox_template = vbox_template
		temp_vbox_template["vm"] = "dummy"
		temp_vbox_template["snapshot"] = "dummy"
		temp_vbox_template["user"] = "dummy"
		temp_vbox_template["pass"] = "dummy"
		temp_vbox_template["os"] = "dummy"
		temp_vbox_template["queue"] = "vbox_testing"
		temp_vbox_template["temp"] = temp_location
		for key in temp_vbox_template:
			if temp_vbox_template[key] == "":
				print("{} is Empty {}".format(key,temp_vbox_template[key]))
				exit()
		_dict_of_boxes[name] = temp_vbox_template
	
	print("\nAdding your settings to settings.json, you can manually edit all the settings later on\n")
	print(dumps(_dict_of_boxes, indent=4, sort_keys=True))

	with open("settings/settings.json", "r") as json_file:
		data = load(json_file)

	data["settings"]["all_boxes"] = _dict_of_boxes

	with open("settings/settings.json", "w") as json_file:
		dump(data, json_file,indent=4, sort_keys=True)

	print("\nSettings have been added to settings.json\n")

except Exception as e:
	print(e)
