import React from 'react';
import LoadingSpinner from '../spinner/LoadingSpinner.js'
import Results from './Results.js'
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import { backendurls } from '../auth/GlobalVars.js';
import { sendpostajaxrequest, sendpostuploadrequest, sendgetajaxrequest } from '../auth/GlobalFunctions.js'
import { List, arrayMove } from "react-movable";
import { v4 as uuidv4 } from 'uuid';
import CheckMarkIcon from '../../assets/checkmarkicon.js';
import CloseIcon from '../../assets/closeicon.js';
import PlayIcon from '../../assets/playicon.js';
import TrashIcon from '../../assets/trashicon.js';

const styles = StyleSheet.create({
  container: {
    padding: '10px 10px 10px 10px',
    fontFamily: 'monospace',
    marginBottom: 10,
    overflowX: 'hidden'
  },
  listofrows: {
    backgroundColor: '#ffffff',
    padding: 10,
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
  addheight: {
    height: '20px'
  },
  custominputextrainputheight: {
    height: '20px'
  },
  separatorheight: {
    minHeight: 10,
  },
  separatorwidth: {
    minWidth: 10,
  },
  custombutton: {
    backgroundColor: '#ffffff',
    border: '1px solid #b1b5b8',
    height: '100%'
  },
  custombuttonremove: {
    backgroundColor: '#ffffff',
    border: 'none',
    height: '100%',
    width: '100%',
    padding: 0,
    margin: 0
  },
  custominput: {
    resize: 'none',
    backgroundColor: '#ffffff',
    height: '100%',
    border: 'none',
    borderBottom: '1px solid #b1b5b8',
    '&::placeholder': {
      fontStyle: 'italic',
      colro: 'red'
    },
    lineHeight: '20px'
  },
  custominputextrainput: {
    resize: 'none',
    backgroundColor: '#ffffff',
    border: 'none',
    borderBottom: '1px solid #b1b5b8',
    height: '100%',
  },
  custominputextrainputfileupload: {
    resize: 'none',
    backgroundColor: '#ffffff',
    border: 'none',
    height: '100%',
  },
  customcolumn: {
    backgroundColor: '#ffffff',
    padding: '10px 10px 10px 10px',
    marginBottom: 10,
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
  customselect: {
    backgroundColor: '#ffffff',
    fontSize: 12,
    height: '100%',
    border: 'none',
    borderBottom: '1px solid #b1b5b8',
    lineHeight: '20px'
  },
  customtextarea: {
    width: '100%',
    height: '100%',
    borderColor: 'Transparent',
    background: 'none',
    backgroundColor: '#ffffff',
    whiteSpace: 'pre-wrap'
  },
  customlable: {
    backgroundColor: '#ffffff',
    fontSize: 12,
    border: 'none',
    lineHeight: '20px',
    whiteSpace: 'nowrap'
  },
  customlablebutton: {
    backgroundColor: '#ffffff',
    fontSize: 12,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    paddingLeft: '5px',
    paddingRight: '5px',
    border: '1px solid #b1b5b8',
  },
  customwidthtimeout: {
    width: 30,
    resize: 'none',
    backgroundColor: '#ffffff',
    border: 'none',
    borderBottom: '1px solid #b1b5b8',
    height: '100%',
  },
  indexwidth: {
    width: 25
  },
  action: {
    width: 150
  },
  separator: {
    width: 1,
    height: 20,
    lineHeight: '20px',
    backgroundColor: '#b1b5b8',
    marginRight: 20
  },
  nobullets: {
    padding: '0px 0px 0px 0px',
    listStyleType: 'none',
    width: '100%'
  },
  libackground: {
    padding: '5px 5px 5px 5px',
    backgroundColor: '#ffffff',
    listStyleType: 'none'
  },
  custompadding: {
    padding: '5px 5px 5px 5px',
    height: '20px',
    lineHeight: '20px'
  },
  customstatus: {
    width: 25,
    height: 20,
    lineHeight: '20px',
  }
});

const sleep = (mil) => {
  return new Promise(resolve => setTimeout(resolve, mil))
}

export default class ProcessTask extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      vbox: "",
      tasktimeout: "60",
      task_id: "",
      singleormulti: "single",
      taskname: "custom_task",
      optionalsettings: "",
      actionslist: [],
      saveactionslist: [],
      actionslistresults: [],
      boxes:[],
    }
  }


  setstateasync(state) {
    return new Promise((resolve) => {this.setState(state, resolve)});
  }

  async componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      await this.getsavedactions()
      const _data = await sendgetajaxrequest(backendurls.boxeslist, []);
      if (_data.length > 0){
        await this.setstateasync({boxes:Object.values(_data),vbox:Object.values(_data)[0].value})
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  clickhandle = async (event) => {
    try {
      var stop = false;

      if (!this.state.tasktimeout || !this.state.tasktimeout.length > 0 || !this.state.vbox || !this.state.vbox.length > 0 || !this.state.singleormulti || !this.state.singleormulti.length > 0 || !this.state.actionslist || !this.state.actionslist.length > 0) {
        return
      }

      await this.setstateasync({ loading: true })

      let data = JSON.stringify({
        tasktimeout: this.state.tasktimeout,
        vbox: this.state.vbox,
        taskname: this.state.taskname,
        optionalsettings: this.state.optionalsettings,
        singleormulti: this.state.singleormulti,
        actionslist: this.state.actionslist
      })

      if (this.state.singleormulti === "single") {
        for (const [index, value] of this.state.actionslist.entries()) {
          if (value.type === "uploadtovm") {
            if (value.input.filepath && value.input.filepath.length > 1) {
              const data = new FormData()
              //data.append('uuid',value.uuid) if you need more files added, or other data
              //data.append('file', value.input.file2)
              data.append('file', value.input.file)
              const ret = await sendpostuploadrequest(backendurls.addmalware + value.uuid, data, "")
              if (ret !== "Uploaded") {
                await this.setstateasync({ loading: false, task_id: "" })
                return
              }
            }
            else {
              await this.setstateasync({ loading: false, task_id: "" })
              return
            }
          }
        }

        const rettaskid = await sendpostajaxrequest(backendurls.addtask, data, {});

        if (rettaskid.task_id !== 0 && rettaskid.task_id) {
          await this.setstateasync({ task_id: rettaskid.task_id })
          while (!stop) {
            const retstatus = await sendpostajaxrequest(backendurls.checktask, JSON.stringify({task_id: rettaskid.task_id}), {});
            const actionslistresults = await sendgetajaxrequest(backendurls.actionslist + rettaskid.task_id, []);
            if (retstatus.status === "done") {
              stop = true
              await this.setstateasync({ loading: false, task_id: rettaskid.task_id, actionslistresults: [] })
              return
            }
            else if (retstatus.status === "false") {
              stop = true
              await this.setstateasync({ loading: false, task_id: "", actionslistresults: [] })
              return
            }
            await this.setstateasync({ actionslistresults: actionslistresults })
            await sleep(2000);
          }
        }
      }
    }
    catch{
    }

    await this.setstateasync({ loading: false, task_id: "" })
  };

  saveactionslistclick = async (_type) => {
    await this.setstateasync({ loading: true })
    await sendpostajaxrequest(backendurls.actionslistperuser, JSON.stringify({taskname: this.state.taskname,optionalsettings: this.state.optionalsettings,actionslist: this.state.actionslist,token: window.sessionStorage.getItem("token"),type: _type}), []);
    await this.getsavedactions()
    await this.setstateasync({ loading: false })
  };

  deleteactionslistclick = async (_type) => {
    await this.setstateasync({ loading: true })
    await sendpostajaxrequest(backendurls.actionslistperuser, JSON.stringify({taskname: this.state.taskname,token: window.sessionStorage.getItem("token"),type: _type}), []);
    await this.getsavedactions()
    await this.setstateasync({ loading: false, actionslist: [] })
  };

  getsavedactions = async () => {
    await this.setstateasync({ loading: true })
    const _data = await sendpostajaxrequest(backendurls.actionslistperuser, JSON.stringify({token: window.sessionStorage.getItem("token"),type: "getlist"}), []);
    if (_data !== '') {
      await this.setstateasync({ saveactionslist: _data })
    }
    await this.setstateasync({ loading: false })
  }

  handleChange = event => {
    this.setState({ [event.target.id]: event.target.value });
  }

  handleChangeAction = async (uuid, index, type, event) => {
    const newItems = [...this.state.actionslist];
    const uuidindex = this.state.actionslist.findIndex(obj => obj.uuid === uuid)
    const key = event.target.id.substring((uuid + "_").length);
    if (key === "saveoutput" && type === "runwithtimeout") {
      const val = newItems[index].input["saveoutput"] === "false" ? "true" : "false"
      newItems[uuidindex].input = { ...newItems[index].input, [key]: val }
    }
    else {
      newItems[uuidindex].input = { ...newItems[index].input, [key]: event.target.value }
    }
    await this.setstateasync({ actionslist: newItems });
  }

  handlesavedtaskclick = async (event) => {
    await this.setstateasync({ taskname: event.target.value, actionslist: this.state.saveactionslist[event.target.value].actionslist, optionalsettings: this.state.saveactionslist[event.target.value].optionalsettings });
  }

  handleChangeActionFile = async (uuid, index, type, event) => {
    const newItems = [...this.state.actionslist];
    const uuidindex = this.state.actionslist.findIndex(obj => obj.uuid === uuid)
    const key = event.target.id.substring((uuid + "_").length);
    newItems[uuidindex].input = { ...newItems[index].input, [key]: event.target.files[0] }
    newItems[uuidindex].input = { ...newItems[index].input, filename: event.target.files[0].name }
    await this.setstateasync({ actionslist: newItems });
  }

  getActionValue = (uuid, index, id) => {
    const uuidindex = this.state.actionslist.findIndex(obj => obj.uuid === uuid)
    const key = id.substring((uuid + "_").length);
    return this.state.actionslist[uuidindex].input[key];
  }

  checkActionValueResults = (uuid, index) => {
    try {
      //const uuidindex = this.state.actionslist.findIndex(obj => obj.uuid === uuid)
      const ret = this.state.actionslistresults[index].status;
      if (ret === "started") {
        return <PlayIcon />
      }
      else if (ret === false) {
        return <CloseIcon />
      }
      else if (ret === true) {
        return <CheckMarkIcon />
      }
      else {
        return <button className={css(styles.custombuttonremove)} onClick={() => this.handleActionRemove(uuid, index)} ><TrashIcon /></button>
      }
    }
    catch (e) { }
    return <button className={css(styles.custombuttonremove)} onClick={() => this.handleActionRemove(uuid, index)} ><TrashIcon /></button>
  }

  handleActionClick = async (event) => {
    const _uuid = uuidv4()
    switch (event.target.value) {
      case 'run':
        const tempruninput = {
          "application": "",
          "arguments": "[]",
        }
        await this.setstateasync({ actionslist: [...this.state.actionslist, { uuid: _uuid, type: "run", input: tempruninput, status: "added" }] })
        break
      case 'runwithtimeout':
        const temprunwithtimeoutinput = {
          "application": "",
          "arguments": "[]",
          "timeout": "1",
          "saveoutput": "false",
        }
        await this.setstateasync({ actionslist: [...this.state.actionslist, { uuid: _uuid, type: "runwithtimeout", input: temprunwithtimeoutinput, status: "added" }] })
        break
      case 'wait':
        const tempwaitinput = {
          "timeout": "1"
        }
        await this.setstateasync({ actionslist: [...this.state.actionslist, { uuid: _uuid, type: "wait", input: tempwaitinput, status: "added" }] })
        break
      case 'createfile':
        const tempcreatefileinput = {
          "filepath": ""
        }
        await this.setstateasync({ actionslist: [...this.state.actionslist, { uuid: _uuid, type: "createfile", input: tempcreatefileinput, status: "added" }] })
        break
      case 'deletefile':
        const tempdeletefileinput = {
          "filepath": ""
        }
        await this.setstateasync({ actionslist: [...this.state.actionslist, { uuid: _uuid, type: "deletefile", input: tempdeletefileinput, status: "added" }] })
        break
      case 'downloadfromvm':
        const tempdownloadfromvminput = {
          "filepath": "",
          "filename": "",
        }
        await this.setstateasync({ actionslist: [...this.state.actionslist, { uuid: _uuid, type: "downloadfromvm", input: tempdownloadfromvminput, status: "added" }] })
        break
      case 'screenshot':
        const tempscreenshotinput = {
          "filename": "",
        }
        await this.setstateasync({ actionslist: [...this.state.actionslist, { uuid: _uuid, type: "screenshot", input: tempscreenshotinput, status: "added" }] })
        break
      case 'uploadtovm':
        const tempuploadtovminput = {
          "file": "",
          "filepath": "",
          "filename": "",
        }
        await this.setstateasync({ actionslist: [...this.state.actionslist, { uuid: _uuid, type: "uploadtovm", input: tempuploadtovminput, status: "added" }] })
        break
      case 'disablenetwork':
        const tempdisablenetworkinput = {
          "interface": "0"
        }
        await this.setstateasync({ actionslist: [...this.state.actionslist, { uuid: _uuid, type: "disablenetwork", input: tempdisablenetworkinput, status: "added" }] })
        break
      case 'enablenetwork':
        const tempenablenetworkinput = {
          "interface": "0"
        }
        await this.setstateasync({ actionslist: [...this.state.actionslist, { uuid: _uuid, type: "enablenetwork", input: tempenablenetworkinput, status: "added" }] })
        break
      default:
    }
  }

  handleRenderingItem = (obj, index) => {
    switch (obj.type) {
      case 'run':
        return this.run(obj.uuid, index)
      case 'runwithtimeout':
        return this.runwithtimeout(obj.uuid, index)
      case 'wait':
        return this.wait(obj.uuid, index)
      case 'createfile':
        return this.createfile(obj.uuid, index)
      case 'deletefile':
        return this.deletefile(obj.uuid, index)
      case 'downloadfromvm':
        return this.downloadfromvm(obj.uuid, index)
      case 'screenshot':
        return this.screenshot(obj.uuid, index)
      case 'uploadtovm':
        return this.uploadtovm(obj.uuid, index)
      case 'disablenetwork':
        return this.disablenetwork(obj.uuid, index)
      case 'enablenetwork':
        return this.enablenetwork(obj.uuid, index)
      default:
        return
    }
  }

  handleActionRemove = async (uuid, index) => {
    await this.setstateasync({ actionslist: this.state.actionslist.filter((_, i) => i !== index) });
  }

  handleCloseTask = event => {
    this.setState({ loading: false, task_id: "" })
  }

  //process, stdout, stderr = gs.execute('%SystemRoot%\\System32\\cmd.exe',['/C', 'echo'," ",">",guest_json_logs],timeout_ms=5*1000)

  run(uuid, index) {
    return (
      <Row className={css(styles.addheight)}>
        <Column className={css(styles.indexwidth)}>
          <label className={css(styles.customlable)}>{index}</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column className={css(styles.action)}>
          <label className={css(styles.customlable)}>Run</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Absolute App Path</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominputextrainput)} type="text" id={uuid + "_" + "application"} onChange={(e) => this.handleChangeAction(uuid, index, "run", e)} value={this.getActionValue(uuid, index, uuid + "_" + "application")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Arguments</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominputextrainput)} type="text" id={uuid + "_" + "arguments"} onChange={(e) => this.handleChangeAction(uuid, index, "run", e)} value={this.getActionValue(uuid, index, uuid + "_" + "arguments")} />
        </Column>
        <Column flexGrow={1} className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.customstatus)}>
          {this.checkActionValueResults(uuid, index)}
        </Column>
      </Row>
    )
  }

  runwithtimeout(uuid, index) {
    return (
      <Row className={css(styles.addheight)}>
        <Column className={css(styles.indexwidth)}>
          <label className={css(styles.customlable)}>{index}</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column className={css(styles.action)}>
          <label className={css(styles.customlable)}>Run</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Absolute App Path</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominputextrainput)} type="text" id={uuid + "_" + "application"} onChange={(e) => this.handleChangeAction(uuid, index, "runwithtimeout", e)} value={this.getActionValue(uuid, index, uuid + "_" + "application")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Arguments</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominputextrainput)} type="text" id={uuid + "_" + "arguments"} onChange={(e) => this.handleChangeAction(uuid, index, "runwithtimeout", e)} value={this.getActionValue(uuid, index, uuid + "_" + "arguments")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Timeout</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.customwidthtimeout)} type="text" id={uuid + "_" + "timeout"} onChange={(e) => this.handleChangeAction(uuid, index, "runwithtimeout", e)} value={this.getActionValue(uuid, index, uuid + "_" + "timeout")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.addheight)} vertical='center' horizontal='center'>
          <label className="checkbox">
            <input type="checkbox" id={uuid + "_" + "saveoutput"} checked={(this.getActionValue(uuid, index, uuid + "_" + "saveoutput")) === "false" ? false : true} onChange={(e) => this.handleChangeAction(uuid, index, "runwithtimeout", e)} />
            <span>Save Output</span>
          </label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.customstatus)}>
          {this.checkActionValueResults(uuid, index)}
        </Column>
      </Row>
    )
  }

  wait(uuid, index) {
    return (
      <Row className={css(styles.addheight)}>
        <Column className={css(styles.indexwidth)}>
          <label className={css(styles.customlable)}>{index}</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column className={css(styles.action)}>
          <label className={css(styles.customlable)}>Wait</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Timeout</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.customwidthtimeout)} type="text" id={uuid + "_" + "timeout"} onChange={(e) => this.handleChangeAction(uuid, index, "wait", e)} value={this.getActionValue(uuid, index, uuid + "_" + "timeout")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.customstatus)}>
          {this.checkActionValueResults(uuid, index)}
        </Column>
      </Row>
    )
  }

  createfile(uuid, index) {
    return (
      <Row className={css(styles.addheight)}>
        <Column className={css(styles.indexwidth)}>
          <label className={css(styles.customlable)}>{index}</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column className={css(styles.action)}>
          <label className={css(styles.customlable)}>Create File</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Absolute File Path</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominputextrainput)} type="text" id={uuid + "_" + "filepath"} onChange={(e) => this.handleChangeAction(uuid, index, "createfile", e)} value={this.getActionValue(uuid, index, uuid + "_" + "filepath")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.customstatus)}>
          {this.checkActionValueResults(uuid, index)}
        </Column>
      </Row>
    )
  }

  deletefile(uuid, index) {
    return (
      <Row className={css(styles.addheight)}>
        <Column className={css(styles.indexwidth)}>
          <label className={css(styles.customlable)}>{index}</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column className={css(styles.action)}>
          <label className={css(styles.customlable)}>Delete File</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Absolute File Path</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominputextrainput)} type="text" id={uuid + "_" + "filepath"} onChange={(e) => this.handleChangeAction(uuid, index, "deletefile", e)} value={this.getActionValue(uuid, index, uuid + "_" + "filepath")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.customstatus)}>
          {this.checkActionValueResults(uuid, index)}
        </Column>
      </Row>
    )
  }

  downloadfromvm(uuid, index) {
    return (
      <Row className={css(styles.addheight)}>
        <Column className={css(styles.indexwidth)}>
          <label className={css(styles.customlable)}>{index}</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column className={css(styles.action)}>
          <label className={css(styles.customlable)}>Download From VM</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Absolute File Path</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominputextrainput)} type="text" id={uuid + "_" + "filepath"} onChange={(e) => this.handleChangeAction(uuid, index, "downloadfromvm", e)} value={this.getActionValue(uuid, index, uuid + "_" + "filepath")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>To File Name</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominputextrainput)} type="text" id={uuid + "_" + "filename"} onChange={(e) => this.handleChangeAction(uuid, index, "downloadfromvm", e)} value={this.getActionValue(uuid, index, uuid + "_" + "filename")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.customstatus)}>
          {this.checkActionValueResults(uuid, index)}
        </Column>
      </Row>
    )
  }

  uploadtovm(uuid, index) {
    return (
      <Row className={css(styles.addheight)}>
        <Column className={css(styles.indexwidth)}>
          <label className={css(styles.customlable)}>{index}</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column className={css(styles.action)}>
          <label className={css(styles.customlable)}>Upload To VM</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>File Name (a-zA-W0-9._-)</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.addheight)}>
          <label className={css(styles.customlablebutton)} forHtml={uuid + "_" + "file"}>Browse...</label>
          <input id={uuid + "_" + "file"} type="file" onChange={(e) => this.handleChangeActionFile(uuid, index, "uploadtovm", e)} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <input disabled className={css(styles.custominputextrainputfileupload)} type="text" id={uuid + "_" + "filename"} onChange={(e) => this.handleChangeAction(uuid, index, "uploadtovm", e)} value={this.getActionValue(uuid, index, uuid + "_" + "filename")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>To Absolute File Path</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominputextrainput)} type="text" id={uuid + "_" + "filepath"} onChange={(e) => this.handleChangeAction(uuid, index, "uploadtovm", e)} value={this.getActionValue(uuid, index, uuid + "_" + "filepath")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.customstatus)}>
          {this.checkActionValueResults(uuid, index)}
        </Column>
      </Row>
    )
  }

  screenshot(uuid, index) {
    return (
      <Row className={css(styles.addheight)}>
        <Column className={css(styles.indexwidth)}>
          <label className={css(styles.customlable)}>{index}</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column className={css(styles.action)}>
          <label className={css(styles.customlable)}>Take Screenshot</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>File Name</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominputextrainput)} type="text" id={uuid + "_" + "filename"} onChange={(e) => this.handleChangeAction(uuid, index, "screenshot", e)} value={this.getActionValue(uuid, index, uuid + "_" + "filename")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.customstatus)}>
          {this.checkActionValueResults(uuid, index)}
        </Column>
      </Row>
    )
  }

  disablenetwork(uuid, index) {
    return (
      <Row className={css(styles.addheight)}>
        <Column className={css(styles.indexwidth)}>
          <label className={css(styles.customlable)}>{index}</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column className={css(styles.action)}>
          <label className={css(styles.customlable)}>Disable Network</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Interface</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.customwidthtimeout)} type="text" id={uuid + "_" + "interface"} onChange={(e) => this.handleChangeAction(uuid, index, "disablenetwork", e)} value={this.getActionValue(uuid, index, uuid + "_" + "interface")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.customstatus)}>
          {this.checkActionValueResults(uuid, index)}
        </Column>
      </Row>
    )
  }

  enablenetwork(uuid, index) {
    return (
      <Row className={css(styles.addheight)}>
        <Column className={css(styles.indexwidth)}>
          <label className={css(styles.customlable)}>{index}</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column className={css(styles.action)}>
          <label className={css(styles.customlable)}>Enable Network</label>
        </Column>
        <Column className={css(styles.separator)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Interface</label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.customwidthtimeout)} type="text" id={uuid + "_" + "interface"} onChange={(e) => this.handleChangeAction(uuid, index, "enablenetwork", e)} value={this.getActionValue(uuid, index, uuid + "_" + "interface")} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.customstatus)}>
          {this.checkActionValueResults(uuid, index)}
        </Column>
      </Row>
    )
  }

  render() {
    const vboxlist = this.state.boxes
    const tasktimeoutlist = [
      { label: "30", value: "30", disabled: false },
      { label: "60", value: "60", disabled: false },
      { label: "120", value: "120", disabled: false },
      { label: "180", value: "180", disabled: false },
      { label: "240", value: "240", disabled: false },
    ];

    let actions = (
      <Row className={css(styles.listofrows)}>
        {this.state.actionslist.length > 0 ?
          <List
            values={this.state.actionslist}
            onChange={({ oldIndex, newIndex }) => this.setState({ actionslist: arrayMove(this.state.actionslist, oldIndex, newIndex) })}
            renderList={({ children, props }) => <ul className={css(styles.nobullets)} {...props}>{children}</ul>}
            renderItem={({ value, props, index }) => <li className={css(styles.libackground)} {...props}>{this.handleRenderingItem(value, index)}</li>}
          />
          :
          <label className={css(styles.customlable)}>Please Add Actions</label>}
      </Row>
    )

    let savedtasks = (
      <Row wrap={true} className={css(styles.listofrows)}>
        {Object.keys(this.state.saveactionslist).length > 0 ? Object.keys(this.state.saveactionslist).map((key, index) => (
          <Column key={"saveactionslist_" + key} className={css(styles.custompadding)}>
            <button className={css(styles.custombutton)} value={key} onClick={this.handlesavedtaskclick} >{key}</button>
          </Column>
        )) : <Column>You do not have any saved tasks</Column>}
      </Row>)

    let options = (
      <Row wrap={true} className={css(styles.listofrows)}>
        <Column>
          <label className={css(styles.custompadding)}>Actions: </label>
        </Column>
        <Column className={css(styles.custompadding)}>
          <button className={css(styles.custombutton)} value="run" onClick={this.handleActionClick} >Run</button>
        </Column>
        <Column className={css(styles.custompadding)}>
          <button className={css(styles.custombutton)} value="runwithtimeout" onClick={this.handleActionClick} >Run (Timeout)</button>
        </Column>
        <Column className={css(styles.custompadding)}>
          <button className={css(styles.custombutton)} value="wait" onClick={this.handleActionClick} >Wait</button>
        </Column>
        <Column className={css(styles.custompadding)}>
          <button className={css(styles.custombutton)} value="uploadtovm" onClick={this.handleActionClick} >Upload To VM</button>
        </Column>
        <Column className={css(styles.custompadding)}>
          <button className={css(styles.custombutton)} value="downloadfromvm" onClick={this.handleActionClick} >Download From VM</button>
        </Column>
        <Column className={css(styles.custompadding)}>
          <button className={css(styles.custombutton)} value="screenshot" onClick={this.handleActionClick} >Screenshot</button>
        </Column>
        <Column className={css(styles.custompadding)}>
          <button className={css(styles.custombutton)} value="createfile" onClick={this.handleActionClick} >Create File</button>
        </Column>
        <Column className={css(styles.custompadding)}>
          <button className={css(styles.custombutton)} value="deletefile" onClick={this.handleActionClick} >Delete File</button>
        </Column>
        <Column className={css(styles.custompadding)}>
          <button className={css(styles.custombutton)} value="disablenetwork" onClick={this.handleActionClick} >Disable Network</button>
        </Column>
        <Column className={css(styles.custompadding)}>
          <button className={css(styles.custombutton)} value="enablenetwork" onClick={this.handleActionClick} >Enable Network</button>
        </Column>
      </Row>
    )

    let submitform = (
      <Row className={css(styles.listofrows)}>
        <Column>
          <label className={css(styles.customlable)}>VM Name: </label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <select id="vbox" name="vbox" value={this.state.vbox} className={css(styles.customselect)} onChange={this.handleChange}>
            {vboxlist.map((e, key) => {
              return (!e.disabled ? <option key={"vbox" + key} value={e.value}>{e.label} </option> : <option key={"vbox" + key} value={e.value} disabled>{e.label} </option>)
            })}
          </select>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>VM Overall Timeout: </label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <select id="tasktimeout" name="tasktimeout" value={this.state.tasktimeout} className={css(styles.customselect)} onChange={this.handleChange}>
            {tasktimeoutlist.map((e, key) => {
              return (!e.disabled ? <option key={"tasktimeout" + key} value={e.value}>{e.label} </option> : <option key={"tasktimeout" + key} value={e.value} disabled>{e.label} </option>)
            })}
          </select>
        </Column>
        <Column flexGrow={1} className={css(styles.separatorwidth)}> </Column>
        <Column>
          <button className={css(styles.custombutton)} onClick={this.clickhandle} >Run Task</button>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <button className={css(styles.custombutton)} onClick={this.clickhandle} >Run Background Task</button>
        </Column>
      </Row>
    )

    let taskoptions = (
      <Row className={css(styles.listofrows)}>
        <Column>
          <label className={css(styles.customlable)}>Custom Task Name: </label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column className={css(styles.addheight)}>
          <input className={css(styles.custominput)} type="text" id="taskname" onChange={this.handleChange} value={this.state.taskname} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <label className={css(styles.customlable)}>Optional settings: </label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominput)} type="text" id="optionalsettings" onChange={this.handleChange} value={this.state.optionalsettings} />
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <button className={css(styles.custombutton)} onClick={() => this.saveactionslistclick("save")} >Save</button>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <button className={css(styles.custombutton)} onClick={() => this.deleteactionslistclick("delete")} >Delete</button>
        </Column>
      </Row>
    )

    if (!this.state.loading && this.state.task_id === "") {
      return (
        <Column flexGrow={1} className={css(styles.container)}>
          {taskoptions}
          <Row className={css(styles.separatorheight)}> </Row>
          {savedtasks}
          <Row className={css(styles.separatorheight)}> </Row>
          {options}
          <Row className={css(styles.separatorheight)}> </Row>
          {actions}
          <Row className={css(styles.separatorheight)}> </Row>
          {submitform}
        </Column>
      );
    }
    else if (!this.state.loading && this.state.task_id !== "") {
      return (
        <Results uuid={this.state.task_id} setOnClick={this.handleCloseTask} taskname={this.state.taskname} />
      );
    }
    else if (this.state.loading && this.state.task_id !== "") {
      return (
        <Column flexGrow={1} className={css(styles.container)}>
          {actions}
          <LoadingSpinner msg={"Individual task: " + this.state.task_id} timeout="" close={true} spinner={true} />
        </Column>
      );
    }
    else {
      return (
        <Column flexGrow={1} className={css(styles.container)}>
          <LoadingSpinner msg="Loading.." timeout="" close={true} />
        </Column>
      );
    }
  }
}
