package main

import (
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = func() []byte {
	s := os.Getenv("JWT_SECRET")
	if s == "" {
		s = "kitchen-demo-secret-degistir-beni"
	}
	return []byte(s)
}()

func makeToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(jwtSecret)
}

// authMiddleware — Bearer token doğrular, kullanıcıyı c.Locals("user")'a koyar.
func authMiddleware(store *Store) fiber.Handler {
	return func(c *fiber.Ctx) error {
		h := c.Get("Authorization")
		if !strings.HasPrefix(h, "Bearer ") {
			return fiber.NewError(fiber.StatusUnauthorized, "yetkisiz")
		}
		tokenStr := strings.TrimPrefix(h, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			return fiber.NewError(fiber.StatusUnauthorized, "geçersiz oturum")
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return fiber.NewError(fiber.StatusUnauthorized, "geçersiz oturum")
		}
		uid, _ := claims["sub"].(string)
		user, found := store.FindUserByID(uid)
		if !found {
			return fiber.NewError(fiber.StatusUnauthorized, "kullanıcı bulunamadı")
		}
		c.Locals("user", user)
		return c.Next()
	}
}

type authBody struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func registerHandler(store *Store) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var b authBody
		if err := c.BodyParser(&b); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "geçersiz istek")
		}
		b.Email = strings.TrimSpace(strings.ToLower(b.Email))
		if b.Email == "" || len(b.Password) < 4 {
			return fiber.NewError(fiber.StatusBadRequest, "e-posta gerekli, şifre en az 4 karakter")
		}
		if _, exists := store.FindUserByEmail(b.Email); exists {
			return fiber.NewError(fiber.StatusConflict, "bu e-posta zaten kayıtlı")
		}
		hash, err := bcrypt.GenerateFromPassword([]byte(b.Password), bcrypt.DefaultCost)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "şifre işlenemedi")
		}
		user := User{ID: uuid.NewString(), Email: b.Email, PassHash: string(hash)}
		store.CreateUser(user)
		token, _ := makeToken(user.ID)
		return c.JSON(fiber.Map{"token": token, "user": user.Public()})
	}
}

func loginHandler(store *Store) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var b authBody
		if err := c.BodyParser(&b); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "geçersiz istek")
		}
		b.Email = strings.TrimSpace(strings.ToLower(b.Email))
		user, found := store.FindUserByEmail(b.Email)
		if !found || bcrypt.CompareHashAndPassword([]byte(user.PassHash), []byte(b.Password)) != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "e-posta veya şifre hatalı")
		}
		token, _ := makeToken(user.ID)
		return c.JSON(fiber.Map{"token": token, "user": user.Public()})
	}
}

func meHandler(c *fiber.Ctx) error {
	user := c.Locals("user").(User)
	return c.JSON(fiber.Map{"user": user.Public()})
}
