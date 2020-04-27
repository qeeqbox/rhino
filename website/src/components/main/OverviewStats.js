import React from 'react';
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import { backendurls } from '../auth/GlobalVars.js'
import { ResponsiveContainer, LineChart, XAxis, Tooltip, Legend, Line, PieChart, Pie } from "recharts";
import { sendgetajaxrequest } from '../auth/GlobalFunctions.js'
import ReactJson from 'react-json-view'
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
  separatorheight: {
    minHeight: 10,
  },
  separatorwidth: {
    minWidth: 10,
  },
  cards: {
    backgroundColor: '#ffffff',
    height: 100,
    width: '33%',
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
  listofrows: {
    backgroundColor: '#ffffff',
    width: '100%',
    minHeight: 40,
    overflow: 'auto',
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
  cardinput: {
    margin: 10
  },
  cardinputoverflow: {
    margin: 10,
  },
  with_c1: {
    backgroundColor: '#ffffff',
    width: '80%',
    height: '100%',
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
  with_c2: {
    backgroundColor: '#ffffff',
    width: '30%',
    height: '100%',
    boxShadow: '0 1px 1px rgba(0,0,0,.1)'
  },
});

export default class OverviewStats extends React.Component {

  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      active: [],
      active_number: 0,
      reserved: [],
      reserved_number: 0,
      succeed: [],
      succeed_number: 0,
      data: [],
      results: [],
      tasks: [],
      flashmessage:{onoff:false,random:"",msg:"",spinner:false,timeout:"5"}
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
      await this.setstateasync({ flashmessage: { onoff:true,random: uuidv4(), msg: "Loading..", spinner: true } })
      const _data = await sendgetajaxrequest(backendurls.stats, []);
      const __data = await sendgetajaxrequest(backendurls.results, []);
      await this.setstateasync({ active_number: _data.active_number, reserved_number: _data.reserved_number, succeed_number: _data.succeed_number, data: _data.data, tasks: _data.tasks, results: __data,flashmessage: { onoff:false, msg: "" }})
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <Column flexGrow={1} className={css(styles.container)} horizontal='center'>
        <Row horizontal='center' className={css(styles.fullwidth)}>
          <Column flexGrow={1} vertical='center' horizontal='center' className={css(styles.cards)}>
            Active tasks: {this.state.active_number}
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column flexGrow={1} vertical='center' horizontal='center' className={css(styles.cards)}>
            Reserved tasks: {this.state.reserved_number}
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column flexGrow={1} vertical='center' horizontal='center' className={css(styles.cards)}>
            Total tasks:  {this.state.succeed_number}
          </Column>
        </Row>
        <Row className={css(styles.separatorheight)}> </Row>
        <Row flexGrow={1} horizontal='center' className={css(styles.fullwidth)}>
          <Column flexGrow={1} vertical='center' horizontal='center' className={css(styles.with_c1)}>
            <ResponsiveContainer width="99%" aspect={3}>
              <LineChart data={this.state.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="time" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tasks" stroke="#42494F" />
              </LineChart>
            </ResponsiveContainer>
          </Column>
          <Column className={css(styles.separatorwidth)}> </Column>
          <Column flexGrow={1} vertical='center' horizontal='center' className={css(styles.with_c2)}>
            <ResponsiveContainer width="99%" aspect={1} >
              <PieChart>
                <Pie dataKey="value" isAnimationActive={false} data={this.state.tasks} stroke="#444444" fill="#ffffff" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Column>
        </Row>
        <Row className={css(styles.separatorheight)}> </Row>
        {this.state.results.length > 0 && this.state.results.map(function (item) {
          return (<div key={item.uuid} className={css(styles.fullwidth)}>
            <Row className={css(styles.listofrows)}>
              <Column flexGrow={1} vertical='center' horizontal='start' className={css(styles.cardinputoverflow)}>
                <ReactJson src={item} />
              </Column>
              <Column flexGrow={1} vertical='center' horizontal='end' className={css(styles.cardinput)}>
                <img src={backendurls.screenshot + item.uuid} alt="" height="140" width="220" />
              </Column>
            </Row>
            <Row className={css(styles.separatorheight)}> </Row></div>)
        })}
        {this.state.flashmessage.msg !== "" ? <LoadingSpinner close={false} key={this.state.flashmessage.random} timeout="5" msg={this.state.flashmessage.msg} keep={true} spinner={this.state.flashmessage.spinner} /> : ""}
      </Column>
    );
  }
}
