__G__ = "(G)bd249ce4"

from os import mkdir,path
from celery import Celery
from shutil import rmtree
from datetime import datetime
from types import FunctionType
from .logger.logger import log_string,setup_logger
from .modules.vbox_parser import analyze_input_wrapper_in_process,remote_control_vm_in_process,test_vbox,turn_off,test_dummy_in_process
from .modules.dump_results import dump_to_mongofs
from .settings import all_boxes,celery_settings_localhost,mongo_settings_localhost,vbox_testing
from .connections.mongodbconn import update_item

celery = Celery(celery_settings_localhost["name"], broker=celery_settings_localhost["celery_broker_url"], backend=celery_settings_localhost["celery_result_backend"])

celery.conf.update(
	 CELERY_ACCEPT_CONTENT = ["json"],
	 CELERY_TASK_SERIALIZER = "json",
	 CELERY_RESULT_SERIALIZER = "json",
	 CELERY_TIMEZONE = "America/Los_Angeles"
)

dynamic_init_tasks_functions = []
dynamic_init_remote_control_functions = []

def copy_func(function, name):
    fn = FunctionType(function.__code__, function.__globals__, name,function.__defaults__, function.__closure__)
    fn.__dict__.update(function.__dict__) 
    return fn

@celery.task(bind=True,name="vbox_testing",queue=vbox_testing["queue"])
def vbox_testing(self,vbox_name,task):
	ret = "false"
	uuid = self.request.id
	update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],uuid,{"status":"started","started_time":datetime.now()})
	folder = path.join(all_boxes[vbox_name]["temp"],uuid)
	if path.exists(folder):
		rmtree(folder)
	mkdir(folder)
	setup_logger(all_boxes[vbox_name],uuid)
	try:
		if task == "terminate":
			if turn_off(uuid,all_boxes[vbox_name],5):
				update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],uuid,{"status":"done","done_time":datetime.now()})
				ret = "done"
		elif task == "testdummy":
			if test_dummy_in_process(uuid,all_boxes[vbox_name],25):
				update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],uuid,{"status":"done","done_time":datetime.now()})
				ret = "done"
	except:
		pass
	update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],uuid,{"status":ret,"done_time":datetime.now()})
	return ret

def tasks_logic(self,vbox_name,task,actionslist,timeout):
	ret = "false"
	uuid = self.request.id
	update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],uuid,{"status":"started","started_time":datetime.now()})
	folder = path.join(all_boxes[vbox_name]["temp"],uuid)
	if path.exists(folder):
		rmtree(folder)
	mkdir(folder)
	setup_logger(all_boxes[vbox_name],uuid)
	try:
		if analyze_input_wrapper_in_process(uuid,all_boxes[vbox_name],task,actionslist,timeout):
			if dump_to_mongofs(uuid,all_boxes[vbox_name]):
				ret = "done"
	except Exception as e:
		turn_off(uuid,all_boxes[vbox_name],5)
	update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],uuid,{"status":ret,"done_time":datetime.now()})
	return ret

def tasks_recording(self,vbox_name,task,process_timeout):
	ret = "false"
	uuid = self.request.id
	update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],uuid,{"status":"started","started_time":datetime.now()})
	folder = path.join(all_boxes[vbox_name]["temp"],uuid)
	if path.exists(folder):
		rmtree(folder)
	mkdir(folder)
	setup_logger(all_boxes[vbox_name],uuid)
	try:
		if task == "remote_control":
			if remote_control_vm_in_process(uuid,all_boxes[vbox_name],process_timeout):
				update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],uuid,{"status":"done","done_time":datetime.now()})
				ret = "done"
	except:
		turn_off(uuid,all_boxes[vbox_name],5)
	update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],uuid,{"status":ret,"done_time":datetime.now()})
	return ret

def dynamic_init_tasks():
	for box in all_boxes:
		dynamic_init_tasks_functions.append(copy_func(tasks_logic,"{}_tasks".format(box)))
		celery.task(bind=True,name="{}_tasks".format(box),soft_time_limit=all_boxes[box]["task_time_limit"], time_limit=all_boxes[box]["task_time_limit"], max_retries=0, default_retry_delay=5,queue=all_boxes[box]["queue"])(dynamic_init_tasks_functions[-1])

dynamic_init_tasks()

def dynamic_init_remote_control():
	for box in all_boxes:
		dynamic_init_remote_control_functions.append(copy_func(tasks_recording,"{}_recording".format(box)))
		celery.task(bind=True,name="{}_recording".format(box),queue=all_boxes[box]["queue"])(dynamic_init_remote_control_functions[-1])

dynamic_init_remote_control()
