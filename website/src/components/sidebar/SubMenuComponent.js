import React from 'react';
import { Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import ToggleDownIcon from '../../assets/toggledownicon.js';
import ToggleRightIcon from '../../assets/togglerighticon.js';

const keyframe1 = {
	'0%': {
		transform: 'rotate(0deg)',
	},
	'100%': {
		transform: 'rotate(360deg)',
	}
};

const styles = StyleSheet.create({
	container: {
		paddingLeft: 0,
		paddingRight: 0,
	},
	menucontainer: {
		height: 30,
		paddingLeft: 10,
		paddingRight: 10,
		display: 'visable'
	},
	hiddencontainer: {
		display: 'none'
	},
	showcontainer: {
		display: 'initial',
		animationName: [keyframe1],
	},
	text: {
		lineHeight: '12px',
		marginLeft: 8,
		color: '#b1b5b8'
	},
	floatright: {
		position: 'absolute',
		right: 10,
		lineHeight: '10px'
	}
});

function SubMenuComponent(properties) {
	const { text, handleToggle, isactive, icon, expand, ...other } = properties;
	const Icon = icon;
	return (
		<div className={css(styles.container)} vertical="center" {...other} >
			<Row onClick={handleToggle} className={css(styles.menucontainer)} vertical="center" {...other}>
				<Icon />
				<span className={css(styles.text)}>
					{text}
				</span>
				<div className={css(styles.floatright)}>
					{isactive ? <ToggleRightIcon /> : <ToggleDownIcon />}
				</div>
			</Row>
			<div className={css(styles.hiddencontainer, isactive && styles.showcontainer)}>
				{properties.children}
			</div>
		</div>
	);
}

export default SubMenuComponent;