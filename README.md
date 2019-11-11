# Serverless chatroom demo with Chatix

Chatix chatroom demo project. This is a kind of chatroom that uses Chatix as a backend provider. You can adopt it to use in your SaaS project, social app, blog or anything else. This projects can send and receive only text messages, but Chatix also supports sharing images and files.

## How to start
1. Clone this repo
2. Register at chatix.io
3. Create chatroom in dashboard
4. Replace `website_id` and `chatroom_id` in `src/components/ChatixSDK.js`
```js
const websiteId = "YOUR_WEBSITE_ID";
this.chatroomId = "YOUR_CHATROOM_ID";
```
5. `npm start`

