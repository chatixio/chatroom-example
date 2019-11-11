import React from 'react';
import './MemberList.css';
import MemberItem from '../member-item/MemberItem.js';

function MemberList(props) {
    const members = props.members.map((member) => 
        <MemberItem key={member.uuid} member={member} me={props.me} />
    );

    return (
        <section className="MemberList">
            {members}
        </section>
    );
}

export default MemberList;