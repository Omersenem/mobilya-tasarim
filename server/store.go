package main

import (
	"encoding/json"
	"os"
	"sync"

	"github.com/gofiber/fiber/v2"
)

// Basit, dosya tabanlı JSON store. Demo için yeterli ve güvenilir; harici
// veritabanı / CGO bağımlılığı yok. Tüm erişim tek bir mutex ile korunur.

type User struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	PassHash string `json:"passHash"`
}

// Public — şifre hash'ini sızdırmadan API'ye dönülecek temsil.
func (u User) Public() fiber.Map {
	return fiber.Map{"id": u.ID, "email": u.Email}
}

type Design struct {
	ID        string          `json:"id"`
	UserID    string          `json:"userId"`
	Name      string          `json:"name"`
	Data      json.RawMessage `json:"data"`
	UpdatedAt int64           `json:"updatedAt"`
}

type dbData struct {
	Users   []User   `json:"users"`
	Designs []Design `json:"designs"`
}

type Store struct {
	mu   sync.Mutex
	path string
	data dbData
}

func NewStore(path string) *Store {
	s := &Store{path: path}
	if b, err := os.ReadFile(path); err == nil {
		_ = json.Unmarshal(b, &s.data)
	}
	return s
}

func (s *Store) persist() {
	b, _ := json.MarshalIndent(s.data, "", "  ")
	_ = os.WriteFile(s.path, b, 0o644)
}

// ---------- Kullanıcılar ----------

func (s *Store) FindUserByEmail(email string) (User, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, u := range s.data.Users {
		if u.Email == email {
			return u, true
		}
	}
	return User{}, false
}

func (s *Store) FindUserByID(id string) (User, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, u := range s.data.Users {
		if u.ID == id {
			return u, true
		}
	}
	return User{}, false
}

func (s *Store) CreateUser(u User) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data.Users = append(s.data.Users, u)
	s.persist()
}

// ---------- Tasarımlar ----------

func (s *Store) ListDesigns(userID string) []Design {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := []Design{}
	for _, d := range s.data.Designs {
		if d.UserID == userID {
			out = append(out, d)
		}
	}
	return out
}

func (s *Store) GetDesign(id string) (Design, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, d := range s.data.Designs {
		if d.ID == id {
			return d, true
		}
	}
	return Design{}, false
}

func (s *Store) SaveDesign(d Design) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, ex := range s.data.Designs {
		if ex.ID == d.ID {
			s.data.Designs[i] = d
			s.persist()
			return
		}
	}
	s.data.Designs = append(s.data.Designs, d)
	s.persist()
}

func (s *Store) DeleteDesign(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := s.data.Designs[:0]
	for _, d := range s.data.Designs {
		if d.ID != id {
			out = append(out, d)
		}
	}
	s.data.Designs = out
	s.persist()
}
