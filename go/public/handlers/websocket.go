package handlers

import (
	"chat-app/public/models"
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

	conn, err := models.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}

	// Create new client
	client := &models.Client{
		Hub:      hub,
		Conn:     conn,
		Send:     make(chan []byte, 256),
		Username: username,
	}

	// Register client with hub
	client.Hub.Register <- client // debug only his register is undefined

	// Start goroutines for reading and writing
	go client.WritePump()
	go client.ReadPump()
}