import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter, Switch } from 'react-router-dom';
import Login from './components/auth/Login.js'
import Logout from './components/auth/Logout.js'
import PublicRoute from './components/auth/PublicRoute.js'
import PrivateRoute from './components/auth/PrivateRoute.js'

ReactDOM.render(

    <BrowserRouter>
        <Switch>
            <PrivateRoute component={Logout} path="/Logout" exact />
            <PublicRoute component={Login} path="/Login" restricted={true} exact />
            <PrivateRoute component={App} path="/Dashboard" exact />
            <PrivateRoute component={App} path="/" exact />
        </Switch>
    </BrowserRouter>

    , document.getElementById('root'));

