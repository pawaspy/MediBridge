package util

import "github.com/spf13/viper"

type Config struct {
	DBSource string `mapstructure:"DB_SOURCE"`
	Environment string `mapstructure:"ENVIRONMENT"`
	HTTPAddress string `mapstructure:"HTTP_ADDRESS"`
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
	return
}