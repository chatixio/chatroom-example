import React from 'react';
import './MemberItem.css';
import icon from './user-circle-solid.svg';

function MemberItem(props) {
    function getName(){
        let name = ''
        if (props.member.uuid === props.me.uuid) {
            if(props.me.name) {
                name = props.me.name
            }
            else {
                name = props.me.uuid.substring(props.me.uuid.length-10, props.me.uuid.length);
            }
        }
        else {
            if(props.member.name){
                name = props.member.name
            }
            else {
                name = props.member.uuid.substring(props.member.uuid.length-10, props.member.uuid.length);
            }
        }
        return name;
    }

    return(
        <div className="MemberItem">
            <img src={ icon } alt={ props.member.name }/>
            <span>
                { getName() }
                {
                    props.member.uuid === props.me.uuid && " (Вы) "
                }
            </span>
            {
                props.member.is_online && <span className="online">•</span>
            }
        </div>
    );
}

export default MemberItem;