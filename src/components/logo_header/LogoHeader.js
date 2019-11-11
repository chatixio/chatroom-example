import React from 'react'
import logo from './chatix_logo.svg';
import './LogoHeader.css';

function LogoHeader(){
    return (
        <div className="LogoHeader">
            <img src={logo} className="App-logo" alt="Chatix logo" />
        </div>
    );
}

export default LogoHeader;
