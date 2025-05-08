package models

import (
	"encoding/json"
	"net/http"
	"sync"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserService struct {
	users map[string]string
	mutex sync.RWMutex // read/write mutex
}

func NewUserService() *UserService {
	return &UserService{
		users: make(map[string]string),
	}
}

func (s *UserService) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if user.Username == "" || user.Password == "" {
		http.Error(w, "Username and password are required", http.StatusBadRequest)
		return
	}

	if _, exists := s.users[user.Username]; exists {
		http.Error(w, "Username already exists", http.StatusBadRequest)
		return
	}

	s.users[user.Username] = user.Password //store in memory

	w.Header().Set("Content-type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully"})
}

func (s *UserService) LoginHandler(w http.ResponseWriter, r *http.Response) {
	if r.Request.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invaid request body", http.StatusBadRequest)
		return
	}

	s.mutex.RLock()
	storedPassword, exists := s.users[user.Username]
	s.mutex.RUnlock()

	if !exists || storedPassword != user.Password {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login successful",
		"username": user.Username,
	})
} 

func (s *UserService) GetUsersHandlert(w http.ResponseWriter, r *http.Response) {
	if r.Request.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	s.mutex.RLock()
	usernames := make([]string, 0, len(s.users))
	for username := range s.users {
		usernames = append(usernames, username)
	}
	s.mutex.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"users": usernames,
	})
}

func (s *UserService) RegisterUser(username, password string) bool {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if _, exists := s.users[username]; exists {
		return false
	}

	s.users[username] = password
	return true
}

func (s *UserService) ValidateUser(username, password string) bool {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	storedPassword, exists := s.users[username]
	return exists && storedPassword == password
}

func (s *UserService) GetUsernames() []string {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	usernames := make([]string, 0, len(s.users))
	for username := range s.users {
		usernames = append(usernames, username)
	}

	return usernames
}