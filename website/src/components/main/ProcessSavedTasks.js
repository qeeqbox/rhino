import React from 'react';
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import { backendurls } from '../auth/GlobalVars.js'
import { sendpostajaxrequest } from '../auth/GlobalFunctions.js'
import ReactJson from 'react-json-view'
import TrashIcon from '../../assets/trashicon.js';
import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from '../spinner/LoadingSpinner.js'

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
    boxShadow: '0 1px 1px rgba(0,0,0,.1)',
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
  headerrow: {
    backgroundColor: '#ffffff',
    padding: '10px 10px 10px 10px',
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
  custombuttonremove: {
    backgroundColor: '#ffffff',
    border: 'none',
    height: '100%',
    width: '100%',
    padding: 0,
    margin: 0
  },
});

export default class OverviewStats extends React.Component {

  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      saveactionslist: [],
      flashmessage: { onoff: false, random: "", msg: "", spinner: false, timeout: "5" }
    }
  }

  setstateasync(state) {
    return new Promise((resolve) => {this.setState(state, resolve)});}

  getsavedactions = async () => {
    await this.setstateasync({ flashmessage: { onoff:true,random: uuidv4(), msg: "Getting saved tasks..", spinner: true } })
    const _data = await sendpostajaxrequest(backendurls.actionslistperuser, JSON.stringify({token: window.sessionStorage.getItem("token"),type: "getlist"}), []);
    if (_data !== '') {
      await this.setstateasync({ saveactionslist: _data })
    }
    await this.setstateasync({ flashmessage: { onoff:false, msg: "" } ,results: _data})
  }

  async componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      await this.getsavedactions()
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <Column flexGrow={1} className={css(styles.container)} horizontal='center'>
        {Object.keys(this.state.saveactionslist).map((key, index) => (
          <div key={"saveactionslist_" + key} className={css(styles.fullwidth)}>
            <Row className={css(styles.headerrow)}>
              <Column>
                <label className={css(styles.customlable)}>Task Name: {key}</label>
              </Column>
              <Column flexGrow={1} className={css(styles.separatorwidth)}> </Column>
              <Column className={css(styles.customstatus)}>
                <button className={css(styles.custombuttonremove)} ><TrashIcon /></button>
              </Column>
            </Row>
            <Row className={css(styles.listofrows)}>
              <ReactJson src={this.state.saveactionslist[key]} className={css(styles.fullwidth)} />
            </Row>
            <Row className={css(styles.separatorheight)}> </Row>
          </div>
        ))}
        {this.state.flashmessage.msg !== "" ? <LoadingSpinner key={this.state.flashmessage.random} timeout="5" msg={this.state.flashmessage.msg} close={false} keep={true} spinner={this.state.flashmessage.spinner} /> : ""}
      </Column>)
  }
}
