__G__ = "(G)bd249ce4"

from sys import path
path.append("/usr/lib/virtualbox/")
path.append("/usr/lib/virtualbox/sdk/bindings/xpcom/python/")
from virtualbox import VirtualBox, Session
from virtualbox.library import BitmapFormat, FileCopyFlag, MachineState, ProcessCreateFlag, SessionState
from redis import StrictRedis
from re import search, sub
from billiard.context import Process
from subprocess import Popen, PIPE
from time import time, sleep
from os import path
from psutil import Process as pProcess
from pickle import loads
from datetime import datetime
from json import dumps
from ast import literal_eval
from ..logger.logger import log_string
from ..processes.proc import kill_a_box
from ..settings import redis_settings_localhost,mongo_settings_localhost
from ..connections.mongodbconn import update_item,find_set_update_item,get_item_fs


#from ..tasks.tasks import custom_task
#removed virtualbox parser, will add it later on

scan_code_table = {"8":[0x0E,0x8E],"9":[0x0F,0x8F],"13":[0x1C,0x9C],"32":[57, 185],"33":[42, 2, 130, 170],"34":[42, 40, 168, 170],"35":[42, 4, 132, 170],"36":[42, 5, 133, 170],"37":[42, 6, 134, 170],"38":[42, 8, 136, 170],"39":[40, 168],"40":[42, 10, 138, 170],"41":[42, 11, 139, 170],"42":[42, 9, 137, 170],"43":[42, 13, 141, 170],"44":[51, 179],"45":[12, 140],"46":[52, 180],"47":[53, 181],"48":[11, 139],"49":[2, 130],"50":[3, 131],"51":[4, 132],"52":[5, 133],"53":[6, 134],"54":[7, 135],"55":[8, 136],"56":[9, 137],"57":[10, 138],"58":[42, 39, 167, 170],"59":[39, 167],"60":[42, 51, 179, 170],"61":[13, 141],"62":[42, 52, 180, 170],"63":[42, 53, 181, 170],"64":[42, 3, 131, 170],"65":[42, 30, 158, 170],"66":[42, 48, 176, 170],"67":[42, 46, 174, 170],"68":[42, 32, 160, 170],"69":[42, 18, 146, 170],"70":[42, 33, 161, 170],"71":[42, 34, 162, 170],"72":[42, 35, 163, 170],"73":[42, 23, 151, 170],"74":[42, 36, 164, 170],"75":[42, 37, 165, 170],"76":[42, 38, 166, 170],"77":[42, 50, 178, 170],"78":[42, 49, 177, 170],"79":[42, 24, 152, 170],"80":[42, 25, 153, 170],"81":[42, 16, 144, 170],"82":[42, 19, 147, 170],"83":[42, 31, 159, 170],"84":[42, 20, 148, 170],"85":[42, 22, 150, 170],"86":[42, 47, 175, 170],"87":[42, 17, 145, 170],"88":[42, 45, 173, 170],"89":[42, 21, 149, 170],"90":[42, 44, 172, 170],"91":[26, 154],"92":[43, 171],"93":[27, 155],"94":[42, 7, 135, 170],"95":[42, 12, 140, 170],"96":[41, 169],"97":[30, 158],"98":[48, 176],"99":[46, 174],"100":[32, 160],"101":[18, 146],"102":[33, 161],"103":[34, 162],"104":[35, 163],"105":[23, 151],"106":[36, 164],"107":[37, 165],"108":[38, 166],"109":[50, 178],"110":[49, 177],"111":[24, 152],"112":[25, 153],"113":[16, 144],"114":[19, 147],"115":[31, 159],"116":[20, 148],"117":[22, 150],"118":[47, 175],"119":[17, 145],"120":[45, 173],"121":[21, 149],"122":[44, 172],"123":[42, 26, 154, 170],"124":[42, 43, 171, 170],"125":[42, 27, 155, 170],"126":[42, 41, 169, 170]}


def vboxmanage_wrapper(uuid,cmd, remove_spaces):
    output,err = None,None
    try:
        cmd = ("timeout 5 vboxmanage {}".format(cmd)).split()
        p = Popen(cmd, stdin=PIPE, stdout=PIPE, stderr=PIPE)
        output, err = p.communicate()
        output = output.decode("utf-8")
        err = err.decode("utf-8")
        if remove_spaces:
          output = sub(" +", " ",output).replace("\n\n","\n")
        return output,err
    except:
        log_string(uuid,"vboxmanage_wrapper failed","Red")
        return output,err

def kill_vbox(uuid):
    output,err = None,None
    try:
        #cmd = ("pkill -9 VBox && killall VirtualBox && killall VirtualBoxVM".split())
        cmd = ("pkill -9 VBox".split())
        p = Popen(cmd, stdin=PIPE, stdout=PIPE, stderr=PIPE)
        output, err = p.communicate()
        output = output.decode("utf-8")
        err = err.decode("utf-8")
        return output,err
    except:
        log_string(uuid,"pkill failed","Red")
        return output,err

def show_status(uuid,vm):
  try:
    ret,err = vboxmanage_wrapper(uuid,"showvminfo {}".format(vm),True)
    if ret and not err:
      return search("Stat.*",ret).group(0)
  except:
    log_string(uuid,"show_status failed","Red")
    return ""


def start_vm(uuid,vm):
  ret,err = vboxmanage_wrapper(uuid,"startvm {}".format(vm),True)
  if ret and not err:
    return "Started"

def stop_vm(uuid,vm):
  ret,err = vboxmanage_wrapper(uuid,"controlvm {} poweroff".format(vm),True)
  if ret and not err:
    return "Stopped"

def force_stop_vm(uuid,vm):
  ret,err = vboxmanage_wrapper(uuid,"startvm {} --type emergencystop".format(vm),True)
  if ret and not err:
    return "Stopped"

def restore_snapshot(uuid,vm,snapshot):
  ret,err = vboxmanage_wrapper(uuid,"snapshot {} restore {}".format(vm,snapshot),True)
  if ret and not err:
    return "Restored"

def discard_state(uuid,vm,snapshot):
  ret,err = vboxmanage_wrapper(uuid,"discardstate {}".format(vm,snapshot),True)
  if ret and not err:
    return "Discarded"

def copy_from_vm(uuid,vm,user,password,src,dst):
  ret,err = vboxmanage_wrapper(uuid,"guestcontrol {} --username {} --password {} copyfrom {} {}".format(vm,user,password,src,dst),True)
  if ret and not err:
    return "Copied From VM"

def copy_to_vm(uuid,vm,user,password,src,dst):
  ret,err = vboxmanage_wrapper(uuid,"guestcontrol {} --username {} --password {} copyto {} {}".format(vm,user,password,src,dst),True)
  if ret and not err:
    return "Copied To VM"

def start_recording(uuid,vm):
  ret,err = vboxmanage_wrapper(uuid,"modifyvm {} --recording on".format(vm),True)
  if ret and not err:
    return "Started Recording"

def file_recording(uuid,vm,file):
  ret,err = vboxmanage_wrapper(uuid,"modifyvm {} --recordingfile {}".format(vm,file),True)
  if ret and not err:
    return "Added File"

def stop_recording(uuid,vm):
  ret,err = vboxmanage_wrapper(uuid,"modifyvm {} --recording stop".format(vm),True)
  if ret and not err:
    return "Stop Recording"

def paused_vm(uuid,vm):
  ret,err = vboxmanage_wrapper(uuid,"controlvm {} pause".format(vm),True)
  if ret and not err:
    return "paused"

def resumed_vm(uuid,vm):
  ret,err = vboxmanage_wrapper(uuid,"controlvm {} resume".format(vm),True)
  if ret and not err:
    return "Resumed"

def take_screenshot(uuid,vm,file_name):
  ret,err = vboxmanage_wrapper(uuid,"controlvm {} screenshotpng {}".format(vm,file_name),True)
  sleep(2)
  if ret and not err:
    return "Screenshot"

def kill_vm(uuid,vm):
    try:
        log_string(uuid,"Killing {} by vboxmanage".format(vm),"Green")
        force_stop_vm(uuid,vm)
        stop_vm(uuid,vm)
    finally:
        pass
    try:
        log_string(uuid,"Killing {} by psutil".format(vm),"Green")
        kill_a_box(vm)
    finally:
        pass

def turn_off(uuid,box,timeout):
    ret = False
    try:
        log_string(uuid,"{} Status {}".format(box["vm"],show_status(uuid,box["vm"])),"Yellow")
        timeout_start = time()
        virtual_machine = VirtualBox().find_machine(box["vm"])
        if Session().state == SessionState(2):
            Session().unlock_machine()
        if virtual_machine.state != MachineState.aborted:
            with virtual_machine.create_session() as session:
                if virtual_machine.state == MachineState.saved:
                    session.machine.discard_saved_state(True)
                elif virtual_machine.state != MachineState.powered_off:
                    session.console.power_down()
                    while virtual_machine.state != MachineState.powered_off and (time() < timeout_start + timeout):
                        log_string(uuid,"Waiting on {}".format(box["vm"]),"Yellow")
                        sleep(2)
            if virtual_machine.state == MachineState.powered_off:
                log_string(uuid,"VM is powered off {}".format(box["vm"]),"Yellow")        
        ret = True
    except Exception as e:
        log_string(uuid,"turn_off Failed {}".format(e),"Red")
    return ret

def restore_machine(uuid,box):
    restoring_machine = False
    ret = False
    try:
        virtual_machine = VirtualBox().find_machine(box["vm"])
        snap = virtual_machine.find_snapshot(box["snapshot"])
        with virtual_machine.create_session() as session:
            try:
                restoring = session.machine.restore_snapshot(snap)
                restoring.wait_for_completion(-1)
                if restoring.completed == 1:
                    log_string(uuid,"Restoring completed {}".format(box["vm"]),"Green")
                    restoring_machine = True
            except Exception as e:
                log_string(uuid,"start_task Failed {}".format(e),"Red")
            if restoring_machine:
                ret = True
    except Exception as e:
        log_string(uuid,"start_task Failed {}".format(e),"Red")
    return ret


def parse_actions(uuid,box,folder,session,gs,_list):
    encoded_list = literal_eval(dumps(_list))
    for action in encoded_list:
        find_set_update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],{"uuid":uuid,"actionslist.uuid":action["uuid"]},{"$set": {"actionslist.$.status":"started"}})
        ret = False
        process, stdout, stderr = None,None,None
        try:
            if action["type"] == "run":
                if action["input"]["application"] != "":
                    if action["input"]["arguments"] != "":
                        if box["os"] == "Windows":
                            gs.process_create(action["input"]["application"], [action["input"]["application"]]+literal_eval(action["input"]["arguments"]), [], [ProcessCreateFlag(1)], 0)
                            ret = True
                        if box["os"] == "Linux":
                            gs.process_create("bin/sh", ["-c"]+[action["input"]["application"]]+literal_eval(action["input"]["arguments"]), [], [ProcessCreateFlag(1)], 0)
                            ret = True
                    else:
                        if box["os"] == "Windows":
                            gs.process_create(action["input"]["application"], [], [], [ProcessCreateFlag(1)], 0)
                            ret = True
                        if box["os"] == "Linux":
                            gs.process_create("bin/sh", ["-c"]+[action["input"]["application"]], [], [ProcessCreateFlag(1)], 0)
                            ret = True
            elif action["type"] == "runwithtimeout":
                if action["input"]["application"] != "" and action["input"]["timeout"] != "":
                    if action["input"]["arguments"] != "":
                        process, stdout, stderr = gs.execute(action["input"]["application"],literal_eval(action["input"]["arguments"]),timeout_ms=int(action["input"]["timeout"])*1000)
                        ret = True
                    else:
                        process, stdout, stderr = gs.execute(action["input"]["application"],timeout_ms=int(action["input"]["timeout"])*1000)
                        ret = True
            elif action["type"] == "createfile":
                if action["input"]["filepath"] != "":
                    if box["os"] == "Windows":
                        process, stdout, stderr = gs.execute("%WINDIR%\\system32\\cmd.exe", ["/C","call>{}".format(action["input"]["filepath"])])
                        ret = True
                    if box["os"] == "Linux":
                        process, stdout, stderr = gs.execute("bin/sh", ["-c","touch {}".format(action["input"]["filepath"])])
                        ret = True
            elif action["type"] == "deletefile":
                if action["input"]["filepath"] != "":
                    if box["os"] == "Windows":
                        rocess, stdout, stderr = gs.execute("%WINDIR%\\system32\\cmd.exe", ["/C","del",action["input"]["filepath"]])
                        ret = True
                    if box["os"] == "Linux":
                        process, stdout, stderr = gs.execute("bin/sh", ["-c","rm {}".format(action["input"]["filepath"])])
                        ret = True
            elif action["type"] == "downloadfromvm":
                if action["input"]["filepath"] != "" and action["input"]["filename"] != "" and action["input"]["filename"] not in box["reserved"]:
                    progress = gs.file_copy_from_guest(action["input"]["filepath"],path.join(folder,action["input"]["filename"]), [FileCopyFlag(0)])
                    progress.wait_for_completion(timeout=-1)
                    ret = True
            elif action["type"] == "wait":
                if action["input"]["timeout"] != "":
                    sleep(int(action["input"]["timeout"]))
                    ret = True
            elif action["type"] == "screenshot":
                if action["input"]["filename"] != "":
                    take_screenshot(uuid,box["vm"],path.join(folder,action["input"]["filename"]))
                    ret = True
            elif action["type"] == "uploadtovm":
                if action["input"]["filepath"] != "" and action["input"]["filename"] != "" and action["input"]["filename"] not in box["reserved"]:
                    file = get_item_fs(mongo_settings_localhost["malware"],{"uuid":action["uuid"]})
                    with open(path.join(folder,action["input"]["filename"]), "wb") as f:
                        f.write(file)
                    progress = gs.file_copy_to_guest(path.join(folder,action["input"]["filename"]),action["input"]["filepath"], [FileCopyFlag(0)])
                    progress.wait_for_completion(timeout=-1)
                    ret = True
            elif action["type"] == "disablenetwork":
                if action["input"]["interface"] != "":
                    session.machine.get_network_adapter(int(action["input"]["interface"])).cable_connected = False
                    ret = True
            elif action["type"] == "enablenetwork":
                if action["input"]["interface"] != "":
                    session.machine.get_network_adapter(int(action["input"]["interface"])).cable_connected = True
                    ret = True
            if "saveoutput" in action["input"]:
                if action["input"]["saveoutput"] == "true":
                    find_set_update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],{"uuid":uuid,"actionslist.uuid":action["uuid"]},{"$set": {"actionslist.$.output":stdout}})
            log_string(uuid,"Action uuid {} type {} returned {}".format(action["uuid"],action["type"],ret),"Green")
        except Exception as e:
            log_string(uuid,"parse_actions failed on action uuid {} type {} returned {} exception {}".format(action["uuid"],action["type"],ret,e),"Red")

        sleep(1)
        find_set_update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],{"uuid":uuid,"actionslist.uuid":action["uuid"]},{"$set": {"actionslist.$.status":ret}})

def custom_task(uuid,box,actions_list):
    ret = False
    try:
        folder = path.join(box["temp"],uuid)
        file_recording(uuid,box["vm"],path.join(folder,box["screen_recorder"]))
        virtual_machine = VirtualBox().find_machine(box["vm"])
        with virtual_machine.create_session() as session:
            session.unlock_machine()
            file_recording(uuid,box["vm"],path.join(folder,box["screen_recorder"]))
            proc = virtual_machine.launch_vm_process(session, "headless","")
            proc.wait_for_completion(timeout=-1)
            #do not timeout the session.console.guest.create_session timeout_ms=5*1000 (some vms)
            with session.console.guest.create_session(box["user"], box["pass"]) as gs:
                #fix issues with display 
                if box["os"] == "Linux":
                    gs.environment_schedule_set("DISPLAY",":0")
                sleep(1)
                session.machine.recording_settings.enabled = True
                sleep(1)
                parse_actions(uuid,box,folder,session,gs,actions_list)
                sleep(1)
                session.machine.recording_settings.enabled = False
                take_screenshot(uuid,box["vm"],path.join(folder,box["screenshot"]))
                sleep(1)
                ret = True
            session.console.power_down()
    except Exception as e:
        log_string(uuid,"custom_task Failed {}".format(e),"Red")
    return ret

#removed - 

def vbox_remote_control(uuid,box):
    ret = False
    try:
        queue = StrictRedis(redis_settings_localhost["host"], redis_settings_localhost["port"], db=0)
        virtual_machine = VirtualBox().find_machine(box["vm"])
        vm_name_lock = "{}_lock".format(box["vm"])
        vm_name_frame = "{}_frame".format(box["vm"])
        vm_name_action = "{}_action".format(box["vm"])
        with virtual_machine.create_session() as session:
            session.unlock_machine()
            proc = virtual_machine.launch_vm_process(session, "headless","")
            proc.wait_for_completion(timeout=-1)
            with session.console.guest.create_session(box["user"], box["pass"]) as gs:
                h, w, _, _, _, _ = session.console.display.get_screen_resolution(0)
                update_item(mongo_settings_localhost["worker_db"],mongo_settings_localhost["worker_col_logs"],uuid,{"status":"live","started_time":datetime.now()})
                queue.set(vm_name_lock, "False")
                while queue.get(vm_name_lock) == b"False":
                    x,y,dz,dw,button_state,key = "false","false","false","false","false","false"
                    try:
                        t = queue.get(vm_name_action)
                        if t and t != "None":
                            x,y,dz,dw,button_state,key = loads(t)
                            #log_string(uuid,">>>>>>>>>> {} {} {} {} {} {}".format(x,y,dz,dw,button_state,key),"Red")
                    except e:
                        pass
                    try:
                        if key != "false":
                            session.console.keyboard.put_scancodes(list(scan_code_table[key]))
                        if "false" not in (x,y,dz,dw,button_state):
                            session.console.mouse.put_mouse_event_absolute(x,y,dz,dw,0)
                            if button_state == "leftclick":
                                session.console.mouse.put_mouse_event_absolute(x,y,dz,dw,1)
                                session.console.mouse.put_mouse_event_absolute(x,y,dz,dw,0)
                            elif button_state == "leftdoubleclick":
                                session.console.mouse.put_mouse_event_absolute(x,y,dz,dw,1)
                                session.console.mouse.put_mouse_event_absolute(x,y,dz,dw,0)
                            elif button_state == "rightclick":
                                session.console.mouse.put_mouse_event_absolute(x,y,dz,dw,2)
                                session.console.mouse.put_mouse_event_absolute(x,y,dz,dw,0)
                        queue.set(vm_name_action, "None")
                        png = session.console.display.take_screen_shot_to_array(0, h, w, BitmapFormat.png)
                        queue.set(vm_name_frame, png)
                    except:
                        pass
                    sleep(.2)
                ret = True
            session.console.power_down()
    except Exception as e:
        log_string(uuid,"custom_task Failed {}".format(e),"Red")
    return ret

def analyze_input_in_vm(uuid,box,actions_list):
    if turn_off(uuid,box,5):
        if restore_machine(uuid,box):
            if custom_task(uuid,box,actions_list):
                exit(True)
    exit(False)

class kill_vm_on_enter_and_exit(object):
    def __init__(self,uuid,box):
        self.uuid= uuid
        self.box = box

    def __enter__(self):
        kill_vm(self.uuid,self.box["vm"])
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        kill_vm(self.uuid,self.box["vm"])

class kill_vm_and_keys_on_enter_and_exit(object):
    def __init__(self,uuid,box):
        self.uuid= uuid
        self.box = box
        self.r = StrictRedis(host=redis_settings_localhost["host"], port=redis_settings_localhost["port"], db=0)
        self.vm_name_lock = "{}_lock".format(box["vm"])
        self.vm_name_frame = "{}_frame".format(box["vm"])
        self.vm_name_action = "{}_action".format(box["vm"])

    def __enter__(self):
        kill_vm(self.uuid,self.box["vm"])
        self.r.delete(self.vm_name_lock)
        self.r.delete(self.vm_name_frame)
        self.r.delete(self.vm_name_action)
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        kill_vm(self.uuid,self.box["vm"])
        self.r.delete(self.vm_name_lock)
        self.r.delete(self.vm_name_frame)
        self.r.delete(self.vm_name_action)

def analyze_input_wrapper_in_process(uuid,box,task,actions_list,process_wait_time):
    ret = False
    chrome_ouput, screen_recorder = None,None
    with kill_vm_on_enter_and_exit(uuid,box):
        p = Process(target=analyze_input_in_vm, args=(uuid,box,actions_list))
        p.start()
        p.join(process_wait_time)
        if p.is_alive():
            log_string(uuid,"Process time out, PID: {}".format(p.pid),"Red")
            pProcess(p.pid).kill()
        else:
            if p.exitcode == True:
                log_string(uuid,"custom_task finished successfully","Green")
                ret = True
            else:
                log_string(uuid,"custom_task finished with errors, exit code False","Red")
    return ret

def remote_control_vm(uuid,box):
    if turn_off(uuid,box,5):
        if restore_machine(uuid,box):
            if vbox_remote_control(uuid,box):
                exit(True)
    exit(False)

def remote_control_vm_in_process(uuid,box,process_wait_time):
    ret = False
    with kill_vm_and_keys_on_enter_and_exit(uuid,box):
        p = Process(target=remote_control_vm, args=(uuid,box))
        p.start()
        p.join(process_wait_time)
        if p.is_alive():
            log_string(uuid,"Process time out, PID: {}".format(p.pid),"Red")
            pProcess(p.pid).kill()
        else:
            if p.exitcode == True:
                log_string(uuid,"remote_control_vm finished successfully","Green")
                ret = True
            else:
                log_string(uuid,"remote_control_vm finished with errors, exit code False","Red")
    return ret

def test_task(uuid,box):
    ret = False
    try:
        folder = path.join(box["temp"],uuid)
        virtual_machine = VirtualBox().find_machine(box["vm"])
        with virtual_machine.create_session() as session:
            session.unlock_machine()
            proc = virtual_machine.launch_vm_process(session, "gui","")
            proc.wait_for_completion(timeout=-1)
            with session.console.guest.create_session(box["user"], box["pass"]) as gs:
                if box["os"] == "Linux":
                    gs.environment_schedule_set("DISPLAY",":0")
                    process, stdout, stderr = gs.execute("bin/ls")
                    if len(stdout) > 0:
                        ret = True
                elif box["os"] == "Windows": 
                    process, stdout, stderr = gs.execute("%WINDIR%\\system32\\cmd.exe", ["/C","dir"])
                    if len(stdout) > 0:
                        ret = True
            session.console.power_down()
    except Exception as e:
        log_string(uuid,"custom_task Failed {}".format(e),"Red")
    return ret

def test_vbox(uuid,box):
    if turn_off(uuid,box,5):
        if restore_machine(uuid,box):
            if test_task(uuid,box):
                exit(True)
    exit(False)
