package handlers

import (
	"chat-app/models"
	"log"
	"net/http"
)

func ServeWs(hub *models.Hub, userService *models.UserService, w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		log.Println("Username is required")
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	conn, err := models.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}

	// Create new client
	client := &models.Client{
		hub:      hub,
		conn:     conn,
		send:     make(chan []byte, 256),
		username: username,
	}

	// Register client with hub
	client.hub.register <- client

	// Start goroutines for reading and writing
	go client.writePump()
	go client.readPump()
}