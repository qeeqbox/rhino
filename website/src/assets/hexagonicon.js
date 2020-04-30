import React from 'react';

export default (props) => (
    <svg width="180" height="180" viewBox="0 -2 100 100">
          <polygon strokeWidth={"7"} stroke={props.stroke || "#52697d"} fillOpacity={0} fill={props.fill || "#ff9980"} id="hex" points="50 1 95 25 95 75 50 99 5 75 5 25"/>
    </svg>
);
