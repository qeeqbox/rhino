import React from 'react';
import ReactJson from 'react-json-view'
import "video-react/dist/video-react.css"
import { Player } from 'video-react';
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import { backendurls } from '../auth/GlobalVars.js'
import { sendgetajaxrequest } from '../auth/GlobalFunctions.js'

const styles = StyleSheet.create({
  container: {
    padding: '10px 10px 10px 10px',
    fontFamily: 'monospace',
    overflowX: 'hidden',
    marginBottom: 10,
  },
  separatorheight: {
    minHeight: 10,
  },
  listofrows: {
    backgroundColor: '#ffffff',
    padding: 10,
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
  tasknameclosebar: {
    backgroundColor: '#ffffff',
    width: '100%',
  },
  videobox: {
    backgroundColor: '#ffffff',
    width: '100%',
    boxShadow: '0 1px 1px rgba(0,0,0,.1)',
  },
  video: {
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%',
    maxHeight: '600px',
    maxWidth: '800px',
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
  separatorwidth: {
    minWidth: 10,
  },
  customlable: {
    backgroundColor: '#ffffff',
    fontSize: 12,
    border: 'none',
    lineHeight: '20px',
    whiteSpace: 'nowrap'
  },
  custombutton: {
    backgroundColor: '#ffffff',
    border: '1px solid #b1b5b8',
    height: '100%'
  },
  addpadding: {
    padding: '10px 10px 10px 10px',
    width: '100%',
    height: '100%',
    alignItems: 'center'
  }
});

export default class Results extends React.Component {

  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      results: [],
    }
  }

  setstateasync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }

  async componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      const _data = await sendgetajaxrequest(backendurls.logs + this.props.uuid, {});
      await this.setstateasync({ results: _data })
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  closetask = (event) => {
    this.props.setOnClick(event.target.value)
  }

  render() {
    return (
      <Column flexGrow={1} className={css(styles.container)}>
        <Row className={css(styles.listofrows)}>
          <Column className={css(styles.action)}>
            <label className={css(styles.customlable)}>Task Name: {this.props.taskname}</label>
          </Column>
          <Column className={css(styles.action)}>
            <label className={css(styles.customlable)}>Task ID: {this.props.uuid}</label>
          </Column>
          <Column flexGrow={1} className={css(styles.separatorwidth)}> </Column>
          <Column>
            <button className={css(styles.custombutton)} onClick={this.closetask} >Back to Build Task</button>
          </Column>
        </Row>
        <Row className={css(styles.separatorheight)}> </Row>
        <Row className={css(styles.listofrows)}>
          <Column className={css(styles.addpadding)}>
            <Row className={css(styles.video)}>
              <Player playsInline src={backendurls.screenrecorder + this.props.uuid} />
            </Row>
          </Column>
        </Row>
        <Row className={css(styles.separatorheight)}> </Row>
        <Row className={css(styles.listofrows)}>
          <ReactJson src={this.state.results} />
        </Row>
      </Column>
    )
  }
}
