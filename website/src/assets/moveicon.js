import React from 'react';

export default (props) => (
    <svg width="20" height="20" viewBox="0 0 512 512">
        <path fill={props.fill || "#b1b5b8"} d="M480 256l-96-96v76H276V128h76l-96-96-96 96h76v108H128v-76l-96 96 96 96v-76h108v108h-76l96 96 96-96h-76.2l-.4-108.5 108.6.3V352z" />
    </svg>
);
