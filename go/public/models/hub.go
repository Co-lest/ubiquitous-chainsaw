package models

import (
	"encoding/json"
	"time"
)

type MessageType string

const (
	TextMessage   MessageType = "text"
	SystemMessage MessageType = "system"
	FileMessage   MessageType = "file"
)

// Message defines the message structure
type Message struct {
	ID        string      `json:"id"`
	Type      MessageType `json:"type"`
	Content   string      `json:"content"`
	Sender    string      `json:"sender"`
	Recipient string      `json:"recipient"`
	Timestamp time.Time   `json:"timestamp"`
	IsPrivate bool        `json:"isPrivate"`
}

// Hub maintains active clients and broadcasts messages
type Hub struct {
	// Registered clients
	clients map[*Client]bool

	// Register requests from clients
	Register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Inbound messages from clients
	broadcast chan *Message

	// Chat history (in-memory storage)
	history []*Message
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		Register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *Message),
		history:    make([]*Message, 0),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			welcomeMsg := &Message{
				Type:      SystemMessage,
				Content:   client.Username + " has joined the chat",
				Sender:    "system",
				Timestamp: time.Now(),
				IsPrivate: false,
			}
			h.broadcast <- welcomeMsg

			for _, msg := range h.history { // send caht history to client
				if !msg.IsPrivate || msg.Sender == client.Username || msg.Recipient == client.Username {
					msgBytes, _ := json.Marshal(msg)
					client.Send <- msgBytes
				}
			}
			h.broadcastUserList()

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)

				leaveMsg := &Message{
					Type:      SystemMessage,
					Content:   client.Username + " has left the chat",
					Sender:    "system",
					Timestamp: time.Now(),
					IsPrivate: false,
				}
				h.broadcast <- leaveMsg

				h.broadcastUserList()
			}

		case message := <-h.broadcast:
			h.history = append(h.history, message)
			// Limit history size last 100 messages
			if len(h.history) > 100 {
				h.history = h.history[len(h.history)-100:]
			}

			// Broadcast message to clients
			messageBytes, _ := json.Marshal(message)
			for client := range h.clients {
				// If private message, send only to sender and recipient
				if message.IsPrivate {
					if client.Username == message.Sender || client.Username == message.Recipient {
						client.Send <- messageBytes
					}
				} else {
					client.Send <- messageBytes
				}
			}
		}
	}
}

func (h *Hub) broadcastUserList() {
	// Get list of online users
	onlineUsers := make([]string, 0)
	for client := range h.clients {
		onlineUsers = append(onlineUsers, client.Username)
	}

	// Create user list message
	userListMsg := map[string]interface{}{
		"type":       "userList",
		"users":      onlineUsers,
		"timestamp":  time.Now(),
		"isUserList": true,
	}

	// Send to all clients
	userListBytes, _ := json.Marshal(userListMsg)
	for client := range h.clients {
		client.Send <- userListBytes
	}
}