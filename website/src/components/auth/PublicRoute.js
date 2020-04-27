import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PublicRoute = ({component: Component, restricted, ...rest}) => {
    return (
        <Route {...rest} render={props => (
            window.sessionStorage.getItem("token") && restricted ? <Redirect to="/Dashboard" /> : <Component {...props} />
        )} />
    );
};

export default PublicRoute;