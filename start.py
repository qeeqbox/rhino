__G__ = "(G)bd249ce4"

from termcolor import colored
from subprocess import Popen
from time import sleep
from workers.processes.proc import kill_all_boxes, kill_processes
from settings.settings import all_boxes,redis_settings_localhost,vbox_testing
from redis import StrictRedis
from tempfile import gettempdir
from os import path, mkdir

print(colored("\nStarting workers...\n","yellow","on_grey"))

worker_number = 0
worker_name = "worker"
processes = []

if not path.exists(vbox_testing["temp"]):
	mkdir(vbox_testing["temp"])


r = StrictRedis(redis_settings_localhost["host"], redis_settings_localhost["port"], db=0)

def clean_remote_control_keys():
	try:
		for box in all_boxes:
			vm_name_lock = "{}_lock".format(box["vm"])
			vm_name_frame = "{}_frame".format(box["vm"])
			vm_name_keys = "{}_keys".format(box["vm"])
			vm_name_mouse = "{}_mouse".format(box["vm"])
			r.delete(vm_name_lock)
			r.delete(vm_name_frame)
			r.delete(vm_name_keys)
			r.delete(vm_name_mouse)
	except:
		pass

clean_remote_control_keys()
kill_all_boxes(all_boxes)

cmd = 'celery -A workers.worker worker --concurrency=1 -l DEBUG -Q {} '.format(vbox_testing["queue"])
processes.append(Popen(cmd, shell=True))

for box in all_boxes.keys():
	current_worker= "{}{}".format(worker_name,worker_number)
	cmd = 'celery -A workers.worker worker --concurrency=1 -l DEBUG -Q {} '.format(all_boxes[box]["queue"])
	#cmd = 'celery -A workers.worker worker --concurrency=1 -l DEBUG -Q {} --logfile={}'.format(all_boxes[box]["queue"],path.join(global_settings["logs"],current_worker))
	processes.append(Popen(cmd, shell=True))
	worker_number += 1

while True:
	try:
		sleep(5)
	except KeyboardInterrupt:
		print(colored("\nExisting workers...\n","yellow","on_grey"))
		break

clean_remote_control_keys()
kill_processes(processes)
kill_all_boxes(all_boxes)
print("Terminated.. ")
