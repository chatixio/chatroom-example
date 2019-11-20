import React, {useState} from 'react';
import './Header.css'
import LogoHeader from '../logo_header/LogoHeader';
import RoomHeader from '../room-header/RoomHeader';

function Header(props) {
    const [name, setName] = useState(props.user.name ? props.user.name : props.user.uuid.substr(-10))

    const handleChangeName = (e) => {
        setName(e.target.value)
        let visitor = {...props.user};
        visitor.name = e.target.value;
        props.updateVisitor(visitor)
    }

    return (
        <header>
            <LogoHeader/>
            <RoomHeader chatroomName={props.chatroomName}/>
            {
                props.user ? 
                    <input
                        className='name-input'
                        value={name}
                        placeholder='Your name'
                        onChange={(e) => handleChangeName(e)}
                    />
                : null
            }
        </header>
    );
}

export default Header;