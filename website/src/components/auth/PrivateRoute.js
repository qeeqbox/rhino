import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({component: Component, ...rest}) => {
    return (
        <Route {...rest} render={props => (
            window.sessionStorage.getItem("token") ? <Component {...props} /> : <Redirect to="/Login" />
        )} />
    );
};

export default PrivateRoute;