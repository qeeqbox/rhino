__G__ = "(G)bd249ce4"

from pymongo import MongoClient
from gridfs import GridFS
from ..settings import mongo_settings_localhost

def save_item_fs(db,filebuffer,name,uuid,_type,time):
    client = MongoClient(mongo_settings_localhost["url"]) #why?? bad idea
    item = GridFS(client[db]).put(filebuffer,filename=name,uuid=uuid,content_type=_type,encoding="utf-8")
    if item != None:
        return item
    else:
        return False

def update_task_logs(db,col,uuid,log):
    client = MongoClient(mongo_settings_localhost["url"]) #why?? bad idea
    client[db][col].update({"uuid": uuid}, {"$push": {"logs": log}}, upsert = True)

def update_task_files(db,col,uuid,_set):
    client = MongoClient(mongo_settings_localhost["url"]) #why?? bad idea
    client[db][col].update({"uuid": uuid}, {"$push": {"fileslist": _set}}, upsert = True)

def find_item(db,col,_set):
    client = MongoClient(mongo_settings_localhost["url"]) #why?? bad idea
    item = client[db][col].find_one(_set,{"_id": False})
    if item != None:
        return item
    else:
        return ""

def add_item(db,col,_set):
    client = MongoClient(mongo_settings_localhost["url"]) #why?? bad idea
    item = client[db][col].find_one(_set)
    if item == None:
        item = client[db][col].insert_one(_set)
        if item != None:
            return item
    return False

def get_item_fs(db,_set):
    client = MongoClient(mongo_settings_localhost["url"]) #why?? bad idea
    item = GridFS(client[db]).find_one(_set)
    if item != None:
        return item.read()
    else:
        return False

def update_item(db,col,uuid,_set):
    client = MongoClient(mongo_settings_localhost["url"]) #why?? bad idea
    item = client[db][col].find_one_and_update({"uuid": uuid},{"$set": _set})
    if item != None:
        return item
    else:
        return False

def find_set_update_item(db,col,_set_to_find,_set_to_update):
    client = MongoClient(mongo_settings_localhost["url"]) #why?? bad idea
    item = client[db][col].find_one_and_update(_set_to_find,_set_to_update)
    if item != None:
        return item
    else:
        return False


def update_item_in_dict(db,col,uuid,key,_set):
    client = MongoClient(mongo_settings_localhost["url"]) #why?? bad idea
    item, value = _set.items()[0]
    item = client[db][col].find_one_and_update({"uuid": uuid},{"$set": {key+"."+item:value}})
    if item != None:
        return item
    else:
        return False

#x = GridFS(MongoClient("mongodb://localhost:27017")["results"]).find_one({"uuid":"3a11faf1-80a2-4b0b-9359-0c52ac10f828"})