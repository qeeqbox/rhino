import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem, Divider } from 'rc-menu';
import 'rc-dropdown/assets/index.css';
import UsernameIcon from '../../assets/usernameicon.js';

const styles = StyleSheet.create({
  custombutton: {
    backgroundColor: '#ffffff',
    border: 'none',
    height: '100%',
    width: '100%',
    padding: 0,
    margin: 0
  },
  menu:{
    borderRadius: 0,
    boxShadow: 'none',
    border: '1px solid #b1b5b8',
  }

});

class HeaderProfileMenu extends React.Component {

  onSelect = (event) => {
    window.location.href = event.key
  }

  render() {
    return (
      <Dropdown overlay={
        <Menu onSelect={this.onSelect} className={css(styles.menu)}>
          <MenuItem disabled>Settings</MenuItem>
          <MenuItem disabled>Customize</MenuItem>
          <Divider />
          <MenuItem key="Logout">Logout</MenuItem>
        </Menu>}
        trigger={['click']} >
        <button className={css(styles.custombutton)}><UsernameIcon /></button>
      </Dropdown>
    );
  }
}

export default HeaderProfileMenu;