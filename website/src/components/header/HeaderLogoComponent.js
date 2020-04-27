import React from 'react';
import { Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
    fullcontainer: {
        zIndex: 99999,
        position: 'fixed',
        width: 220,
        height: 30,
        background: '#52697d',
        boxShadow: '0 2px 4px rgba(0,0,0,.08)'
    },
    title: {
        fontSize: '14px',
        fontStyle: 'normal',
        color: '#fff'
    }
});

function LogoComponent() {
    return (
        <Row className={css(styles.fullcontainer)} vertical="center" horizontal="center">
            <span className={css(styles.title)}>QeeqBox Rhino v1.05b</span>
        </Row>
    );
}

export default LogoComponent;