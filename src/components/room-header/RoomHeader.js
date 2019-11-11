import React from 'react';
import './RoomHeader.css';

function RoomHeader(props){
    return (
        <div className="RoomHeader">
            <h1>{props.chatroomName}</h1>
        </div>
    );
}

export default RoomHeader;