import React from 'react';
import './ChatField.css';
import MessageContainer from '../message-container/MessageContainer';
import SendMessageForm from '../send-message-form/SendMessageForm';

function ChatField(props) {
    return(
        <section className="ChatField">
            <MessageContainer 
                knownUsers={props.knownUsers}
                members={props.members}
                messages={props.messages} 
                />
            <SendMessageForm onSendNewMessage={props.onSendNewMessage}/>
        </section>
    );
}

export default ChatField;