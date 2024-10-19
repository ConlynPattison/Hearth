# Chat App

**Tier:** 3-Advanced

Real-time chat interface where multiple users can interact with each other by sending messages.

As a MVP(Minimum Viable Product) you can focus on building the Chat interface. Real-time functionality can be added later (the bonus features).

## User Stories

-   [x] User is prompted to enter a username when he visits the chat app. The username will be stored in the application
-   [x] User can see an `input field` where he can type a new message
-   [x] By pressing the `enter` key or by clicking on the `send` button the text will be displayed in the `chat box` alongside his username (e.g. `John Doe: Hello World!`)

## Bonus features

-   [x] The messages will be visible to all the Users that are in the chat app (using WebSockets)
-   [x] When a new User joins the chat, a message is displayed to all the existing Users
-   [ ] Messages are saved in a database
-   [ ] User can send images, videos and links which will be displayed properly
-   [ ] User can select and send an emoji
-   [ ] Users can chat in private
-   [ ] Users can join `channels` on specific topics

## Personal additional features

-   [x] Users are shown a status for their connection to the `channel` server
-   [ ] Arguments in the socket server are validated - [JOI](https://www.npmjs.com/package/joi)

## Technologies Used

### Languages

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

### Web frameworks & libraries

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Authentication, authorization, security



### Hosting

![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

### Data storage and management

![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

## Useful links and resources

-   [Socket.io](https://socket.io)
-   [How to build a React.js chat app in 10 minutes - article](https://medium.freecodecamp.org/how-to-build-a-react-js-chat-app-in-10-minutes-c9233794642b)
-   [Build a chat application like Slack - React / JavaScript Tutorial - Youtube](https://www.youtube.com/watch?v=a-JKj7m2LIo)
-   [Socket.io Chat App Using Websockets - Youtube Tutorial](https://www.youtube.com/watch?v=tHbCkikFfDE)

## Example projects

-   [Chatty2](https://web-chatty.herokuapp.com/)
-   [Simple TCP Socket based Chat application](https://github.com/dularish/Simple-TCP-Socket-based-Chat-App)
