import React from 'react';
import { Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import LeftListIcon from '../../assets/leftlisticon.js';
import LastLeftListIcon from '../../assets/lastleftlisticon.js';

const styles = StyleSheet.create({
    container: {
        height: 30,
        paddingLeft: 10,
        paddingRight: 10,
    },
    subcontainer: {
        height: 30,
        paddingLeft: 10,
        paddingRight: 10,
    },
    activecontainer: {
    },
    leftbar: {
        height: 30,
        width: 4,
        backgroundColor: '#E4E9EE',
        position: 'absolute',
        left: 0
    },
    text: {
        lineHeight: '12px',
        marginLeft: 8,
        color: '#b1b5b8'
    },
    activetext: {
        color: '#fff'
    },
});

function MenuItemComponent(properties) {
    const { category, icon, text, isactive, link, issub, islast, ...other } = properties;
    const Icon = icon;
    return (
        <div>
            {!issub ? (
                <Row className={css(styles.container)} vertical="center" href={link} {...other}>
                    <Icon fill={isactive && "#fff"} />
                    {isactive && <div className={css(styles.leftbar)}></div>}
                    <span className={css(styles.text, isactive && styles.activetext)}>
                        {text}
                    </span>
                </Row>) : (
                    <Row className={css(styles.subcontainer)} vertical="center" href={link} {...other}>
                        {islast ? <LastLeftListIcon /> : <LeftListIcon />}
                        {isactive && <div className={css(styles.leftbar)}></div>}
                        <span className={css(styles.text, isactive && styles.activetext)}>
                            {text}
                        </span>
                    </Row>
                )}
        </div>
    );
}

export default MenuItemComponent;