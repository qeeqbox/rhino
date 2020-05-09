__G__ = "(G)bd249ce4"

from flask import Flask,jsonify,request,make_response, Response,session
from celery.task.control import inspect,revoke
from celery import Celery
from flask_cors import CORS
from datetime import datetime
from redis import StrictRedis
from pymongo import MongoClient
from gridfs import GridFS
from pandas import DataFrame,to_datetime
from json import dumps as jdumps
from json import dump as jdump
from json import loads as jloads
from json import load as jload
from pickle import dumps as pdumps
from time import sleep
from uuid import uuid4
from ast import literal_eval
from re import compile as recompile
from functools import wraps
from bcrypt import hashpw, gensalt
from psutil import disk_usage
from werkzeug.exceptions import HTTPException

with open('/settings/settings.json') as f:
    json_settings = jload(f)
    all_boxes = json_settings["settings"]["all_boxes"]
    vbox_testing = json_settings["settings"]["vbox_testing"]
    mongo_settings_docker = json_settings["settings"]["mongo_settings_docker"]
    celery_settings_docker = json_settings["settings"]["celery_settings_docker"]
    backendkey = json_settings["settings"]["backendkey"]

r = StrictRedis(host="redis", port=6379, db=0)
client = MongoClient(mongo_settings_docker["url"])
celery = Celery(celery_settings_docker["name"], broker=celery_settings_docker["celery_broker_url"], backend=celery_settings_docker["celery_result_backend"])
celery.control.purge()
app = Flask(__name__)
app.config.update(SECRET_KEY = backendkey)
CORS(app, supports_credentials=True)

#you can switch later on
def require_api_key(f):
	@wraps(f)
	def check_key(*args, **kwargs):
		try:
			#authkey = request.headers.get("auth")
			if "token" in session:
				authkey = session["token"]
				if authkey:
					valid = client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_login"]].find_one({"token": authkey})
					if valid:
						return f(*args, **kwargs)
			else:
				return jsonify("Please Login")
		except:
			pass
		return jsonify(status="Error")
	return check_key

#less secure
def require_session_token(f):
	@wraps(f)
	def check_key(*args, **kwargs):
		try:
			if "token" in session:
				return f(*args, **kwargs)
			else:
				return jsonify("Please Login")
		except Exception as e:
			return jsonify(str(e))
		return jsonify(status="Error")
	return check_key

def check_token(f):
	@wraps(f)
	def check_key(*args, **kwargs):
		if "token" in session:
			return f(*args, **kwargs)
		else:
			return jsonify("Please Login") 
	return check_key

def add_item(db,col,_set):
	item = client[db][col].find_one(_set)
	if item == None:
		item = client[db][col].insert_one(_set)
		if item != None:
			return item
	return False

def find_item(db,col,_set):
	item = client[db][col].find_one(_set,{"_id": False})
	return item

def find_items(db,col,_set,last=None):
	items = client[db][col].find(_set)
	if items != None:
		if last != None:
			return list(items.sort("_id",1).limit(last))
		else:
			return list(items.sort("_id",1))
	return []

@app.route("/add",methods = ["POST"])
@require_session_token
def add_task():
	uuid4_cluster = str(uuid4())
	if request.json["singleormulti"] == "single":
		if all_boxes[request.json["vbox"]]["queue"] != "vbox_testing":
			task = celery.send_task("{}_tasks".format(request.json["vbox"]), args=[request.json["vbox"],request.json["taskname"],request.json["actionslist"],int(request.json["tasktimeout"])], kwargs={}, queue=all_boxes[request.json["vbox"]]["queue"])
			if task.id:
				add_item(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"cluster":uuid4_cluster,"uuid":task.id,"status":"added","logs":[],"box":request.json["vbox"],"task":request.json["taskname"],"tasktimeout":int(request.json["tasktimeout"]),"actionslist":request.json["actionslist"],"added_time":datetime.now(),"started_time":None,"done_time":None,"fileslist":[]})
				return jsonify(task_id=task.id)
	elif request.json["singleormulti"] == "multi": # will be re-added soon
		_list_of_tasks = []
		for _input in request.json["input"].splitlines():
			if request.json["vbox"] == "vbox1" and request.json["task"] in (all_boxes[request.json["vbox"]]["tasks"]):
				task = celery.send_task("vbox1_tasks", args=[request.json["vbox"],request.json["task"],_input,request.json["extrainput"],int(request.json["tasktimeout"])], kwargs={}, queue=all_boxes[request.json["vbox"]]["queue"])
				if task.id:
					add_item(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"cluster":uuid4_cluster,"uuid":task.id,"status":"added","logs":[],"box":request.json["vbox"],"task":request.json["task"],"input":_input,"extrainput":request.json["extrainput"],"tasktimeout":int(request.json["tasktimeout"]),"added_time":datetime.now(),"started_time":None,"done_time":None})
					_list_of_tasks.append(task.id)
		return jsonify(list_of_task_ids=_list_of_tasks)
	return jsonify(task_id=0)

def get_stats(_list_sorted):
	stats_list = []
	try:
		df = DataFrame(_list_sorted)
		df.index = to_datetime(df["date_done"], format="%Y-%m-%dT%H:%M:%S.%f")
		x = df.groupby(by=[df.index.year,df.index.month,df.index.day,df.index.hour]).count().to_dict()["date_done"]
		for _ in x:
			stats_list.append({"time":datetime(*_).strftime("%Y-%m-%d %H"),"tasks":x[_]})
	except Exception as e:
		stats_list.append(str(e))

	return stats_list

def get_succeed():
	_list = []
	_list_sorted = []
	_parsed = []
	try:
		for key in r.scan_iter():
			if key.startswith("celery-task-meta-"):
				_key = jloads(r[key])
				if _key["status"] == "SUCCESS":
					_list.append({"task_id":_key["task_id"],"date_done":datetime.strptime(_key["date_done"],"%Y-%m-%dT%H:%M:%S.%f")})

		_list_sorted = (sorted(_list, key = lambda k: k["date_done"],reverse=True))
		if len(_list_sorted) > 0:
			for item in _list_sorted[:50]:
				_parsed.append("ID: {} Done Time: {}".format(item["task_id"],item["date_done"].strftime("%Y-%m-%d %H:%M:%S")))
			return len(_list_sorted),_parsed,_list_sorted[:50]
	except Exception:
		pass
	return 0,[],[]

@app.route("/stats_old",methods = ["GET"])
@require_session_token
def get_tasks_old():
	_list = {"active":[],"active_number":0,"reserved":[],"reserved_number":0,"succeed":[],"succeed_number":0,"data":[]}
	try:
		_list["succeed_number"], _list["succeed"], temp_list = get_succeed()
		_list["data"] = get_stats(temp_list)
	except Exception:
		pass
	try:
		active_jobs = inspect().active()
		for hostname in active_jobs.keys():
			for task in active_jobs[hostname]:
				_list["active"].append("ID: {} Start Time: {}".format(task["id"],datetime.fromtimestamp(task["time_start"]).strftime("%Y-%m-%d %H:%M:%S")))
		if len(_list["active"]) == 0:
			_list["active"].append("None")
		else:
			_list["active_number"] = len(_list["active"])
	except Exception:
		pass
	try:
		reserved_jobs = inspect().reserved()
		for hostname in reserved_jobs.keys():
			for task in reserved_jobs[hostname]:
				_list["reserved"].append("ID: {} Start Time: {}".format(task["id"],"None"))
		if len(_list["reserved"]) == 0:
			_list["reserved"].append("None")
		else:
			_list["reserved_number"] = len(_list["reserved"])
	except Exception:
		pass
	return jsonify(_list)

def get_stats_pic(_list_sorted):
	stats_list = []
	try:
		df = DataFrame(_list_sorted)
		df.index = to_datetime(df["done_time"], format="%Y-%m-%dT%H:%M:%S.%f")
		x = df.groupby(by=[df.index.year,df.index.month,df.index.day,df.index.hour]).count().to_dict()["done_time"]
		for _ in x:
			stats_list.append({"time":datetime(*_).strftime("%Y-%m-%d %H"),"tasks":x[_]})
	except Exception:
		pass

	return stats_list

def get_all_tasks():
	_list = []
	total, used, free, pre = disk_usage("/")
	_list.append({"name":"free","value":free})
	_list.append({"name":"used","value":used})
	return _list

@app.route("/stats",methods = ["GET"])
@require_session_token
def get_tasks():
	_list = {"active":[],"active_number":0,"reserved":[],"reserved_number":0,"succeed":[],"succeed_number":0,"data":[],"tasks":[]}
	active_tasks = find_items(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"status":"started"})
	_list["active_number"] = len(active_tasks)
	reserved_tasks = find_items(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"status":"added"})
	_list["reserved_number"] = len(reserved_tasks)
	succeed_tasks = find_items(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"status":"done"})
	_list["succeed_number"] = len(succeed_tasks)
	to_parse = find_items(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"status":"done"},100)
	_list["data"] = get_stats_pic(to_parse)
	_list["tasks"] = get_all_tasks()
	return jsonify(_list)

@app.route("/check",methods = ["POST"])
@require_session_token
def check_task():
	try:
		item = find_item(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"uuid":request.json["task_id"]})
		if item != None:
			return jsonify(status=item["status"])
	except:
		pass
	return jsonify(status="Error")

def get_results(last_n):
	_list = []
	items = client[mongo_settings_docker["files"]]["fs.files"].find({"filename":"screen.png"}).sort([("_id", -1)]).limit(last_n)
	for item in items:
		try:
			_item = find_item(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"uuid":item["uuid"]})
			if _item != None:
				_list.append({"uuid":_item["uuid"],"actionslist":_item["actionslist"]})
		except:
			pass
	return _list

@app.route("/results",methods = ["GET"])
@require_session_token
def results():
	_list = []
	try:
		_list = get_results(10)	
	except:
		pass
	return jsonify(_list)

@app.route("/file/<name>/<uuid>",methods = ["GET"])
@require_session_token
def get_file(name,uuid):
	try:
		if name in ("analyzer_logs","screen.webm","screen.png"):
			item = GridFS(client[mongo_settings_docker["files"]]).find_one({"filename":name,"uuid":uuid})
			if item != None:
				response = make_response(item.read())
				response.mimetype = item.content_type
				return response
	except:
		pass

	return jsonify(Error="Something wrong") 

@app.route("/purge")
@require_session_token
def purge():
	try:
		celery.control.purge()
		i = inspect()
		jobs = i.active()
		for hostname in jobs:
			for task in jobs[hostname]:
				revoke(task["id"], terminate=True)
		jobs = i.reserved()
		for hostname in jobs:
			for task in jobs[hostname]:
				revoke(task["id"], terminate=True)
	except:
		pass
	return jsonify("Cleared")

def gen_frames(vm):
	while True:
		sleep(.1)
		frame = b""
		try:
			frame = r.get("{}_frame".format(vm))
			yield (b"--frame\r\n"b"Content-Type: image/png\r\n\r\n" + frame + b"\r\n\r\n")
		except Exception:
			pass
		yield (b"--frame\r\n"b"Content-Type: image/png\r\n\r\n" + b"" + b"\r\n\r\n")

@app.route("/start_remote_control",methods=["POST"])
@require_session_token
def start_remote_control():
	task = celery.send_task("{}_recording".format(request.json["vbox"]), args=[request.json["vbox"],"remote_control",int(request.json["tasktimeout"])], kwargs={},queue=all_boxes[request.json["vbox"]]["queue"])
	if task.id:
		add_item(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"uuid":task.id,"status":"added","logs":[],"box":request.json["vbox"],"task":"remote_control","tasktimeout":int(request.json["tasktimeout"]),"added_time":datetime.now(),"started_time":None,"done_time":None})
		return jsonify(task_id=task.id)
	return jsonify(task_id="")

@app.route("/close_remote_control",methods=["POST"])
@require_session_token
def close_remote_control():
	vm_name_lock = "{}_lock".format(all_boxes[request.json["vbox"]]["vm"])
	r.set(vm_name_lock,"True")
	return jsonify(status="Done") 

@app.route("/review_remote_control",methods=["POST"])
@require_session_token
def review_remote_control():
	try:
		vm_name_lock = "{}_lock".format(all_boxes[request.json["vbox"]]["vm"])
		if r.get(vm_name_lock) == b"False":
			return jsonify(status="Running") 
	except:
		pass
	return jsonify(status="Error") 

#need uuid in get
@app.route("/video_feed/<vbox>")
@require_session_token
def video_feed(vbox):
	return Response(gen_frames(all_boxes[vbox]["vm"]),mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/remote_action",methods=["POST"])
@require_session_token
def remote_action():
	vbox,x,y,s,key = request.json
	t = (int(x),int(y),0,0,s,key)
	vm_name_action = "{}_action".format(all_boxes[vbox]["vm"])
	r.set(vm_name_action,pdumps(t,protocol=2))
	return jsonify(status="sent") 

def get_vars(module_name):
	_dict = {}
	try:
		_dict = {key: value for key, value in globals().get(module_name, None).__dict__.items() if not key.startswith("_")}
	except:
		pass
	return _dict

@app.route("/dump_settings",methods=["GET"])
@require_session_token
def dump_settings():
	return jdumps(json_settings, indent=4, default=str)

@app.route("/upload_settings",methods=["POST"])
@require_session_token
def upload_settings():
	with open("/settings/settings.json_new", "w") as json_file:
		jdump(request.json, json_file,indent=4, sort_keys=True)
	return jsonify("Uploaded")

@app.route("/boxes_list",methods=["GET"])
@require_session_token
def boxes_list():
	_list = []
	for box in all_boxes:
		_list.append({"label":"{}_{}".format(all_boxes[box]["vm"],box),"value":box})
	return jsonify(_list)

@app.route("/terminate_box",methods=["POST"])
@require_session_token
def terminate_box():
	task = celery.send_task("vbox_testing", args=[request.json["vbox"],"terminate"], kwargs={}, queue=vbox_testing["queue"])
	if task.id:
		add_item(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"uuid":task.id,"task":"terminate","status":"added","logs":[],"box":request.json["vbox"],"added_time":datetime.now(),"started_time":None,"done_time":None})
		_item = find_item(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"uuid":task.id})
		return jsonify(task_id=task.id)
	return jsonify(status="Error")

@app.route("/test_dummy",methods=["POST"])
@require_session_token
def test_dummy():
	task = celery.send_task("vbox_testing", args=[request.json["vbox"],"testdummy"], kwargs={}, queue=vbox_testing["queue"])
	if task.id:
		add_item(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"uuid":task.id,"task":"testdummy","status":"added","logs":[],"box":request.json["vbox"],"added_time":datetime.now(),"started_time":None,"done_time":None})
		_item = find_item(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"uuid":task.id})
		return jsonify(task_id=task.id)
	return jsonify(status="Error")

@app.route("/actions_list/<uuid>",methods=["GET"])
@require_session_token
def actions_list(uuid):
	item = find_item(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"uuid":uuid})
	return jdumps(item["actionslist"], indent=4, default=str)

@app.route("/logs/<uuid>",methods=["GET"])
@require_session_token
def logs(uuid):
	item = find_item(mongo_settings_docker["worker_db"],mongo_settings_docker["worker_col_logs"],{"uuid":uuid})
	return jdumps(item, indent=4, default=str)

@app.route("/actions_list_per_user",methods=["POST"])
@require_session_token
def actions_list_per_user():
	if request.json["type"] == "save":
		if request.json["taskname"] != "" and request.json["token"] != "" and len(request.json["actionslist"]) > 0:
			login_user = client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_login"]].find_one({"token": request.json["token"]})
			if login_user:
				client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_settings"]].update_one({"user":login_user["user"]}, {"$set": {"settings."+request.json["taskname"]:{"optionalsettings":request.json["optionalsettings"],"actionslist":request.json["actionslist"]}}}, upsert=True)
				return jsonify("Added")
	if request.json["type"] == "getlist":
		if request.json["token"] != "":
			login_user = client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_login"]].find_one({"token": request.json["token"]})
			if login_user:
				_list = client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_settings"]].find_one({"user":login_user["user"]})
				if _list:
					return jsonify(_list["settings"])
	if request.json["type"] == "delete":
		if request.json["taskname"] != "" and request.json["token"] != "":
			login_user = client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_login"]].find_one({"token": request.json["token"]})
			if login_user:
				client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_settings"]].update_one({"user":login_user["user"]}, {"$unset": {"settings."+request.json["taskname"]:{}}})
				_list = client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_settings"]].find_one({"user":login_user["user"]})
				if _list:
					return jsonify(_list["settings"])
	return jsonify("")

@app.route("/login",methods=["POST"])
def login():
	_user = request.json["userinput"]
	_pass = request.json["passinput"]
	if len(_user) >0 and len(_pass) > 0:
		login_user = client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_login"]].find_one({"user": _user})
		if login_user:
			if hashpw(_pass.encode("utf-8"), login_user["pass"]) == login_user["pass"]:
				uuid4_toekn = str(uuid4())
				client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_login"]].find_one_and_update({"user": _user},{"$set": {"token":uuid4_toekn}})
				session["token"] = uuid4_toekn
				session.permanent = True
				return jsonify(uuid4_toekn) 
	return jsonify("")

@app.route("/register", methods=["POST"])
def register():
	_user = request.json["userinput"]
	_pass = request.json["passinput"]
	if len(_user) >0 and len(_pass) > 0:
		existing_user = client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_login"]].find_one({"user" : _user})
		if existing_user is None:
			hashpass = hashpw(_pass.encode("utf-8"), gensalt())
			uuid4_toekn = str(uuid4())
			client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_login"]].insert({"user":_user, "pass": hashpass,"token":uuid4_toekn})
			client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_settings"]].insert({"user":_user,"settings":{}})
			session["token"] =  uuid4_toekn
			session.permanent = True
			return jsonify(uuid4_toekn) 
	return jsonify("") 

@app.route("/logout",methods=["POST"])
@require_session_token
def logout():
	if "token" in session:
		authkey = session["token"]
		uuid4_toekn = str(uuid4())
		client[mongo_settings_docker["users_db"]][mongo_settings_docker["users_col_login"]].find_one_and_update({"token": authkey},{"$set": {"token":uuid4_toekn}})
		session.pop("token")
		return jsonify("Done")
	return jsonify("") 

@app.route("/upload_malware/<uuid>",methods=["POST"])
@require_session_token
def upload(uuid):
	if "file" in request.files:
		file = request.files["file"]
		if recompile(r"[a-zA-W0-9\.\_\-]").match(file.filename):
			with GridFS(client[mongo_settings_docker["malware"]]).new_file(filename=file.filename,uuid=uuid) as fp:
				fp.write(file.read())
				file_id = fp._id
			if GridFS(client[mongo_settings_docker["malware"]]).find_one(file_id) is not None: 
				return jsonify("Uploaded") 
	return jsonify("Error") 

@app.route("/search_db",methods=["POST"])
@require_session_token
def search_db():
	cursor = [None]
	try:
		cursor = client[mongo_settings_docker["worker_db"]][mongo_settings_docker["worker_col_logs"]]
		find_input = request.json["findinput"]
		sort_input = request.json["sortinput"]
		limit_input = request.json["limitinput"]
		if find_input != "":
			cursor = cursor.find(literal_eval(find_input))
		if sort_input != "":
			cursor = cursor.sort(literal_eval(sort_input))
		if limit_input != "":
			cursor = cursor.limit(literal_eval(limit_input))
		return jdumps(list(cursor), indent=4, default=str)
	except:
		return jsonify([]) 

#@app.after_request
def add_header_no_cache(r):
	r.headers["Pragma-Directive"] = "no-cache"
	r.headers["Pragma"] = "no-cache"
	r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
	r.headers["Cache-Directive"] = "no-cache"
	r.headers["Expires"] = "0"
	return r

#@app.before_request
#def require_authorization():
#	auth = request.headers.get("auth")
#	if auth != "UI076XJZo0pAMT2CN7DqJH3pybTnRU":
#		return jsonify("Please Login") 

def error_handler(error):
	return jsonify(Error="Exception")

for cls in HTTPException.__subclasses__():
	app.register_error_handler(cls, error_handler)