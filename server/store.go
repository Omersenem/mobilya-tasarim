package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

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

type Store struct {
	db *sql.DB
}

func NewStore() *Store {
	dbURL := os.Getenv("TURSO_DATABASE_URL")
	authToken := os.Getenv("TURSO_AUTH_TOKEN")

	if dbURL == "" {
		log.Fatal("TURSO_DATABASE_URL ortam değişkeni gerekli")
	}

	url := dbURL + "?authToken=" + authToken

	db, err := sql.Open("libsql", url)
	if err != nil {
		log.Fatalf("Veritabanına bağlanılamadı: %v", err)
	}

	// Tabloları oluştur
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			pass_hash TEXT NOT NULL
		)
	`)
	if err != nil {
		log.Fatalf("users tablosu oluşturulamadı: %v", err)
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS designs (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			name TEXT NOT NULL,
			data TEXT,
			updated_at INTEGER NOT NULL
		)
	`)
	if err != nil {
		log.Fatalf("designs tablosu oluşturulamadı: %v", err)
	}

	return &Store{db: db}
}

// ---------- Kullanıcılar ----------

func (s *Store) FindUserByEmail(email string) (User, bool) {
	var u User
	err := s.db.QueryRow("SELECT id, email, pass_hash FROM users WHERE email = ?", email).
		Scan(&u.ID, &u.Email, &u.PassHash)
	if err != nil {
		return User{}, false
	}
	return u, true
}

func (s *Store) FindUserByID(id string) (User, bool) {
	var u User
	err := s.db.QueryRow("SELECT id, email, pass_hash FROM users WHERE id = ?", id).
		Scan(&u.ID, &u.Email, &u.PassHash)
	if err != nil {
		return User{}, false
	}
	return u, true
}

func (s *Store) CreateUser(u User) {
	_, err := s.db.Exec("INSERT INTO users (id, email, pass_hash) VALUES (?, ?, ?)",
		u.ID, u.Email, u.PassHash)
	if err != nil {
		log.Printf("Kullanıcı oluşturma hatası: %v", err)
	}
}

// ---------- Tasarımlar ----------

func (s *Store) ListDesigns(userID string) []Design {
	rows, err := s.db.Query("SELECT id, user_id, name, data, updated_at FROM designs WHERE user_id = ? ORDER BY updated_at DESC", userID)
	if err != nil {
		log.Printf("Tasarım listesi hatası: %v", err)
		return []Design{}
	}
	defer rows.Close()

	var designs []Design
	for rows.Next() {
		var d Design
		var data sql.NullString
		if err := rows.Scan(&d.ID, &d.UserID, &d.Name, &data, &d.UpdatedAt); err != nil {
			continue
		}
		if data.Valid {
			d.Data = json.RawMessage(data.String)
		}
		designs = append(designs, d)
	}
	if designs == nil {
		designs = []Design{}
	}
	return designs
}

func (s *Store) GetDesign(id string) (Design, bool) {
	var d Design
	var data sql.NullString
	err := s.db.QueryRow("SELECT id, user_id, name, data, updated_at FROM designs WHERE id = ?", id).
		Scan(&d.ID, &d.UserID, &d.Name, &data, &d.UpdatedAt)
	if err != nil {
		return Design{}, false
	}
	if data.Valid {
		d.Data = json.RawMessage(data.String)
	}
	return d, true
}

func (s *Store) SaveDesign(d Design) {
	dataStr := string(d.Data)
	_, err := s.db.Exec(`
		INSERT INTO designs (id, user_id, name, data, updated_at) VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET name = excluded.name, data = excluded.data, updated_at = excluded.updated_at
	`, d.ID, d.UserID, d.Name, dataStr, d.UpdatedAt)
	if err != nil {
		log.Printf("Tasarım kaydetme hatası: %v", err)
	}
}

func (s *Store) DeleteDesign(id string) {
	_, err := s.db.Exec("DELETE FROM designs WHERE id = ?", id)
	if err != nil {
		log.Printf("Tasarım silme hatası: %v", err)
	}
}
