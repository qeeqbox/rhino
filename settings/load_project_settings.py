
__G__ = "(G)bd249ce4"

from json import dumps,load
from pymongo import MongoClient

with open('settings.json_default') as f:
    json_settings = load(f)
    mongo_settings_docker = json_settings["settings"]["mongo_settings_docker"]

client = MongoClient(mongo_settings_docker["url"])
coll = client[mongo_settings_docker["settings_db"]][mongo_settings_docker["settings_col"]]
x = coll.find_one("current_settings")
if x == None:
	coll.insert_one(json_settings)
