import React, { useEffect, useState } from "react";
import Websocket from "react-websocket";
import "./twitch-chat-style.css";

const chat_timeout = 30000; //time in milliseconds
const EMOTE_URL_BASE = `http://static-cdn.jtvnw.net/emoticons/v1/`

const TwitchChat = () => {
    // const [messageList, setMessageList] = useState([
    //     {
    //         time: Date.now(),
    //         user: "matan",
    //         text: "oh hi",
    //     },
    //     {
    //         time: Date.now() + 1000,
    //         user: "matan",
    //         text: "oh hi 2",
    //     },
    // ]);

    const [messageList, setMessageList] = useState([]);

    const [emotes, setEmotes] = useState([304047803, 304214060]);

    useEffect(() => {
        const clearOldMessages = setInterval(() => {
            const newMessageList = [];
            for (let index = 0; index < messageList.length; index = index + 1) {
                //console.log(messageList[index]);
                if (Date.now() - messageList[index].time < chat_timeout) {
                    newMessageList.push(messageList[index]);
                }
            }
            //console.log(newMessageList);
            setMessageList(newMessageList);
        }, 3000);
        return () => clearInterval(clearOldMessages);
    }, [messageList]);

    const handleData = (message_data) => {
        //console.log(message_data);
        const message = JSON.parse(message_data);
        // setMessageList([
        //     ...messageList,
        //     {
        //         time: Date.now(),
        //         user: message.user,
        //         text: message.text,
        //     },
        // ]);
        if(message.emotes) {
            setEmotes((emotes) => [...emotes, ...Object.keys(message.emotes)]);
        }

    };

    // function renderMessage(message) {}

    return (
        <div className="message-area">
            <ul className="list">
                {messageList.map((item, index) => (
                    <li className="list-item" key={index}>
                        {`${item.user}: ${item.text}`}
                    </li>
                ))}
            </ul>
            <div>
                {emotes.map((item, index) => (
                    <img className="emote" src={`${EMOTE_URL_BASE}/${item}/3.0`} alt="" key={index}></img>
                ))}
            </div>
            <Websocket
                url="ws://127.0.0.1:8080/"
                onMessage={handleData}
                onOpen={() => {
                    console.log("opened");
                }}
            />
        </div>
    );
};

export default TwitchChat;
