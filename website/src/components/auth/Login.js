import React from 'react';
import { Row, Column } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import { sendpostajaxrequestnoauth } from './GlobalFunctions.js'
import { backendurls } from './GlobalVars.js'
import LoadingSpinner from '../spinner/LoadingSpinner.js'
import { v4 as uuidv4 } from 'uuid';

const styles = StyleSheet.create({
  container: {
    padding: '5px 5px 5px 5px',
    fontFamily: 'monospace',
    overflowX: 'hidden',
    height: '90%'
  },
  customform: {
    width: 350,
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 1px rgba(0,0,0,.1)',
    padding: 10,
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
  }
});

var uuid = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

class Login extends React.Component {

  _isMounted = false;

  state = {
    loading: false,
    userinput: "",
    passinput: "",
    flashmessage:{onoff:false,random:"",msg:"",spinner:false,timeout:"5"}
  };


  handleChange = (event) => {
    this.setState({ [event.target.id]: event.target.value });
  }

  setstateasync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }

  democlick = async (event) => {
    window.sessionStorage.setItem("token", uuidv4());
    this.props.history.push('/dashboard');
  };

  loginclick = async (event) => {

    let data = JSON.stringify({
      userinput: this.state.userinput,
      passinput: this.state.passinput,
    })

    await this.setstateasync({ flashmessage:{onoff:true, random: uuidv4(), msg: "Logging in..", spinner: false }})
    const _data = await sendpostajaxrequestnoauth(backendurls.login, data, "");
    if (_data !== 0 && _data !== '' && uuid.test(_data)) {
      window.sessionStorage.setItem("token", _data);
      this.props.history.push('/dashboard');
    }
    else{
      await this.setstateasync({ flashmessage:{onoff:false, random: uuidv4(), msg: "Something wrong!", spinner: false }})
    }
  };

  registerclick = async (event) => {

    await this.setstateasync({ flashmessage:{onoff:true, random: uuidv4(), msg: "Logging in..", spinner: false }})

    let data = JSON.stringify({
      userinput: this.state.userinput,
      passinput: this.state.passinput,
    })
    const _data = await sendpostajaxrequestnoauth(backendurls.register, data, "");
    if (_data !== 0 && _data !== '') {
      window.sessionStorage.setItem("token", _data);
      this.props.history.push('/dashboard');
    }
    else{
      await this.setstateasync({ flashmessage:{onoff:false, random: uuidv4(), msg: "Something wrong!", spinner: false }})
    }
  };

  render() {

    let loginform = (<Column className={css(styles.customform)} vertical='center' horizontal='center'>
      <Row flexGrow={1} className={css(styles.fullwidth)} vertical='center' horizontal='center'>
        <Column>
          <label className={css(styles.customlable)}>User: </label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominput)} type="text" id="userinput" placeholder='' onChange={this.handleChange} />
        </Column>
      </Row>
      <Row className={css(styles.separatorheight)}> </Row>
      <Row flexGrow={1} className={css(styles.fullwidth)} vertical='center' horizontal='center'>
        <Column>
          <label className={css(styles.customlable)}>Pass: </label>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column flexGrow={1} className={css(styles.addheight)}>
          <input className={css(styles.custominput)} type="password" id="passinput" placeholder='' onChange={this.handleChange} />
        </Column>
      </Row>
      <Row className={css(styles.separatorheight)}> </Row>
      <Row className={css(styles.fullwidth)} vertical='center' horizontal='end'>
        <Column>
          <button className={css(styles.custombutton)} onClick={this.registerclick} >Register</button>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <button className={css(styles.custombutton)} onClick={this.loginclick} >Login</button>
        </Column>
        <Column className={css(styles.separatorwidth)}> </Column>
        <Column>
          <button className={css(styles.custombutton)} onClick={this.democlick} >Demo</button>
        </Column>
      </Row>
    </Column>
    )

    return (
      <Row flexGrow={1} className={css(styles.container)} vertical='center' horizontal='center'>
        {loginform}
        {this.state.flashmessage.msg !== "" ? <LoadingSpinner key={this.state.flashmessage.random} timeout="3" msg={this.state.flashmessage.msg} close={true} keep={true} spinner={this.state.flashmessage.spinner}/> : ""}
      </Row>
    );
  }
}

export default Login;
