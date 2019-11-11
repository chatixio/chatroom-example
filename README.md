# Делаем многопользовательский чат только на фронтенде

![Chatix Chatroom](http://dev-cdn.chatix.io/habr/ChatroomFinal2.png)

Сейчас я покажу вам как можно сделать чат для команды/пользователей/друзей если у вас нет бэкенда или вы не хотите тратить время на его разработку. Мы сделаем простой текстовый чат и на это у нас уйдет около часа.
Написать работающий сетевой чат без бэкенда практически невозможно, он обязательно должен быть в том или ином виде. Мы будем использовать Chatix и его JavaScript SDK. Chatix и SDK будут заниматься хранением сообщений и сетевыми задачами, а мы займемся фронтендом.
[Готовый код проекта доступен на GitHub](https://beta.chatix.io/)

## Структура проекта
* App (корневой комонент приложения, выполняет роль хранителя состояния, т.к. в этом уроке мы не будем добавлять Redux или какой-либо другогой state manager)
  * Header (шапка нашего приложения которая отображает логоти, название чата и позволяет пользователю написать свое имя)
    * LogoHeader
    * RoomHeader
  * Main
    * MemberList (список участников чата)
      *  MemberItem[]
    * ChatField (контейнер для всего что связано с сообщениями чата)
      * MessageContainer
        * Message[] (представление сообщения; в данному уроке мы будем работать только с текстовыми сообщениями)
      * SendMessageForm (форма отправки нового сообщения в чат)
  * ChatixSDK (headless компонент отвечающий за работу с бэкендом)

> Важное замечание насчет хранения состояния. Конечно было бы удобнее добавить сюда Redux и обрабатывать изменения состояния чере него, но ради экономии времени мы будем хранить состояние в корневом компоненте App и будем пробрасывать данные в дочерние компоненты и вызывать из дочерних методы их родителей. 
Например, когда мы получим название чата, мы сохраним его в состоянии компонента App и через `props` передадим его: `App → Header → RoomHeader`. Когда пользователь напишет сообщение мы передадим его из SendMessageForm до App: `SendMessageForm → ChatField → Main → App`.

Примерно так наш чат будет выглядеть в дизайне:

![chatix.io](http://dev-cdn.chatix.io/habr/ChatixChatroom.png)

## Взаимодействие между компонентами
Наши компоненты должны передавать друг другу данные и для того чтобы все работало как надо давайте уже сейчас определим как они будут друг с другом взаимодействовать. 

![Взаимодействие компонетов](http://dev-cdn.chatix.io/habr/EntityRelation.png)

Как видно на рисунке, основным компонентом у нас является `App`, который предоставляет данные в дочерние компоненты (благодаря реактивности мы просто назначим `prop` и дочерний компонент будет реагировать на изменения), а дочерние компоненты последовательно пробрасывают вызовы методов до `App`. Это не лучшая архитектура которую можно (и следует) сделать для продакшн-проекта, но для нашего урока сойдет.

## Создание проекта

### Создаем визуальные компоненты
#### Шапка

1. Для начала нужно создать новый проект, для этого будем использовать [create-react-app](create-react-app).
```sh
npx create-react-app chatix-chatroom
cd chatix-chatroom
```

 Запустите проект командой
 
 ```sh
npm start
```

2. Начнем с создания шапки. 
Сначала добавим в шапку логотип. Для этого Внутри папки src cоздаем папку **components**, а в ней папку **logo_header**. В эту папку загружаем логотип и создаем 2 файла **LogoHeader.js** и **LogoHeader.css**

**LogoHeader.js**
```js
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
```

**LogoHeader.css**
```css
.LogoHeader{
    flex-basis: 200px;
    flex-grow: 0;
    flex-shrink: 0;
}
```

Здесь все понятно, в этом компоненте просто импортруется файл с логотипом и стили.

Код файлов стилей здесь больше добавлять не буду, их вы можете посмотреть на странице [готового проекта](https://www.npmjs.com/package/chatix-core)

Затем выведем название чат-комнаты. Для этого создаем папку **room-header** а в ней кмопонент **RoomHeader.js**. Название в этот компонгент мы будем прокидывать через props, поэтому пишем `props.chatroomName` и сейчас мы его сюда передадим.

**RoomHeader.js**

```js
import React from 'react';
import './RoomHeader.css';

function RoomHeader(props){
    return (
        <div className="RoomHeader">
            <h1>{props.chatroomName}</h1>
        </div>
    );
}

export default RoomHeader;
```



Затем создаем сам компонент шапки и размещаем в нем логотип и так же в названии пишем `props.chatroomName`.
Потому что название будет храниться в компоненте **App** и из него мы будeм передавать его в сначала в **Header** а из **Header** в **RoomHeader**.

**components\header\Header.js**

**Header.js**
```js
import React from 'react';
import './Header.css'
import LogoHeader from '../logo_header/LogoHeader';
import RoomHeader from '../room-header/RoomHeader';

function Header(props) {
    return (
        <header>
            <LogoHeader/>
            <RoomHeader chatroomName={props.chatroomName} />
        </header>
    );
}

export default Header;
```

Далее открываем файлы **App.js** и добавляем в него компонент **Header.js**.
Затем в стэйт добавляем название и через **props** пробрасываем его в шапку.
Еще в шапке нужно добавить имя текущего пользователя. Для этого в стэйт добавляем объект пользвоателя и так же пробрасываем его в шапку

```js
import React from 'react';
import './App.css';
import Header from './components/header/Header';

class App extends React.Component {
    constructor(props){
        super(props);
        chatroomName: 'Чат-комната',
        me: {
            is_online: true,
            name: "Алексей",
            uuid: "98s7dfh9a8s7dhf"
        }
    }
    render() {
        return (
          <div className="App">
            <Header 
                chatroomName='Чат-комната'
                me={this.state.me}
            />
          </div>
        );
    };
}

export default App;
```

Теперь в шапке нужно добавтиь инпут с именем текущего пользователя. И при изменении имени реагировать на это событие в компоненте **App**
Для этого инпуту с именем добавляем функцию обработчик `handleChangeName` и в ней вызываем callback функцию `props.updateVisitor` в которую передадм объект пользователя с обновленным именем. 

**Header.js**
```js
function Header(props) {
    const [name, setName] = useState(props.me.name ? props.me.name : props.me.uuid.substr(-10))

    const handleChangeName = (e) => {
        setName(e.target.value)
        let visitor = JSON.parse(JSON.stringify(props.me));
        visitor.name = e.target.value;
        props.updateVisitor(visitor)
    }

    return (
        <header>
            <LogoHeader/>
            <RoomHeader chatroomName={props.chatroomName}/>
            {
                props.me ? 
                    <input
                        className='name-input'
                        value={name}
                        placeholder='Ваше имя'
                        onChange={(e) => handleChangeName(e)}
                    />
                : null
            }
        </header>
    );
}
```

Теперь добавим в **App** эту функцию `props.updateVisitor` и пробросим ее в шапку. Пока что она просто оновляет объект пользователя в стэйте, но дальше мы через нее будем обновлять пользователя на сервере.

```js
onUpdateVisitor = (visitor) => {
    this.setState({me: visitor})
 }
```

Итак, сейчас наше приложение выглядит вот так и пока что умеет только обновлять имя. Идем дальше

![Chatroom header](http://dev-cdn.chatix.io/habr/chatroomHeader.png)

#### Сайдбар

Теперь давайте займемся созданием сайдбара.
Сайдбар будет находиться внутри основного компонента на странице **Main.js**.
Создаем его **components\main\Main.js**, затем создаем компонент со списком пользователей **components\member-list\MemberList.js** и сразу создаем компонент который будет отображать самих пользователей **components\member-item\MemberItem.js**.

Что бы стало понятней как связаны эти 3 компонента взгляните на схему проекта в начале статьи.

Компоненты созданы, теперь пойдем по порядку. 
Для начала добавим в стэйт компонента **App** массив пользователей и добавим компонент **Main**. Затем пробросим в него этих пользователей. 

**App**
```js
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      chatroomName: 'Чат-комната',
      members: [
        {
          is_online: true,
          name: "Алексей",
          uuid: "98s7dfh9a8s7dhf"
        },
        {
          is_online: true,
          name: "Дмитрий",
          uuid: "mnzxcv97zx6chvo"
        },
        {
          is_online: false,
          name: "Андрей",
          uuid: "kjuhv987ashdfoua"
        },
        {
          is_online: false,
          name: "Владимир",
          uuid: "jdhnf978WEHJSNDL"
        },
      ],
      me: {
        is_online: true,
        name: "Алексей",
        uuid: "98s7dfh9a8s7dhf"
      }
    };
  }
  render() {
    return (
      <div className="App">
        <Header 
            chatroomName={this.state.chatroomName} 
            me={this.state.me}    
        />
        <Main 
            members={this.state.members}
            me={this.state.me}
        />
      </div>
    );
  };
}
```

В компоненте **Main** добавляем компонент **MemberList** и пробрасываем массив пользователей в него.

**Main.js**
```js
function Main(props) {
    return(
        <section className="Main">
            <MemberList members={props.members} />
        </section>
    );
}
```

А в компоненте **MemberList** мы в цикле перебираем всех пользователей и для каждого возвращаем компонент **MemberItem** и передаем в него объект пользователя.

**MemberList.js**
```js
function MemberList(props) {
    const members = props.members.map((member) => 
        <MemberItem key={member.uuid} member={member} />
    );

    return (
        <section className="MemberList">
            {members}
        </section>
    );
}
```

Компонент **MemberItem** занимается уже непосредственного отображением пользователя в сайдбаре. В нем мы проверяем наличие имени у пользователя, если оно не установлено, то отбражаем первые 10 символов идентификатора. Так же проверяем статус онлайн/офлайн и сравниваем идентификатор с идентификатором текущего пользователя, что бы напротив него отобразить пометку "(Вы)".

```js
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
```

Готово. Сейчас приложение выглядит уже вот так

![Chatroom header](http://dev-cdn.chatix.io/habr/chatroomSidebar.png)


#### Список сообщений и форма отправки

Теперь займемся список сообщений и формой отправки.
Для начала в стэйт компонента **App** добавим массив с сообщениями.

**App**
```js
this.state = {
      chatroomName: 'Чат-комната',
      messages: [
        {
          content: "Сообщение 1",
          sender_id: "mnzxcv97zx6chvo",
          uuid: "dg897sdfg"
        },
        {
          content: "Сообщение 2",
          sender_id: "98s7dfh9a8s7dhf",
          uuid: "8723hernm"
        },
        {
          content: "Еще одно сообщение",
          sender_id: "mnzxcv97zx6chvo",
          uuid: "435nbcv98234"
        }
      ],
      members: [
        {
          is_online: true,
          name: "Алексей",
          uuid: "98s7dfh9a8s7dhf"
        },
        {
          is_online: true,
          name: "Дмитрий",
          uuid: "mnzxcv97zx6chvo"
        },
        {
          is_online: false,
          name: "Андрей",
          uuid: "kjuhv987ashdfoua"
        },
        {
          is_online: false,
          name: "Владимир",
          uuid: "jdhnf978WEHJSNDL"
        },
      ],
      me: {
        is_online: true,
        name: "Алексей",
        uuid: "98s7dfh9a8s7dhf"
      }
    };
```

И пробросим их в компонент **Main**

**App**
```js
 <Main
    members={this.state.members}
    messages={this.state.messages}
    me={this.state.me}
/>
```

Теперь создадим компонент **conponents/chat-field/ChatField.js**
Подключим его в **Main** и пробросим сообщения в него.

**Main**
```js
function Main(props) {
    return(
        <section className="Main">
            <MemberList 
                me={props.me} 
                members={props.members} />
            <ChatField messages={props.messages} />
        </section>
    );
}
```

Далее создадим компонент **conponents/message-container/MessageContainer.js**
Подключим его в **ChatField** и так же пробрасываем сообщения в него.

**ChatField**
```js
function Main(props) {
    return(
        <section className="Main">
            <MemberList 
                me={props.me} 
                members={props.members} />
            <ChatField messages={props.messages} />
        </section>
    );
}
```

Дальше мы циклом будем перебирать все сообщения и для каждого воозвращать компонент который будет его показывать. 
Давайте создадим его **conponents/message/Message.js**. В нем мы отображаем иконку посетителя, его имя или идентификатор если имя не указано и сам текст сообщения.

**Message**
```js
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
```

Теперь в  **MessageContainer** циклом перебираем все сообщения и для каждого возвращаем компонент **Message**, в который передаем объект сообщения

**MessageContainer**
```js
function MessageContainer(props) {
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
```

Сейчас проект выглядит вот так:

![Chatroom Messages](http://dev-cdn.chatix.io/habr/chatroomMessages.png)

Теперь создадим компонент с формой для отправки сообщений **components/send-message-form/SendMessageForm.js**. В нем создадим инпут и кнопку для отправки. При изменении инпута текст из него записываем в стэйт, а при клике на кнопку вызываем callback функцию `onSendNewMessage` и передаем в нее сообщение из стэйта. Функцию `onSendNewMessage` создадимя чуть позже в копомненте **App** и пробросим ее через props.

**SendMessageForm**
```js
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
```

Теперь разместим компонент **SendMessageForm** внутри **ChatField**.

**ChatField**
```js
function ChatField(props) {
    return(
        <section className="ChatField">
            <MessageContainer 
                members={props.members}
                messages={props.messages} 
            />
            <SendMessageForm onSendNewMessage={props.onSendNewMessage}/>
        </section>
    );
}
```

И в компоненте **Main** также пробросим функцию `onSendNewMessage` в **ChatField**.

**Main**
```js
<ChatField
    members={props.members}
    messages={props.messages}
    onSendNewMessage={props.onSendNewMessage} 
/>
```

Теперь создадим эту функцию в **App** и пробросим ее в **Main**.

**App**
```js
onSendNewMessage = async (message) => {
    console.log(message)
 }
```

**App**
```js
<Main
    members={this.state.members}
    messages={this.state.messages}
    onSendNewMessage={this.onSendNewMessage}
    me={this.state.me}
/>
```
Готово. Теперь при клике на кнопку отправки сообщения оно будет передаваться в компонент **App**.
Сейчас приложение выглядит вот так:

![Chatroom Final](http://dev-cdn.chatix.io/habr/chatroomFinal.png)

Итак, сейчас у нас в приложении все отображается и все работает как нужно, но пока что со статичными данными, а что бы оживить наш чат, нужно связать его с бэкендом.


#### Подключение бэкенда

Для этого первым делом нужно установить пакет [chatix-core](https://www.npmjs.com/package/chatix-core).

```sh
npm i chatix-core
```

Создать аккаунт в **chatix** и создать чат-комнату. Для этого переходим на [chatix.io](https://chatix.io/) и регистрируемся.
**websiteId** после этого вы сможете посмотреть в интерфейсе администратора на странице настроек чата.

Ну и за одно сразу создать новую чат-комнату с которой и будем работать.

![Создание чат-комнаты](http://dev-cdn.chatix.io/habr/createChatroom.png)

Далее создаем новый компонент через который мы будем работать с сервером.
**components\chatix\ChatixSDK.js**

В нем импортируем **ChatixCore**

```js
import ChatixCore from 'chatix-core';
```

В компоненте **ChatixSDK** создаем экземпляр класса **ChatixCore** и в качестве аргумента передаем **websiteId**.

```js
const websiteId = "d4913f83-e3a8-484d-be1b-c64ffe248592";
this.sdk = new ChatixCore(websiteId);
```

Теперь в **this.sdk** вам доступны методы для работы с чат-комнатой. Посмотреть список методов можно на странице проекта [chatix-core](https://www.npmjs.com/package/chatix-core)

Далее нам нужно подключиться к серверу и получить данные о созданной ранее чат-комнате. Для этого есть ассинхронные методы **start()** и **getChatroom()**.

**this.chatroomId** - вы получите в интерфесе менеджера сразу после создания чат-комнаты.

После того как получили объект чат-комнаты, давайте сразу возьмем его название и передадим его в **App**. Для этого вызовем callback функцию `props.updateChatroomTitle(chatroom.title)`. Которую сейчас добавим в **App**.

**ChatixSDK**
```js
class ChatixSDK extends React.Component {
    constructor(props){
        super(props);
        const websiteId = "d4913f83-e3a8-484d-be1b-c64ffe248592"; // websiteId you can get in manager's interface on setting's page
        this.chatroomId = "a79a501e-b187-409b-aac0-05dd863abae5"; // chatroomId you will get after create chatroom in manager's interface
        this.sdk = new ChatixCore(websiteId);
        this.sdk.start()
            .then( async () => {
                try {
                    // refresh information about chatroom and call passed handler
                    const chatroom = await this.sdk.getChatroom(this.chatroomId);
                    if (props.updateChatroomTitle) {
                        props.updateChatroomTitle(chatroom.title);
                    }
                } catch (err) {
                    console.error(err);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }
    render(){
        return null;
    }
}

```

Теперь в **App** подключим компонент **ChatixSDK** и прокинем в него него функцию `updateChatroomTitle` которая будем обновлять обновлять название чата. Так же добавим ему ref ссылку, что бы могли обращаться к этому компоненту.

**App**
```js
this.chatixSDK = React.createRef();
```

```js
setChatroomTitle = (newName) => {
    const newStateFragment = { chatroomName: newName};
    this.setState({...this.state, ...newStateFragment});
};
```

**App**
```js
render() {
    return (
        <div className="App">
            <Header 
                chatroomName={this.state.chatroomName}
                me={this.state.me}
                updateVisitor={this.onUpdateVisitor}
            />
            <Main
                members={this.state.members}
                messages={this.state.messages}
                onSendNewMessage={this.onSendNewMessage}
                me={this.state.me}
            />
            <ChatixSDK 
                ref={this.chatixSDK}
                updateChatroomTitle={this.setChatroomTitle}
            />
        </div>
    );
  };
```

Готово. Теперь сразу после подключения к серверу мы запрашиваем данные о чате, получаем его название и записываем его в стэйт компонента **App**, а поскольку изменения в стэйте вызывают повторный рендер компонента, то название в шапке обновится автоматически. Сейчас название по умолчанию в стэйте можно заменить пустой строкой.

**App**
```js
chatroomName: ''
```

Теперь давайте заполним боковую панель настоящими пользователями.
Но прежде чем получить список пользователей вы должны подключиться к чату, для этого в **ChatixSDK** внутри функции `this.sdk.start()` получаем список всех чат-комнат пользователя, проверяем подключен ли он к текущей и если нет, то подключаем его.

**ChatixSDK**
```js
const myChatrooms = await this.sdk.getMyChatrooms();
if (myChatrooms.filter(x => x.id===this.chatroomId).length === 0) {
    await this.sdk.connectToChatroom(this.chatroomId);
}
```

Далее мы уже можем получить список пользователей, для этого в файле **ChatixSDK** так же как внутри функции `this.sdk.start()` получаем всех пользователей.

**ChatixSDK**
```js
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
```

Здесь мы в бесконечном цикле постранично запрашиваем пользователей пока не получим всех, как только получили всех -  прерываем цикл. После этого так же как и название чат-комнаты пробрасываем в родительский компонент использую callback функцию.

**ChatixSDK**
```js
if (props.setChatroomMembers) {
    props.setChatroomMembers(allChatroomMembers);
}
```

Теперь в компоненте **App** создадим эту callback функцию `setChatroomMembers` которая будет сортировать пользователей по статусу в сети\не в сети и по алфавиту и записывать их в state.

**App.js**
```js
setChatroomMembers = (members) => {
    members.sort(this.sortMembers);
    const newStateFragment = { members: members};
    this.setState({...this.state, ...newStateFragment});
}
```

И добавим функцию сортировки **sortMembers**. Она сортирует пользователей по статусу и по алфавиту.

**App.js**
```js
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
```

Далее пробрасываем функцию **setChatroomMembers** в **ChatixSDK**.

**App**
```js
render() {
    return (
        <div className="App">
            <Header 
                chatroomName={this.state.chatroomName}
                me={this.state.me}
                updateVisitor={this.onUpdateVisitor}
            />
            <Main
                members={this.state.members}
                messages={this.state.messages}
                onSendNewMessage={this.onSendNewMessage}
                me={this.state.me}
            />
            <ChatixSDK 
                ref={this.chatixSDK}
                updateChatroomTitle={this.setChatroomTitle}
                setChatroomMembers={this.setChatroomMembers}
            />
        </div>
    );
  };
```

Теперь сразу после подключения к серверу мы так же как и с заголовком запрашиваем список всех подключенных пользователей и записываем его в стэйт компонента **App**. И так же меняем дефолтной значение списка пользователей в стэйте.

*App**
```js
members: []
```

Теперь точно по такому же принципу получаем объект текущего пользователя и массив сообщений и также записываем их в стэйт **App**

**ChatixSDK**
```js
// lets load 100 last messages from current chatroom
const lastMessages = await this.sdk.getChatroomMessages(this.chatroomId, null, 100);
if (props.setChatroomMessages) {
    props.setChatroomMessages(lastMessages);
}

if (props.setMe) {
    const me = this.sdk.getVisitor();
    this.props.setMe(me);
}
```

**App**
```js
<ChatixSDK 
    ref={this.chatixSDK}
    setMe={this.setMe}
    updateChatroomTitle={this.setChatroomTitle}
    setChatroomMembers={this.setChatroomMembers}
    setChatroomMessages={this.setChatroomMessages}
/>
```

Дальше займемся отправкой сообщений.

У нас в **App** уже есть функция `onSendNewMessage` которая выводит отправляем сообщение в консоль. Вместо этого мы просто будем вызывать метод `sendChatroomMessage` для отправки сообщения из **ChatixSDK**.
Это ассинхронный метод и он возвращает в ответ объект отправленного сообщения, которые мы тут же добавляем в массив сообщений в стйэте. Кстати обратите внимание, что к  **chatixSDK** мы обращаемся по  созданной ранее ссылке `this.chatixSDK`.

**App**
```js
onSendNewMessage = async (message) => {
    let receivedMsg = await this.chatixSDK.current.sendChatroomMessage(message);
    
    const currentMessages = this.state.messages;
    currentMessages.push(receivedMsg);
    const newStateFragment = {messages: currentMessages};
    this.setState({...this.state, ...newStateFragment});
  }
```

Поскольку изменение в стэйте вызывает его повторный рендер, то список сообщений у нас обновится автоматически. Но нам нужно сделать что бы при добавлении сообщений скролл в блоке с сообщениями опускался вниз. 
Для этого открываем компонент **MessageContainer** и используя хук **useEffect** следим за изменением массива с сообщениями, и как только он изменился и сообщений добавилось мы получаем **scrollHeight** блока с сообщениями и скроллим его на эту же величину

```js
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
```

Теперь нам нужно научиться реагировать на входящие сообщения,  подключение/отключение пользователей и изменение информации и подключенных пользователях.

Для этого в файле **ChatixSDK.js** в конструкторе нам нужно переопределить callback функции. Полный список функций и аргументов вы можете посмотреть на странице проекта [chatix-core](https://www.npmjs.com/package/chatix-core).

Сейчас нас интересуют **onChatroomMessageReceived**, **onMemberConnectedToChatroom**, **onMemberDisconnectedFromChatroom** и **onApplyVisitorInfo**.

Переопределяем их и на каждую функцию вызываем свой callback который создадим в **App**.

```js
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
```

Далее идем в **App** и создаем эти функции.

**onNewMessageReceived(message)**
Эта функция принимает объект сообщения и просто добавляет его в state к остальным сообщениям. После этого копомнент повторно отрендерится и оно отобразится в списке, так же как во время отправки исходящего сообщения.

**App**
```js
onNewMessageReceived = (message) => {
    const currentMessages = this.state.messages;
    currentMessages.push(message);
    const newStateFragment = {messages: currentMessages};
    this.setState({...this.state, ...newStateFragment});
  }
```

**App**
**addChatroomMember(member)**
Эта функция принимает объект посетителя и так же  добавляем его в state в уже имеющейся массив members. После этого копомнент так же повторно отрендерится и пользователи добавится в список подключенных пользователей.

**App**
```js
addChatroomMember = (member) => {
    const newStateFragment = {};
    const currentMembers = this.state.members;
    currentMembers.push(member);
    currentMembers.sort(this.sortMembers);
    newStateFragment.members = currentMembers;
    this.setState({...this.state, ...newStateFragment});
  }
```

**App**
**removeChatroomMember(memberId)**
Эта функция принимает идентификатор посетителя и удаляет из state посетителя с таким идентификатором **members** в **state**.

```js
removeChatroomMember = (memberId) => {
    const currentMembers = this.state.members;
    const filteredMembers = currentMembers.filter(x=> x.uuid !== memberId);
    const newStateFragment = {members: filteredMembers};
    this.setState({...this.state, ...newStateFragment});
  }
```

**onMemberUpdated(updatedMember)**
Эта функция обновляет информацию и посетителе. Например если у него изменилось имя или статус. По идентификтору ищем этого пользователя в **state** и заменяем его на обновленного.

**App**
```js
onMemberUpdated = (updatedMember) => {
    let oldMember = this.state.members.find(member => member.uuid === updatedMember.uuid);
    oldMember = this.state.members.indexOf(oldMember);
    let newStateMembers = this.state.members;
    newStateMembers[oldMember] = updatedMember;

    this.setState({
      members: newStateMembers
    })
}
```

И пробрасываем их все в **ChatixSDK**

**ChatixSDK**
```js
<ChatixSDK 
    ref={this.chatixSDK}
    setMe={this.setMe}
    updateChatroomTitle={this.setChatroomTitle}
    setChatroomMembers={this.setChatroomMembers}
    addChatroomMember={this.addChatroomMember} 
    removeChatroomMember={this.removeChatroomMember}
    setChatroomMessages={this.setChatroomMessages}
    onNewMessageReceived={this.onNewMessageReceived}
    onMemberUpdated={this.onMemberUpdated} 
/>
```

Готово! Мы создали просто чат который умеет отправлять\принимать сообщения, показывать список пользователей, реагировать на их подключение/отключение и обновление информации.

