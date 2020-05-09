import React from 'react';
import './App.css';
import { Row, Column } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import HeaderComponent from './components/header/HeaderComponent.js'
import SidebarComponent from './components/sidebar/SidebarComponent';
import ProcessBuildTask from './components/main/ProcessBuildTask.js'
import ProcessSavedTasks from './components/main/ProcessSavedTasks.js'
import OverviewStats from './components/main/OverviewStats.js'
import ResultsSearch from './components/main/ResultsSearch.js'
import LiveRemoteControl from './components/main/LiveRemoteControl.js'
import GlobalSettings from './components/main/GlobalSettings.js'
import TerminateSettings from './components/main/TerminateSettings.js'
import TesteSettings from './components/main/TestSettings.js'

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: "#E6E6E6",
  },
  header: {
    minHeight: 30,
  },
  color: {
    color: '#444444',
    overflowY:'auto'
  }
});

class App extends React.Component {

  _isMounted = false;

  state = {
    selecteditem: 'Stats_Overview'
  };

  componentDidMount() {
    this._isMounted = true;

    try {
      if (this._isMounted) {
        if (window.sessionStorage.getItem("selecteditem") && window.sessionStorage.getItem("selecteditem") !== "")
        {
          this.setState({ selecteditem: window.sessionStorage.getItem("selecteditem") });
        }
      }
    }
    catch (e) {
      if (this._isMounted) {
        this.setState({ selecteditem: "Stats_Queue" });
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleChange = event => {
    this.setState({ selecteditem: event });
    window.sessionStorage.setItem("selecteditem", event);
  }

  render() {
    const { selecteditem } = this.state;
    return (
      <Row className={css(styles.container)}>
        <SidebarComponent selecteditem={selecteditem} onChange={this.handleChange} />
        <Column flexGrow={1}>
          <Row className={css(styles.header)}>
            <HeaderComponent />
          </Row>
          <Row id="maincontainer" className={css(styles.color)}>
            <>
              {{
                Process_Build_Task: (<ProcessBuildTask />),
                Process_Saved_Tasks: (<ProcessSavedTasks />),
                Stats_Overview: (<OverviewStats />),
                Stats_Search: (<ResultsSearch />),
                Live_Remote_Control: (<LiveRemoteControl />),
                Settings_Global: (<GlobalSettings />),
                Settings_Terminate: (<TerminateSettings />),
                Settings_Test: (<TesteSettings />)
              }[this.state.selecteditem]}
            </>
          </Row>
        </Column>
      </Row>
    );
  }
}

export default App;
