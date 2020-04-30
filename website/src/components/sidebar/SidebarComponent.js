import React from 'react';
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import HeaderLogoComponent from '../header/HeaderLogoComponent.js';
import MenuItemComponent from './MenuItemComponent.js';
import SubMenuComponent from './SubMenuComponent.js';
import NewTaskIcon from '../../assets/newtaskicon.js';
import SettingsIcon from '../../assets/settingsicon.js';
import MonitorIcon from '../../assets/monitoricon.js';
import StatsIcon from '../../assets/statsiconicon.js';

const styles = StyleSheet.create({
	container: {
		minHeight: '100vh',
		'@media (max-width: 768px)': {
			display: 'none',
			//position: 'absolute'
		},
		position: 'relative',
		zIndex: 999998,
	},
	subcontainer: {
		backgroundColor: '#42494F',
		width: 220
	},
	menuitemlist: {
		marginTop: 40
	},
});

class SidebarComponent extends React.Component {

	_isMounted = false;

	statetemp = {
		Stats: false,
		Process: false,
		Live: false,
		Settings: false
	}

	state = Object.assign({}, this.statetemp, this.props.parentstate);

	componentDidMount() {
		this._isMounted = true;

		Object.entries(this.state).map(([key, value]) => {
			try {
				if (this._isMounted) {
					this.setState({ [key]: JSON.parse(window.sessionStorage.getItem(key)) });
				}
			}
			catch (e) {

			}
			return 0
		});
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	handleToggle = (item) => {
		try {
			if (!item.includes('_')) {
				this.setState({ [item]: !this.state[item] });
				window.sessionStorage.setItem([item], !this.state[item]);
			}
		}
		finally {
			if (item.includes('_')) {
				return this.props.onChange(item);
			}
		}
	}

	render() {
		return (
			<Row id={"side_bar"} className={css(styles.container)} >
				<Column className={css(styles.subcontainer)}>
					<HeaderLogoComponent />
					<Column className={css(styles.menuitemlist)}>
						<SubMenuComponent handleToggle={() => this.handleToggle('Stats')} icon={StatsIcon} text="Stats" isactive={this.state.Stats} >
							<MenuItemComponent text="Overview" onClick={() => this.handleToggle('Stats_Overview')} isactive={this.props.selecteditem === 'Stats_Overview'} issub={true} islast={false} />
							<MenuItemComponent text="Search" onClick={() => this.handleToggle('Stats_Search')} isactive={this.props.selecteditem === 'Stats_Search'} issub={true} islast={true} />
						</SubMenuComponent>
						<SubMenuComponent handleToggle={() => this.handleToggle('Process')} icon={NewTaskIcon} text="Process" isactive={this.state.Process} >
							<MenuItemComponent text="Build Task" onClick={() => this.handleToggle('Process_Build_Task')} isactive={this.props.selecteditem === 'Process_Build_Task'} issub={true} islast={false} />
							<MenuItemComponent text="Saved Tasks" onClick={() => this.handleToggle('Process_Saved_Tasks')} isactive={this.props.selecteditem === 'Process_Saved_Tasks'} issub={true} islast={true} />
						</SubMenuComponent>
						<SubMenuComponent handleToggle={() => this.handleToggle('Live')} icon={MonitorIcon} text="Live" isactive={this.state.Live} >
							<MenuItemComponent text="Remote Control" onClick={() => this.handleToggle('Live_Remote_Control')} isactive={this.props.selecteditem === 'Live_Remote_Control'} issub={true} islast={true} />
						</SubMenuComponent>
						<SubMenuComponent handleToggle={() => this.handleToggle('Settings')} icon={SettingsIcon} text="Settings" isactive={this.state.Settings} >
							<MenuItemComponent text="Global" onClick={() => this.handleToggle('Settings_Global')} isactive={this.props.selecteditem === 'Settings_Global'} issub={true} islast={false} />
							<MenuItemComponent text="Users" onClick={() => this.handleToggle('Settings_Users')} isactive={this.props.selecteditem === 'Settings_Users'} issub={true} islast={false} />
							<MenuItemComponent text="Test" onClick={() => this.handleToggle('Settings_Test')} isactive={this.props.selecteditem === 'Settings_Test'} issub={true} islast={false} />
							<MenuItemComponent text="Terminate" onClick={() => this.handleToggle('Settings_Terminate')} isactive={this.props.selecteditem === 'Settings_Terminate'} issub={true} islast={true} />
						</SubMenuComponent>
					</Column>
				</Column>
			</Row>
		);
	};
}

export default SidebarComponent;
