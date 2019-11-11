import React from 'react';
import './App.css';
import Header from './components/header/Header';
import Main from './components/main/Main';
import ChatixSDK from './components/chatix/ChatixSDK';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      chatroomName: '',
      messages: [],
      members: [],
      me: null,
      knownUsers: new Map()
    };
    this.chatixSDK = React.createRef();
  }


  /**
   * Compare function to order by online, name, UUID
   * @param {ChatroomMember} a first message
   * @param {ChatroomMember} b second message 
   */
  sortMembers(a, b) {
    if (a.is_online === true && b.is_online === false) {
      return -1;
    } else if (b.is_online === true && a.is_online === false) {
      return 1;
    } else {
      if (a.name && b.name) {
        if (a.name.toLocaleUpperCase() > b.name.toLocaleUpperCase()) {
          return 1;
        } else if (a.name.toLocaleUpperCase() < b.name.toLocaleUpperCase()) {
          return -1;
        }
      } else if (a.name && !b.name) {
        return -1;
      } else if (!a.name && b.name) {
        return 1;
      } 
      if (a.uuid > b.uuid) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  /**
   * Setter for chatroom members. Used for initial loading
   * @param {array} members Array of currently connected to chatroom members
   * See Chatix docs for more details about this. 
   */
  setChatroomMembers = (members) => {
    const knownUsersMap = this.state.knownUsers;
    for (const m of members) {
      knownUsersMap.set(m.uuid, m);
    }
    members.sort(this.sortMembers);
    const newStateFragment = { members: members, knownUsers: knownUsersMap };
    this.setState({...this.state, ...newStateFragment});
  }

  /**
   * This method handles new member connection to chatroom
   * @param {object} member see ChatixCore docs for details
   */
  addChatroomMember = (member) => {
    const newStateFragment = {};
    if (!this.state.knownUsers.has(member.uuid)) {
      const knownUsers = this.state.knownUsers;
      knownUsers.set(member.uuid, member);
      newStateFragment.knownUsers = knownUsers;
    }
    const currentMembers = this.state.members;
    currentMembers.push(member);
    currentMembers.sort(this.sortMembers);
    newStateFragment.members = currentMembers;
    this.setState({...this.state, ...newStateFragment});
  }

  /**
   * This method handles member disconnection from chatroom
   * @param {string} memberId disconnected member UUID
   */
  removeChatroomMember = (memberId) => {
    const currentMembers = this.state.members;
    const filteredMembers = currentMembers.filter(x=> x.uuid !== memberId);
    const newStateFragment = {members: filteredMembers};
    this.setState({...this.state, ...newStateFragment});
  }

  /**
   * Setter for chatroom title.
   */
  setChatroomTitle = (newName) => {
    const newStateFragment = { chatroomName: newName};
    this.setState({...this.state, ...newStateFragment});
  };

  /**
   * Setter for chatroom messages. Used for initial loading.
   * While initial loading we can probably receive messages from unknown senders, 
   * so we need to get their information to display it properly.
   * @param {array} messages Messages array. See Chatix docs for more details
   */
  setChatroomMessages = async (messages) => {
    const newStateFragment = { messages: messages };
    const knownUsers = this.state.knownUsers;
    for (const m of messages) {
      if (!knownUsers.has(m.sender_id) && m.sender_flag === 0) {
        const user = await this.chatixSDK.current.getUser(m.sender_id);
        knownUsers.set(user.uuid, user);
      }
    }
    newStateFragment.knownUsers = knownUsers;
    this.setState({...this.state, ...newStateFragment});
  }

  /**
   * Text message send method
   * @param {string} message sending message text
   */
  onSendNewMessage = async (message) => {
    let receivedMsg = await this.chatixSDK.current.sendChatroomMessage(message);
    
    const currentMessages = this.state.messages;
    currentMessages.push(receivedMsg);
    const newStateFragment = {messages: currentMessages};
    this.setState({...this.state, ...newStateFragment});
  }

  /**
   * New messages receiver
   * @param {object} message new message object. See Chatix docs for more details
   */
  onNewMessageReceived = (message) => {
    const currentMessages = this.state.messages;
    currentMessages.push(message);
    const newStateFragment = {messages: currentMessages};
    this.setState({...this.state, ...newStateFragment});
  }

  onMemberUpdated = (updatedMember) => {
    let oldMember = this.state.members.find(member => member.uuid === updatedMember.uuid);
    oldMember = this.state.members.indexOf(oldMember);
    let newStateMembers = this.state.members;
    newStateMembers[oldMember] = updatedMember;

    this.setState({
      members: newStateMembers
    })
  }

  setMe = (me) => {
    this.setState({...this.state, ...{me: me}});
  }

  onUpdateVisitor = (user) => {
    this.chatixSDK.current.updateVisitor(user)
    this.setMe(user)
    let currentUser = this.state.members.find((member) => (member.uuid === user.uuid))
    let currentUserIndex = this.state.members.indexOf(currentUser)
    let newMembers = [...this.state.members]
    newMembers[currentUserIndex] = user;
    this.setState({
      members: newMembers
    })
  }

  render() {
    return (
      <div className="App">
        {
          this.state.me ? 
            <Header 
              chatroomName={this.state.chatroomName}
              user={this.state.me}
              updateVisitor={this.onUpdateVisitor}
            />
          : null
        }
        <Main
          members={this.state.members}
          knownUsers={this.state.knownUsers}
          messages={this.state.messages}
          onSendNewMessage={this.onSendNewMessage}
          me={this.state.me}/>
        <ChatixSDK 
          ref={this.chatixSDK}
          setMe={this.setMe}
          updateChatroomTitle={this.setChatroomTitle}
          setChatroomMembers={this.setChatroomMembers}
          addChatroomMember={this.addChatroomMember} 
          removeChatroomMember={this.removeChatroomMember}
          setChatroomMessages={this.setChatroomMessages}
          onNewMessageReceived={this.onNewMessageReceived}
          onMemberUpdated={this.onMemberUpdated} />
      </div>
    );
  };
}

export default App;
