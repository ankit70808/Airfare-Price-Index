from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    DATABASE_URL: str

    APP_ENV: str = "development"

    SCRAPER_ENABLED: bool = True

    DEFAULT_CURRENCY: str = "INR"

    API_TITLE: str = "Airfare Price Index API"

    API_VERSION: str = "1.0.0"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()