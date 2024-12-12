"use client";

import { useEffect, useState } from "react";
import { Client, Session, Socket } from "@heroiclabs/nakama-js";
import { v4 as uuidv4 } from "uuid";

const ROOM_NAME = "global";

export const ChatComponent = () => {
  interface Message {
    message_id: string;
    username: string;
    create_time: string;
    content: {
      data: string;
    };
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const authenticate = async (client: Client) => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("deviceId", deviceId);
    }

    const session = await client.authenticateDevice(deviceId, true);

    localStorage.setItem("user_id", session.user_id || "");

    sessionHandler(client, session);
  };

  useEffect(() => {
    const nakamaClient = new Client("defaultkey", "127.0.0.1", "7350");
    authenticate(nakamaClient);
  }, []);

  const sessionHandler = (client: Client, session: Session) => {
    const newSocket = client.createSocket(false);
    setSocket(newSocket);

    newSocket.onchannelmessage = message => {
      const newMessage = {
        message_id: message.message_id,
        username: message.username,
        create_time: message.create_time,
        content: message.content,
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    newSocket.connect(session, true).then(() => {
      // join default room
      newSocket.joinChat(ROOM_NAME, 1, true, false).then(chatInfo => {
        setChatId(chatInfo.id); // Set chatId state

        const data = {
          data: session.username + " has joined the chat",
        };

        // send message
        newSocket.writeChatMessage(chatInfo.id, data);
      });
    });
  };

  const sendMessage = () => {
    if (!socket || !chatId) return;

    const data = {
      data: message,
    };

    socket.writeChatMessage(chatId, data); // Use chatId state
    setMessage("");
  };

  return (
    <>
      <p className="my-2 font-medium">Community Chat</p>

      {messages.length > 0 && (
        <div style={{ height: "180px", marginBottom: "1em", overflowY: "scroll" }}>
          {messages.map(message => (
            <div key={message.message_id} className="mb-4 p-2 border rounded shadow-sm">
              <div className="font-bold">{message.username}</div>
              <div className="text-xs text-gray-500">
                <span>{new Date(message.create_time).toLocaleTimeString()}</span>
              </div>
              <div className="mt-0">
                <p>{message.content.data}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Message"
          className="flex-1 p-2 border rounded"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button
          type="button"
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          disabled={message.length < 1}
          onClick={sendMessage}
        >
          Send
        </button>
      </form>
    </>
  );
};
