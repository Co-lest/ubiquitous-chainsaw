package main

import (
	"chat-app/public/handlers"
	"chat-app/public/models"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/rs/cors"
)

func main() {
	port := flag.String("port", "8080", "port to serve on")
	directory := flag.String("dir", "./public", "directory of static files")
	flag.Parse()

	// Initialize hub
	hub := models.NewHub()
	go hub.Run()

	// Initialize user service
	userService := models.NewUserService()

	mux := http.NewServeMux()

	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handlers.ServeWs(hub, userService, w, r)
	})

	mux.HandleFunc("/api/register", userService.RegisterHandler)
	mux.HandleFunc("/api/login", userService.RegisterHandler)
	mux.HandleFunc("/api/users", userService.RegisterHandler)

	// Serve static files
	fs := http.FileServer(http.Dir(*directory))
	mux.Handle("/", fs)

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
		AllowCredentials: true,
	}).Handler(mux)

	// Start server
	server := &http.Server{
		Addr:    ":" + *port,
		Handler: corsHandler,
	}

	fmt.Printf("Starting server on :%s\n", *port)
	fmt.Printf("Serving static files from: %s\n", *directory)

	if _, err := os.Stat(*directory); os.IsNotExist(err) {
		err := os.MkdirAll(*directory, 0755)
		if err != nil {
			log.Fatal("Error creating directory:", err)
		}
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatal("Error creating server!")
	}
}