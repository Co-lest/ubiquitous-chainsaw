package main

import (
	"fmt"
	"log"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "This is a document!")
}

func main() {
	http.HandlerFunc("/", handler)

	port := ":8080"

	log.Fatalf(http.ListenAndServe(port, nil))
}