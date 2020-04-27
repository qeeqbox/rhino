__G__ = "(G)bd249ce4"

from json import dumps, loads
from os import path
from io import open as ioopen
from ..logger.logger import log_string

class parse_net_export():
	def __init__(self):
		self.uuid,self.file_in,self.file_out = None,None,None
		self.data,self.log_event_types,self.reversed_log_event_types,self.log_source_types,self.reversed_log_source_types = None,None,None,None,None

	def parse_file(self,uuid,box):
		ret = False
		good = False
		try:
			self.uuid = uuid
			self.file_in = path.join(box["output"],self.uuid,box["chrome_ouput"])
			self.file_out = path.join(box["output"],self.uuid,box["chrome_ouput_parsed"])
			with ioopen(self.file_in, encoding="utf-8") as data_file:
				_buffer = data_file.read()
				try:
					log_string(uuid,"Parsing logs without trimming","Green")
					self.data = loads(_buffer)
					good = True
				except:
					log_string(uuid,"Parsing logs without trimming failed","Red")

				try:
					if not good:
						log_string(uuid,"Parsing logs with trimming","Green")
						self.data = loads(_buffer[:-2] + "]}")
						good = True
				except:
					log_string(uuid,"Parsing logs with trimming failed","Red")

				if good:
					self.log_event_types = self.data["constants"]["logEventTypes"]
					self.reversed_log_event_types = dict(map(reversed, self.log_event_types.items()))
					self.log_source_types = self.data["constants"]["logSourceType"]
					self.reversed_log_source_types = dict(map(reversed, self.log_source_types.items()))
					log_string(uuid,"Log file has been parsed","Green")
					ret = True
		except Exception as e:
			log_string(uuid,"parse_file Failed {}".format(e),"Red")
		return ret

	def convert_tick_time(self,ticks):
		#todo
		return ticks

	def find_headers_and_url(self):
		_list = []
		for item in self.data["events"]:
			try:
				if "source" in item:
					if item["source"]["type"] == self.log_source_types["URL_REQUEST"]:
						if "params" in item:
							if "url" in item["params"]:
								_list.append({"source_type":self.reversed_log_source_types[item["source"]["type"]],"url":item["params"]["url"],"method":item["params"]["method"],"event_type":self.reversed_log_event_types[item["type"]],"time":item["time"]})
							elif "headers" in item["params"]:
								_list.append({"source_type":self.reversed_log_source_types[item["source"]["type"]],"headers":item["params"]["headers"],"event_type":self.reversed_log_event_types[item["type"]],"time":item["time"]})
			except:
				pass
		return self.beautify_json(_list)

	def find_headers_and_url_save(self):
		ret = False
		try:
			x = self.find_headers_and_url()
			if len(x) > 0:
				with ioopen(self.file_out,"w",encoding="utf-8") as output_file:
					output_file.write(unicode(dumps(x, ensure_ascii=False, indent=4)))
				#with open(self.file_out, "w", encoding="utf-8") as output_file:
				#	dump(x, output_file, ensure_ascii=False, indent=4)
					log_string(self.uuid,"Extracted headers and URLs","Green")
					ret = True
		except Exception as e:
			log_string(self.uuid,"find_headers_and_url_save Failed {}".format(e),"Red")
		return ret

	def find_urls(self):
		_list = []
		for item in self.data["events"]:
			try:
				if "source" in item:
					if item["source"]["type"] == self.log_source_types["URL_REQUEST"]:
						if "params" in item:
							if "url" in item["params"]:
								_list.append({"url":item["params"]["url"],"method":item["params"]["method"],"time":self.convert_tick_time(item["time"])})
			except Exception:
				pass
		return self.beautify_json(_list)

	def parse_events(self):
		_list = []
		for item in self.data["events"]:
			try: 
				_list.append(self.reversed_log_source_types[item["source"]["type"]],self.reversed_log_event_types[item["type"]])
			except:
				pass
		return self.beautify_json(_list)

	def beautify_json(self,data):
		#return dumps(data, sort_keys=True, indent=4)
		return data

