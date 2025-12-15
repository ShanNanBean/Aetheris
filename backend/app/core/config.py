"""
应用配置模块
"""
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """应用配置"""
    
    # 基础配置
    PROJECT_NAME: str = "Aetheris"
    VERSION: str = "0.1.0"
    DEBUG: bool = True
    
    # 服务配置
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    API_PREFIX: str = "/api"
    
    # CORS配置
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # 缓存配置
    CACHE_TYPE: str = "memory"  # memory 或 redis
    CACHE_TTL: int = 3600  # 默认缓存时间（秒）
    REDIS_URL: str = "redis://localhost:6379"
    
    # AI配置
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_API_BASE: str = os.getenv("OPENAI_API_BASE", "https://api.openai.com")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    AI_TEMPERATURE: float = 0.7
    AI_MAX_TOKENS: int = 2000
    
    # 日志配置
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# 创建全局配置实例
settings = Settings()
