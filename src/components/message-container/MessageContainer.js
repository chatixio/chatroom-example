import React,  {useEffect} from 'react';
import './MessageContainer.css';
import Message from '../message/Message';

function MessageContainer(props) {
    const messagesContainer = React.createRef();

    useEffect(() => {
        messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight
    }, [props, messagesContainer]);

    const messageList = props.messages.map(message => 
        <Message 
            key={message.uuid}
            sender={props.members.find((member) => member.uuid === message.sender_id)} 
            message={message} />
        );

    return (
        <section className="MessageContainer" ref={messagesContainer}>
            {messageList}
        </section>
    );
}

export default MessageContainer;