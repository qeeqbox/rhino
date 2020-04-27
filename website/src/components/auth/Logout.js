import React from 'react';
import { Row, Column } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import { sendpostajaxrequest } from './GlobalFunctions.js'
import { backendurls } from './GlobalVars.js'
import LoadingSpinner from '../spinner/LoadingSpinner.js'

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

class Logout extends React.Component {

  _isMounted = false;

  state = {
    loading: false,
  };

  setstateasync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }

  logout = async (event) => {

    let data = JSON.stringify({
      userinput: window.sessionStorage.getItem("token"),
    })

    await this.setstateasync({ loading: true });
    const _data = await sendpostajaxrequest(backendurls.logout, data, 0);
    window.sessionStorage.clear();
    await this.setstateasync({ loading: false });
    this.props.history.push('/login');
  };

  componentDidMount() {
    this._isMounted = true;

    try {
      if (this._isMounted) {
        this.logout("")
      }
    }
    catch (e) {

    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    if (!this.state.loading) {
      return (
        <Row flexGrow={1} className={css(styles.container)} vertical='center' horizontal='center'>
          <Column className={css(styles.customform)} vertical='center' horizontal='center'>
          </Column>
        </Row>
      );
    }
    else {
      return (
        <LoadingSpinner msg="Loging out"/>
      );
    }
  }
}

export default Logout;
