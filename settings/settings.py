__G__ = "(G)bd249ce4"

from json import dumps,load

all_boxes,vbox_testing,mongo_settings_docker,celery_settings_localhost,celery_settings_docker,redis_settings_localhost,redis_settings_docker,backendkey = None,None,None,None,None,None,None,None

with open('settings/settings.json') as f:
    json_settings = load(f)
    all_boxes = json_settings["settings"]["all_boxes"]
    vbox_testing = json_settings["settings"]["vbox_testing"]
    mongo_settings_docker = json_settings["settings"]["mongo_settings_docker"]
    celery_settings_localhost = json_settings["settings"]["celery_settings_localhost"]
    celery_settings_docker = json_settings["settings"]["celery_settings_docker"]
    redis_settings_localhost = json_settings["settings"]["redis_settings_localhost"]
    redis_settings_docker = json_settings["settings"]["redis_settings_docker"]
    backendkey = json_settings["settings"]["backendkey"]
