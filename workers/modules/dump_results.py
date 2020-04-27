__G__ = "(G)bd249ce4"

from datetime import datetime
from os import path
from ..connections.mongodbconn import save_item_fs,update_task_files
from ..settings import mongo_settings_localhost
from ..logger.logger import log_string
from magic import Magic
from os import listdir
from bson import ObjectId

def dump_to_mongofs(uuid,box):
	ret = False
	mime = Magic(mime=True)
	files = listdir(path.join(box["temp"],uuid))
	try:
		for file in files:
			time_now = datetime.now()
			with open(path.join(box["temp"],uuid,file),"rb") as data_file:
				item = save_item_fs(mongo_settings_localhost["files"],data_file.read(),file,uuid,mime.from_file(path.join(box["temp"],uuid,file)),time_now)
				update_task_files(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],uuid,{"name":file,"objectid":str(item)})
		ret = True
	except Exception as e:
		ret = False
		log_string(uuid,"dump_to_mongofs Failed {} {}".format(e),"Red")
	return ret