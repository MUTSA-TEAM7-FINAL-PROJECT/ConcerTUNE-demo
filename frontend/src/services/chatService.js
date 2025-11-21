import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "./api";

class chatService {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  connect(roomId, onMessageReceived) {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws-chat"),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        this.connected = true;

        this.sendAddUser(roomId);
        
        this.client.subscribe(`/topic/chat/room/${roomId}`, (message) => {
          const receiveMessage = JSON.parse(message.body);
          onMessageReceived(receiveMessage);
        });


        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
        reject(frame);
      };

      this.client.activate();
    });
  }

  sendMessage(
    roomId,
    sender,
    userId,  
    message,
    targetUserId,
    type = "NORMAL"
  ) {
    if (this.client && this.connected) {
      const chatMessage = {
        roomId,
        sender,
        userId,
        targetUserId,
        message,
        type,
      };

      this.client.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(chatMessage),
      });
    }
  }

  sendAddUser(roomId) {
    const bodyContent = {}; 
    
    this.client.publish({
        destination: `/app/chat.addUser/${roomId}`, 
        body: JSON.stringify(bodyContent),
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }

  fetchChatHistory = async (roomId, page = 0, size = 20) => {
    const response = await api.get(`/api/chat/history/${roomId}`, {
        params: { page, size }
    });
    return response.data;
  }
}

export default new chatService();