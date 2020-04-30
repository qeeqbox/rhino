import React from 'react';
import LoadingSpinner from '../spinner/LoadingSpinner.js'
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import { backendurls } from '../auth/GlobalVars.js'
import { sendpostajaxrequest,sendgetajaxrequest } from '../auth/GlobalFunctions.js'
import { v4 as uuidv4 } from 'uuid';

const styles = StyleSheet.create({
  container: {
    padding: '10px 10px 10px 10px',
    fontFamily: 'monospace',
    width: '100%',
    marginBottom: 10,
  },
  listofrows: {
    backgroundColor: '#ffffff',
    padding: 10,
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
  addheight: {
    height: '25px'
  },
  separatorwidth: {
    minWidth: 10,
  },
  custombutton: {
    backgroundColor: '#ffffff',
    border: '1px solid #b1b5b8',
    height: '100%'
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
    lineHeight: '25px'
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
    lineHeight: '25px'
  },
  movetoright: {
    marginLeft: 'auto'
  },
  customlable: {
    backgroundColor: '#ffffff',
    fontSize: 12,
    border: 'none',
    lineHeight: '25px',
    whiteSpace: 'nowrap'

  }, separatorheight: {
    minHeight: 10,
  },
});



export default class ProcessTask extends React.Component {

  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      extrainput: "",
      vbox: "",
      tasktimeout: "60",
      task_id: "",
      review: "",
      flashmessage: { onoff: false, random: "", msg: "", spinner: false, timeout: "5" },
      boxes:[],
    }
  }

  sleep = (mil) => {
    return new Promise(resolve => setTimeout(resolve, mil))
  }

  setstateasync(state) {
    return new Promise((resolve) => { this.setState(state, resolve) });
  }

  clickhandle = async () => {
    try {
      var stop = false;
      await this.setstateasync({ flashmessage: { onoff: true, random: uuidv4(), msg: "Establishing remote control..", spinner: true } })
      const rettaskid = await sendpostajaxrequest(backendurls.startremotecontrol, JSON.stringify({ tasktimeout: this.state.tasktimeout, vbox: this.state.vbox, }), {});
      if (rettaskid.task_id !== "") {
        while (!stop) {
          const retstatus = await sendpostajaxrequest(backendurls.checktask, JSON.stringify({ task_id: rettaskid.task_id }), {});
          if (retstatus.status === "live") {
            stop = true
            await this.setstateasync({ loading: false, review: this.state.vbox })
            return
          }
          await this.sleep(2000);
        }
      }
    }
    catch{}
    await this.setstateasync({ flashmessage: { onoff: false, msg: "" } })
  };

  closehandle = async (event) => { 
    await sendpostajaxrequest(backendurls.closeremotecontrol, JSON.stringify({vbox: this.state.vbox}), {});
    if (this.state.vbox === this.state.review) {
      await this.setstateasync({ review: "" })
    }
  };

  handleChange = async (event) => {
    await this.setstateasync({ [event.target.id]: event.target.value });
    const retstatus = await sendpostajaxrequest(backendurls.reviewremotecontrol, JSON.stringify({vbox: this.state.vbox,}), {});
    if (retstatus.status === "Running") {
      await this.setstateasync({ review: this.state.vbox })
    }
    else {
      await this.setstateasync({ review: "" })
    }
  }


  handleClickAndKey = async (event) => {
    var sendornot = false
    var buffer = [this.state.review, 0, 0, "false", "false"]
    if ((event.keyCode === 9 || event.keyCode === 8 || event.keyCode === 13) && event.type === 'keydown') {
      buffer[4] = String(event.keyCode)
      sendornot = true
    } else if (event.type === 'keypress') {
      buffer[4] = String(event.which)
      sendornot = true
    } else if (event.nativeEvent.which === 1) {
      let currentTargetRect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - currentTargetRect.left, y = event.clientY - currentTargetRect.top;
      buffer[1] = x
      buffer[2] = y
      buffer[3] = "leftclick"
      sendornot = true
    }
    if (sendornot === true) {
      await sendpostajaxrequest(backendurls.remoteaction, JSON.stringify(buffer), "")
    }
  }
  
  async componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      const _data = await sendgetajaxrequest(backendurls.boxeslist, []);
      if (_data.length > 0){
        await this.setstateasync({boxes:Object.values(_data),vbox:Object.values(_data)[0].value})
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const vboxlist = this.state.boxes
    const tasktimeoutlist = [
      { label: "30", value: "30", disabled: false },
      { label: "60", value: "60", disabled: false },
      { label: "120", value: "120", disabled: false },
      { label: "180", value: "180", disabled: false }
    ];

    return (
      <Column flexGrow={1} className={css(styles.container)}>
        <Row className={css(styles.listofrows)}>
          <Column>
            <label className={css(styles.customlable)}>This mode is experimental used for snapshotting</label>
          </Column>
        </Row>
        <Row className={css(styles.separatorheight)}> </Row>
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
          <Column flexGrow={1}> </Column>
          <Column className={css(styles.movetoright)} >
            <button disabled={this.state.review ? true : ""} className={css(styles.custombutton)} onClick={this.clickhandle} >Run</button>
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column className={css(styles.movetoright)} >
            <button disabled={!this.state.review ? true : ""} className={css(styles.custombutton)} onClick={this.closehandle} >Stop</button>
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column className={css(styles.movetoright)} >
            <button disabled={this.state.review ? true : ""} className={css(styles.custombutton)} disabled>Snapshot</button>
          </Column>
        </Row>
        <Row className={css(styles.separatorheight)}> </Row>
        {this.state.review !== "" ?
          <Row className={css(styles.listofrows)}>
            <div tabIndex="1" onKeyDown={this.handleClickAndKey} onKeyPress={this.handleClickAndKey}>
              <img onClick={this.handleClickAndKey} src={backendurls.videofeed + this.state.review} alt="Live"></img>
            </div>
          </Row> :
          <></>}
        {this.state.flashmessage.msg !== "" ? <LoadingSpinner key={this.state.flashmessage.random} timeout="5" msg={this.state.flashmessage.msg} close={false} keep={true} spinner={this.state.flashmessage.spinner} /> : ""}
      </Column>
    );
  }
}
