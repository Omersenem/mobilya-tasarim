package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	store := NewStore()

	app := fiber.New(fiber.Config{
		AppName: "Mutfak Planner API",
		// Hataları tutarlı JSON olarak döndür ({"message": ...}).
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{"message": err.Error()})
		},
	})
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "https://senem-mobilya-tasarim.netlify.app",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	api := app.Group("/api")
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"ok": true})
	})

	// Kimlik
	auth := api.Group("/auth")
	auth.Post("/register", registerHandler(store))
	auth.Post("/login", loginHandler(store))
	auth.Get("/me", authMiddleware(store), meHandler)

	// Tasarımlar (hepsi korumalı)
	designs := api.Group("/designs", authMiddleware(store))
	designs.Get("/", listDesigns(store))
	designs.Post("/", createDesign(store))
	designs.Get("/:id", getDesign(store))
	designs.Put("/:id", updateDesign(store))
	designs.Delete("/:id", deleteDesign(store))

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	log.Printf("Mutfak Planner API → http://localhost:%s", port)
	log.Fatal(app.Listen(":" + port))
}
