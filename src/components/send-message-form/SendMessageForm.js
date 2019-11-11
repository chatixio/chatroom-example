import React from 'react';
import './SendMessageForm.css';

class SendMessageForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: ''
        };
    }

    currentMessageChanged = (e) => {
        this.setState({message: e.target.value });
    }

    sendMessageClicked = async (e) => {
        e.preventDefault();
        if (this.state.message.length > 0) {
            await this.props.onSendNewMessage(this.state.message);
            this.setState({...this.state, ...{message : ''}});
        }
    }

    render(){
        return (
            <section className="SendMessageForm">
                <form>
                    <input 
                        type="text" 
                        value={this.state.message} 
                        onChange={this.currentMessageChanged} 
                        placeholder="Type message to send"/>
                    <button 
                        type="submit" 
                        onClick={this.sendMessageClicked}
                    >
                        Send
                    </button>
                </form>
            </section>
        );
    }
}

export default SendMessageForm;