import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import CloseIcon from '../../assets/closeicon.js';
import HexagonIcon from '../../assets/hexagonicon.js';

const keyframe1 = {
  '0%': {
    strokeDasharray: '0 0 80 300'
  },
  '50%': {
    strokeDasharray: '0 80 160 300'
  },
  '75%': {
    strokeDasharray: '0 160 220 300'
  },
  '100%': {
    strokeDasharray: '80 220 300 300'
  },
};
const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    background: '#ffffff',
    opacity: '.6',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: '999990',
  },
  subcontainer: {
    position: 'fixed',
    top: '48%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  loader: {
    display: 'inline-flex',
    width: '140px',
    height: '140px',
    animation: '2s linear both ease-in-out infinite',
    animationName: [keyframe1],
  },
  message: {
    background: '#ffffff',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: 'none',
    padding: '10px 10px 10px 10px'
  },
  svg: {
    marginLeft: 10,
    display: 'flex',
    height: '100%',
  },
});

export default class LoadingSpinner extends React.Component {

  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      msg: "",
    }
  }

  setstateasync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }

  async componentDidMount() {
    await this.setstateasync({ msg: this.props.msg })
    if (this.props.timeout !== "") {
      this.interval = setInterval(async () => {
        await this.setstateasync({ msg: "" })
      }, parseInt(this.props.timeout) * 1000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handlecloseloadingbar = async (event) => {
    await this.setstateasync({ msg: "" })
  }

  render() {
    if (this.state.msg !== "") {
      return (
        <div className={css(styles.container)}>
          <div className={css(styles.subcontainer)}>
            <div className={css(styles.loader)}> <HexagonIcon fill="#52697d" /></div>
            <div className={css(styles.message)}>
              {this.props.close === true ? this.state.msg : ""}
              {this.props.close === "notimplemented" ? <div className={css(styles.svg)} onClick={this.handlecloseloadingbar}> <CloseIcon fill="#52697d" /></div> : ""}
            </div>
          </div>
        </div>
      )
    }
    else {
      return (<></>)
    }
  }
};
