import React from 'react';
import ReactJson from 'react-json-view'
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import { backendurls } from '../auth/GlobalVars.js'
import { sendgetajaxrequest,sendpostajaxrequest } from '../auth/GlobalFunctions.js'
import LoadingSpinner from '../spinner/LoadingSpinner.js'
import { v4 as uuidv4 } from 'uuid';
import SaveIcon from '../../assets/saveicon.js';

const styles = StyleSheet.create({
  container: {
    padding: '10px 10px 10px 10px',
    fontFamily: 'monospace',
    overflowX: 'hidden',
    marginBottom: 10,
  },
  headerrow: {
    backgroundColor: '#ffffff',
    padding: '10px 10px 10px 10px',
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
  listofrows: {
    backgroundColor: '#ffffff',
    padding: 10,
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
  separatorheight: {
    minHeight: 10,
  },
  separatorwidth: {
    minWidth: 10,
  },
  breaklines: {
    backgroundColor: '#004444',
  },
  custombuttonremove: {
    backgroundColor: '#ffffff',
    border: 'none',
    height: '100%',
    width: '100%',
    padding: 0,
    margin: 0
  },
});

export default class ProcessTask extends React.Component {

  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      results: [],
      flashmessage: { onoff: false, random: "", msg: "", spinner: false, timeout: "5" }
    }
  }

  setstateasync(state) {
    return new Promise((resolve) => { this.setState(state, resolve) });
  }

  async componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      await this.setstateasync({ flashmessage: { onoff: true, random: uuidv4(), msg: "Loading..", spinner: true } })
      const _data = await sendgetajaxrequest(backendurls.dumpsettings, []);
      await this.setstateasync({ flashmessage: { onoff: false, msg: "" }, results: _data })
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleEvent = async (event) => {
    await this.setstateasync({results: event.updated_src })
  }

  handleSaveRequest = async (event) => {
    await this.setstateasync({ flashmessage: { onoff:true,random: uuidv4(), msg: "Updating settings..", spinner: true } })
    const _data = await sendpostajaxrequest(backendurls.uploadsettings,JSON.stringify( this.state.results),[]);
    await this.setstateasync({ flashmessage: { onoff: false, msg: "" } })
  }

  render() {
    return (
      <Column flexGrow={1} className={css(styles.container)}>
        <Row className={css(styles.headerrow)}>
          <Column>
            <label className={css(styles.customlable)}>Settings.json - Once you are done click the upload icon. The new settings will be implemented after restarting the project</label>
          </Column>
          <Column flexGrow={1} className={css(styles.separatorwidth)}> </Column>
          <Column onClick={this.handleSaveRequest} className={css(styles.customstatus)}>
            <button className={css(styles.custombuttonremove)} ><SaveIcon /></button>
          </Column>
        </Row>
        <Row className={css(styles.listofrows)}>
          <ReactJson id="ReactJsonCustom" src={this.state.results} onEdit={this.handleEvent} onAdd={this.handleEvent} onDelete={this.handleEvent} />
        </Row>
        {this.state.flashmessage.msg !== "" ? <LoadingSpinner key={this.state.flashmessage.random} timeout="500" msg={this.state.flashmessage.msg} close={false} keep={true} spinner={this.state.flashmessage.spinner} /> : ""}
      </Column>
    );
  }
}