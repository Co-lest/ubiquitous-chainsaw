package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/rs/cors"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "This is a document!")
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handler)

	fs := http.FileServer(http.Dir("./public"))
	mux.Handle("/", fs)

	port := ":1111"

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
		AllowCredentials: true,
	}).Handler(mux)

	server := &http.Server{
		Addr:    port,
		Handler: corsHandler,
	}

	if _, err := os.Stat("./public"); os.IsNotExist(err) {
		err := os.MkdirAll("./public", 0755)
		if err != nil {
			log.Fatal("Error creating directory:", err)
		}
	}

	// fmt.Println("Server listenign on port 1111")
	// err := http.ListenAndServe(port, mux)
	// if err != nil {
	// 	log.Fatalf("Error creating a server on port 1111")
	// }

	log.Fatal(server.ListenAndServe())
}