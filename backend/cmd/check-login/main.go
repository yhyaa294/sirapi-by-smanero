package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func main() {
	url := "http://localhost:8080/api/v1/auth/login"
	payload := map[string]string{
		"email":    "admin@sirapi.id",
		"password": "admin123",
	}
	data, _ := json.Marshal(payload)

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(data))
	if err != nil {
		fmt.Printf("❌ Connection failed: %v\n", err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("Status: %s\n", resp.Status)
	fmt.Printf("Body: %s\n", string(body))

	if resp.StatusCode == 200 {
		fmt.Println("✅ Login successful!")
	} else {
		fmt.Println("❌ Login failed (Backend rejected credentials)")
	}
}
