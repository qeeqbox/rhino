import React from 'react';
import ReactJson from 'react-json-view'
import LoadingSpinner from '../spinner/LoadingSpinner.js'
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import { backendurls } from '../auth/GlobalVars.js'
import { sendpostajaxrequest } from '../auth/GlobalFunctions.js'
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
});

export default class ProcessTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      findinput: "",
      sortinput: "",
      limitinput: "",
      results: [],
      flashmessage: { onoff: false, random: "", msg: "", spinner: false, timeout: "5" }
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
    await this.setstateasync({ flashmessage: { onoff:true,random: uuidv4(), msg: "Searching..", spinner: true } })
    const _data = await sendpostajaxrequest(backendurls.searchdb, JSON.stringify({findinput: this.state.findinput,sortinput: this.state.sortinput,limitinput: this.state.limitinput}), []);
    await this.setstateasync({ flashmessage: { onoff:false, msg: "" } ,results: _data})
  };

  render() {
    return (
      <Column flexGrow={1} className={css(styles.container)}>
        <Row className={css(styles.listofrows)}>
          <Column>
            <label className={css(styles.customlable)}>Find</label>
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column flexGrow={1} className={css(styles.addheight)}>
            <input className={css(styles.custominput)} type="text" id="findinput" placeholder='{"input":{"$regex":".*chase.*"}}' onChange={this.handleChange} />
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column>
            <label className={css(styles.customlable)}>Sort</label>
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column flexGrow={1} className={css(styles.addheight)}>
            <input className={css(styles.custominput)} type="text" id="sortinput" placeholder='[("_id",1)]' onChange={this.handleChange} />
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column>
            <label className={css(styles.customlable)}>Limit</label>
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column flexGrow={1} className={css(styles.addheight)}>
            <input className={css(styles.custominput)} type="text" id="limitinput" placeholder='1' onChange={this.handleChange} />
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column>
            <button className={css(styles.custombutton)} onClick={this.clickhandle} >Search</button>
          </Column>
        </Row>
        <Row className={css(styles.separatorheight)}> </Row>
        {this.state.results.length > 0 && this.state.results.map(function (item) {
          return (<div key={item.uuid} className={css(styles.fullwidth)}>
            <Row className={css(styles.customrow)}>
              <ReactJson src={item} />
            </Row>
          </div>
          );
        })}
        {this.state.flashmessage.msg !== "" ? <LoadingSpinner key={this.state.flashmessage.random} timeout="5" msg={this.state.flashmessage.msg} close={false} keep={true} spinner={this.state.flashmessage.spinner} /> : ""}
      </Column>)
  }
}
