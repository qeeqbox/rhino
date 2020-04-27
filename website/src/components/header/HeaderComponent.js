import React from 'react';
import HamburgerIcon from '../../assets/hamburgericon.js';
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import HeaderProfileMenu from './HeaderProfileMenu.js'

const styles = StyleSheet.create({
	container: {
		position: 'fixed',
		width: 'calc(100% - 260px)',
		zIndex: 999997,
		height: 30,
		backgroundColor: "#fff",
		paddingLeft: 20,
		paddingRight: 20,
		boxShadow: '0 3px 5px rgba(0,0,0,.08)',
		'@media (max-width: 768px)': {
			width: 'calc(100% - 40px)',
		},
	},
	container_toggled: {
		position: 'fixed',
		width: 'calc(100% - 40px)',
		zIndex: 999997,
		height: 30,
		backgroundColor: "#fff",
		paddingLeft: 20,
		paddingRight: 20,
		boxShadow: '0 3px 5px rgba(0,0,0,.08)',
		'@media (max-width: 768px)': {
			width: 'calc(100% - 40px)',
		},
	},
	separator: {
		width: 1,
		height: 14,
		backgroundColor: '#b1b5b8',
		marginRight: 20
	}
});

export default class Results extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			header_bar_toggled: false
		}
	}

	setstateasync(state) {
		return new Promise((resolve) => {
			this.setState(state, resolve)
		});
	}

	handleTogglesidebar = async (event) => {
		const side_bar = document.getElementById('side_bar');
		if (side_bar.style.display === "flex") {
			side_bar.style.display = "none";
			await this.setstateasync({ header_bar_toggled: true })
		}
		else {
			side_bar.style.display = "flex";
			await this.setstateasync({ header_bar_toggled: false })
		}
	}

	render() {
		return (
			<Row id="header_bar" flexGrow={1} className={(this.state.header_bar_toggled ? css(styles.container_toggled) : css(styles.container))} vertical="center" horizontal="space-between">
				<Column onClick={this.handleTogglesidebar} vertical="center">
					<HamburgerIcon />
				</Column>
				<Column vertical="center" >
					<Row vertical="center">
						<HeaderProfileMenu/>
					</Row>
				</Column>
			</Row>
		)
	}
}