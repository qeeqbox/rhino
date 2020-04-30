import React from 'react';
import ReactJson from 'react-json-view'
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
    overflowX: 'hidden',
    marginBottom: 10,
  },
  fullwidth: {
    width: '100%'
  },
  listofrows: {
    backgroundColor: '#ffffff',
    padding: 10,
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
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
  },
  customrow: {
    backgroundColor: '#ffffff',
    padding: '10px 10px 10px 10px',
    marginBottom: 10,
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
  customlable: {
    backgroundColor: '#ffffff',
    fontSize: 12,
    height: '100%',
    border: 'none',
    lineHeight: '25px'
  },
  separatorheight: {
    minHeight: 10,
  },
  separatorwidth: {
    minWidth: 10,
  },
  customselect: {
    backgroundColor: '#ffffff',
    fontSize: 12,
    height: '100%',
    border: 'none',
    borderBottom: '1px solid #b1b5b8',
    lineHeight: '25px'
  },
});

export default class ProcessTask extends React.Component {

  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      vbox:"",
      results: {},
      flashmessage: { onoff: false, random: "", msg: "", spinner: false, timeout: "5" },
      boxes:[],
    }
  }

  setstateasync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }

  handleChange = event => {
    this.setState({ [event.target.id]: event.target.value });
  }

  clickhandle = async (event) => {
    await this.setstateasync({ flashmessage: { onoff:true,random: uuidv4(), msg: "Terminating..", spinner: true } })
    const _data = await sendpostajaxrequest(backendurls.terminatebox, JSON.stringify({vbox: this.state.vbox}), {});
    await this.setstateasync({ flashmessage: { onoff:false, msg: "" } ,results: _data})
  };

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
    return (
      <Column flexGrow={1} className={css(styles.container)}>
        <Row className={css(styles.listofrows)}>
          <Column>
            <label className={css(styles.customlable)}>Target VM: </label>
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column>
            <select id="vbox" name="vbox" value={this.state.vbox} className={css(styles.customselect)} onChange={this.handleChange}>
              {vboxlist.map((e, key) => {
                return (!e.disabled ? <option key={"vbox" + key} value={e.value}>{e.label} </option> : <option key={"vbox" + key} value={e.value} disabled>{e.label} </option>)
              })}
            </select>
          </Column>
          <Column flexGrow={1} className={css(styles.separatorwidth)}> </Column>
          <Column>
            <button className={css(styles.custombutton)} onClick={this.clickhandle} >Rest</button>
          </Column>
        </Row>
        <Row className={css(styles.separatorheight)}> </Row>
        {Object.keys(this.state.results).length !== 0 ? <Row className={css(styles.listofrows)}> <ReactJson src={this.state.results} /> </Row>: ""}
        {this.state.flashmessage.msg !== "" ? <LoadingSpinner key={this.state.flashmessage.random} timeout="5" msg={this.state.flashmessage.msg} close={false} keep={true} spinner={this.state.flashmessage.spinner} /> : ""}
      </Column>)
  }
}
