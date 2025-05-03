package util

import (
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	DBSource          string        `mapstructure:"DB_SOURCE"`
	Environment       string        `mapstructure:"ENVIRONMENT"`
	HTTPAddress       string        `mapstructure:"HTTP_ADDRESS"`
	TokenSymmetricKey string        `mapstructure:"TOKEN_SYMMETRIC_KEY"`
	TokenDuration     time.Duration `mapstructure:"TOKEN_DURATION"`
	SMTPHost          string        `mapstructure:"SMTP_HOST"`
	SMTPPort          string        `mapstructure:"SMTP_PORT"`
	SMTPUsername      string        `mapstructure:"SMTP_USERNAME"`
	SMTPPassword      string        `mapstructure:"SMTP_PASSWORD"`
	SenderName        string        `mapstructure:"SENDER_NAME"`
	SenderEmail       string        `mapstructure:"SENDER_EMAIL"`
	ExpiryCheckPeriod time.Duration `mapstructure:"EXPIRY_CHECK_PERIOD"`
}

func LoadConfig(path string) (config Config, err error) {
	viper.AddConfigPath(path)
	viper.SetConfigName("app")
	viper.SetConfigType("env")
	viper.AutomaticEnv()

	if err = viper.ReadInConfig(); err != nil {
		return
	}
	err = viper.Unmarshal(&config)

	// Set default values for mail config if not provided
	if config.ExpiryCheckPeriod == 0 {
		config.ExpiryCheckPeriod = 24 * time.Hour
	}

	if config.SenderName == "" {
		config.SenderName = "MediBridge System"
	}

	return
}
