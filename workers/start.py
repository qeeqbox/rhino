__G__ = "(G)bd249ce4"

from termcolor import colored
from subprocess import Popen
from time import sleep
from redis import Redis
from tempfile import gettempdir
from os import path, mkdir
from json import dumps,load
from worker_py2.processes.proc import kill_all_boxes, kill_processes # no need on docker

with open ('/settings/settings.json') as f:
    json_settings = load(f)
    all_boxes = json_settings["settings"]["all_boxes"]
    vbox_testing = json_settings["settings"]["vbox_testing"]
    mongo_settings_docker = json_settings["settings"]["mongo_settings_docker"]
    celery_settings_localhost = json_settings["settings"]["celery_settings_docker"]
    celery_settings_docker = json_settings["settings"]["celery_settings_docker"]
    redis_settings_localhost = json_settings["settings"]["redis_settings_docker"]
    redis_settings_docker = json_settings["settings"]["redis_settings_docker"]
    backendkey = json_settings["settings"]["backendkey"]

print(colored("\nStarting workers...\n","yellow","on_grey"))

worker_number = 0
worker_name = "worker"
processes = []

if not path.exists(vbox_testing["temp"]):
	mkdir(vbox_testing["temp"])

r = Redis.from_url(redis_settings_localhost)

def clean_remote_control_keys():
	try:
		for box in all_boxes:
			self.vm_name_lock = "{}_lock".format(box["vm"])
			self.vm_name_frame = "{}_frame".format(box["vm"])
			self.vm_name_action = "{}_action".format(box["vm"])
			r.delete(vm_name_lock)
			r.delete(vm_name_frame)
			r.delete(vm_name_action)
	except:
		pass

clean_remote_control_keys()
kill_all_boxes(all_boxes)

cmd = 'celery -A worker_py2.worker worker --concurrency=1 -l DEBUG -Q {} '.format(vbox_testing["queue"])
processes.append(Popen(cmd, shell=True))

for box in all_boxes.keys():
	current_worker= "{}{}".format(worker_name,worker_number)
	cmd = 'celery -A worker_py2.worker worker --concurrency=1 -l DEBUG -Q {} '.format(all_boxes[box]["queue"])
	#cmd = 'celery -A workers.worker worker --concurrency=1 -l DEBUG -Q {} --logfile={}'.format(all_boxes[box]["queue"],path.join(global_settings["logs"],current_worker))
	processes.append(Popen(cmd, shell=True))
	worker_number += 1

while True:
	try:
		sleep(5)
	except KeyboardInterrupt:
		print(colored("\nExisting workers...\n","yellow","on_grey"))
		break
