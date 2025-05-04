package util

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

var (
	infoLogger    *log.Logger
	warningLogger *log.Logger
	errorLogger   *log.Logger
	debugLogger   *log.Logger
)

func init() {
	// Create logs directory if it doesn't exist
	err := os.MkdirAll("logs", 0755)
	if err != nil {
		log.Fatalf("Failed to create logs directory: %v", err)
	}

	// Create or open log file
	logFile, err := os.OpenFile(
		filepath.Join("logs", fmt.Sprintf("medibridge_%s.log", time.Now().Format("2006-01-02"))),
		os.O_APPEND|os.O_CREATE|os.O_WRONLY,
		0644,
	)
	if err != nil {
		log.Fatalf("Failed to open log file: %v", err)
	}

	// Initialize loggers
	infoLogger = log.New(logFile, "INFO: ", log.Ldate|log.Ltime)
	warningLogger = log.New(logFile, "WARNING: ", log.Ldate|log.Ltime)
	errorLogger = log.New(logFile, "ERROR: ", log.Ldate|log.Ltime)
	debugLogger = log.New(logFile, "DEBUG: ", log.Ldate|log.Ltime)
}

// LogInfo logs an info message
func LogInfo(format string, v ...interface{}) {
	_, file, line, _ := runtime.Caller(1)
	message := fmt.Sprintf(format, v...)
	infoLogger.Printf("[%s:%d] %s", filepath.Base(file), line, message)
	log.Printf("INFO: [%s:%d] %s", filepath.Base(file), line, message)
}

// LogWarning logs a warning message
func LogWarning(format string, v ...interface{}) {
	_, file, line, _ := runtime.Caller(1)
	message := fmt.Sprintf(format, v...)
	warningLogger.Printf("[%s:%d] %s", filepath.Base(file), line, message)
	log.Printf("WARNING: [%s:%d] %s", filepath.Base(file), line, message)
}

// LogError logs an error message
func LogError(format string, v ...interface{}) {
	_, file, line, _ := runtime.Caller(1)
	message := fmt.Sprintf(format, v...)
	errorLogger.Printf("[%s:%d] %s", filepath.Base(file), line, message)
	log.Printf("ERROR: [%s:%d] %s", filepath.Base(file), line, message)
}

// LogDebug logs a debug message
func LogDebug(format string, v ...interface{}) {
	_, file, line, _ := runtime.Caller(1)
	message := fmt.Sprintf(format, v...)
	debugLogger.Printf("[%s:%d] %s", filepath.Base(file), line, message)
	log.Printf("DEBUG: [%s:%d] %s", filepath.Base(file), line, message)
}
