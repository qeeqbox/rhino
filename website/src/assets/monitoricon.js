import React from 'react';

export default (props) => (
    <svg width="20" height="20" viewBox="0 0 512 512">
        <path fill={props.fill || "#b1b5b8"} d="M496,384V96H16v288h175v16h-64v16h257v-16h-64v-16H496z M32,112h448v256H32V112z"/>
    </svg>
);
