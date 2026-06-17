package main

import (
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type designBody struct {
	Name string          `json:"name"`
	Data json.RawMessage `json:"data"`
}

// listDesigns — kullanıcının tasarımları (data olmadan, hafif liste).
func listDesigns(store *Store) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user := c.Locals("user").(User)
		designs := store.ListDesigns(user.ID)
		out := make([]fiber.Map, 0, len(designs))
		for _, d := range designs {
			out = append(out, fiber.Map{"id": d.ID, "name": d.Name, "updatedAt": d.UpdatedAt})
		}
		return c.JSON(out)
	}
}

// getDesign — tek tasarım, data dahil (yükleme için).
func getDesign(store *Store) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user := c.Locals("user").(User)
		d, found := store.GetDesign(c.Params("id"))
		if !found || d.UserID != user.ID {
			return fiber.NewError(fiber.StatusNotFound, "tasarım bulunamadı")
		}
		return c.JSON(d)
	}
}

func createDesign(store *Store) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user := c.Locals("user").(User)
		var b designBody
		if err := c.BodyParser(&b); err != nil || b.Name == "" {
			return fiber.NewError(fiber.StatusBadRequest, "isim ve veri gerekli")
		}
		d := Design{
			ID:        uuid.NewString(),
			UserID:    user.ID,
			Name:      b.Name,
			Data:      b.Data,
			UpdatedAt: time.Now().Unix(),
		}
		store.SaveDesign(d)
		return c.Status(fiber.StatusCreated).JSON(d)
	}
}

func updateDesign(store *Store) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user := c.Locals("user").(User)
		existing, found := store.GetDesign(c.Params("id"))
		if !found || existing.UserID != user.ID {
			return fiber.NewError(fiber.StatusNotFound, "tasarım bulunamadı")
		}
		var b designBody
		if err := c.BodyParser(&b); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "geçersiz istek")
		}
		if b.Name != "" {
			existing.Name = b.Name
		}
		if len(b.Data) > 0 {
			existing.Data = b.Data
		}
		existing.UpdatedAt = time.Now().Unix()
		store.SaveDesign(existing)
		return c.JSON(existing)
	}
}

func deleteDesign(store *Store) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user := c.Locals("user").(User)
		d, found := store.GetDesign(c.Params("id"))
		if !found || d.UserID != user.ID {
			return fiber.NewError(fiber.StatusNotFound, "tasarım bulunamadı")
		}
		store.DeleteDesign(d.ID)
		return c.JSON(fiber.Map{"ok": true})
	}
}
