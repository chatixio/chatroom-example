import React from 'react';
import ChatixCore from 'chatix-core';

class ChatixSDK extends React.Component {
    constructor(props){
        super(props);
        const websiteId = "YOUR_WEBSITE_ID"; // websiteId you can get in manager's interface on setting's page
        this.chatroomId = "YOUR_CHATROOM_ID"; // chatroomId you will get after create chatroom in manager's interface
        this.sdk = new ChatixCore(websiteId);
        // New chatroom message receiver
        // Here we have to define in what chatroom message was received and
        // update messages using passed handler
        this.sdk.onChatroomMessageReceived = (chatroomId, message) => {
            if (chatroomId === this.chatroomId) {
                this.props.onNewMessageReceived(message);
            }
        };
        this.sdk.onMemberConnectedToChatroom = (chatroomId, member) => {
            if (chatroomId === this.chatroomId && props.addChatroomMember) {
                this.props.addChatroomMember(member);
            }
        };
        this.sdk.onMemberDisconnectedFromChatroom = (chatroomId, member) => {
            if (chatroomId === this.chatroomId && props.removeChatroomMember) {
                this.props.removeChatroomMember(member);
            }
        };
        this.sdk.onApplyVisitorInfo = (visitor) => {
            this.props.onMemberUpdated(visitor)
        }
        this.sdk.start()
            .then( async () => {
                try {
                    if (props.setMe) {
                        const me = this.sdk.getVisitor();
                        this.props.setMe(me);
                    }
                    // visitor has to be connected to our chatroom. So we need to fetch it's current chatrooms
                    // and define if it is connected to our chatroom. If it is not connected to chatroom - connect it.
                    const myChatrooms = await this.sdk.getMyChatrooms();
                    if (myChatrooms.filter(x => x.id===this.chatroomId).length === 0) {
                        await this.sdk.connectToChatroom(this.chatroomId);
                    }

                    // refresh information about chatroom and call passed handler
                    const chatroom = await this.sdk.getChatroom(this.chatroomId);
                    if (props.updateChatroomTitle) {
                        props.updateChatroomTitle(chatroom.title);
                    }

                    // lets get all chatroom members using infinite loop with break on empty server response
                    let membersPage = 1;
                    let allChatroomMembers = [];
                    while(true) {
                        let pagedMembers = await this.sdk.getChatroomMembers(this.chatroomId, membersPage++, 10);
                        allChatroomMembers = [...allChatroomMembers, ...pagedMembers];
                        if (pagedMembers.length === 0) {
                            break;
                        }
                    }
                    if (props.setChatroomMembers) {
                        props.setChatroomMembers(allChatroomMembers);
                    }

                    // lets load 100 last messages from current chatroom
                    const lastMessages = await this.sdk.getChatroomMessages(this.chatroomId, null, 30);
                    if (props.setChatroomMessages) {
                        props.setChatroomMessages(lastMessages);
                    }
                } catch (e) {
                    console.error(e);
                }
            })
            .catch((e) => {
                console.error(e);
            });
        
    }

    sendChatroomMessage = (text) => {
        try {
            return this.sdk.sendChatroomTextMessage(text, this.chatroomId);
        } catch (e) {
            console.error(e);
        }
    }

    updateVisitor(visitor){
        this.sdk.setVisitor(visitor)
    }

    async getUser(userId){
        return await this.sdk.getMember(userId);
    }

    render(){
        return null;
    }

}

export default ChatixSDK;