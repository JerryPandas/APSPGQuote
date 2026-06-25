from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    SECRET_KEY: str = "a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 1

    class Config:
        env_file = ".env"


settings = Settings()
