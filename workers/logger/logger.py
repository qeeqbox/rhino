__G__ = "(G)bd249ce4"

from logging import DEBUG, Handler, getLogger
from os import path
from sys import stdout
from datetime import datetime
from os import path
from ..settings import mongo_settings_localhost
from ..connections.mongodbconn import update_task_logs

dynamic_logger = None
if dynamic_logger == None:
    dynamic_logger = getLogger("analyzerdynamic_logger")

class colors:
    Restore = '\033[0m'
    Black="\033[030m"
    Red="\033[91m"
    Green="\033[32m"
    Yellow="\033[33m"
    Blue="\033[34m"
    Purple="\033[35m"
    Cyan="\033[36m"
    White="\033[37m"

green_x = '{}{}{}'.format(colors.Green,"X",colors.Restore)
exclamation_mark = '{}{}{}'.format(colors.Yellow,"!",colors.Restore)
red_mark = '{}{}{}'.format(colors.Red,">",colors.Restore)
yellow_hashtag = '{}{}{}'.format(colors.Yellow,"#",colors.Restore)

class CustomHandler(Handler):
    def __init__(self,file):
        Handler.__init__(self)
        self.logsfile = open(file,'w')

    def emit(self, record):
        print("{} {} {}".format(record.msg[0],record.msg[1],record.msg[2]))
        stdout.flush()
        self.logsfile.write("{} {} {}\n".format(record.msg[0],record.msg[1],record.msg[2]))
        self.logsfile.flush()
        update_task_logs(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],record.msg[1],"{} {}".format(record.msg[0],record.msg[2]))

def log_string(uuid,_str,color):
    '''
    output str with color and symbol (they are all as info)
    '''
    ctime = datetime.utcnow()
    if color == "Green":
        dynamic_logger.info([ctime,uuid,_str,green_x])
    elif color == "Yellow":
        dynamic_logger.info([ctime,uuid,_str,exclamation_mark])
    elif color == "Red":
        dynamic_logger.info([ctime,uuid,_str,red_mark])
    elif color == "Yellow#":
        dynamic_logger.info([ctime,uuid,_str,yellow_hashtag])

def setup_logger(v_dict,uuid):
    #dynamic_logger.handlers.clear()
    del dynamic_logger.handlers[:]
    dynamic_logger.setLevel(DEBUG)
    dynamic_logger.addHandler(CustomHandler(path.join(v_dict["temp"],uuid,v_dict["logs"])))