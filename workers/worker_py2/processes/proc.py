from psutil import process_iter
from psutil import Process as Pprocess

def kill_process(process):
	process = Pprocess(process.pid)
	for proc in process.children(recursive=True) + [process]:
		proc.terminate()
		proc.kill()

def kill_all_boxes(all_boxes):
	for box in all_boxes.keys():
		for proc in process_iter():
			if all_boxes[box]["vm"] in proc.cmdline():
				kill_process(proc)

def kill_a_box(vm):
	for proc in process_iter():
		if vm in proc.cmdline():
			kill_process(proc)

def kill_processes(processes):
	for proc in processes:
		kill_process(proc)