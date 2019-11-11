import React from 'react';
import './Message.css';
import icon from './user-circle-solid.svg';

function Message(props) {

    const getSenderName = () => {
        if (props.sender) {
            return props.sender.name ? props.sender.name : props.sender.uuid.substr(-10);
        }
        return "Unknown sender";
    };

    return(
        <div className="Message">
            <div className="message-sender-icon">
                <img src={icon} alt="visitor icon"/>
            </div>
            <div className="message-bubble">
                <div className="message-sender-name">{getSenderName()}</div>
                <div className="message-content">{props.message.content}</div>
            </div>
        </div>
    );
}

export default Message;