"""
内存缓存管理模块
"""
from typing import Any, Optional
from datetime import datetime, timedelta
import hashlib
import json
import logging

logger = logging.getLogger(__name__)


class MemoryCache:
    """内存缓存管理器"""
    
    def __init__(self):
        self._cache = {}
        self._expire_times = {}
    
    def get(self, key: str) -> Optional[Any]:
        """获取缓存"""
        if key not in self._cache:
            return None
        
        # 检查是否过期
        if key in self._expire_times:
            if datetime.now() > self._expire_times[key]:
                self.delete(key)
                return None
        
        logger.debug(f"缓存命中: {key}")
        return self._cache[key]
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """设置缓存"""
        self._cache[key] = value
        
        if ttl:
            self._expire_times[key] = datetime.now() + timedelta(seconds=ttl)
        
        logger.debug(f"缓存写入: {key}")
    
    def delete(self, key: str) -> None:
        """删除缓存"""
        if key in self._cache:
            del self._cache[key]
        if key in self._expire_times:
            del self._expire_times[key]
        logger.debug(f"缓存删除: {key}")
    
    def clear_all(self) -> None:
        """清除所有缓存"""
        self._cache.clear()
        self._expire_times.clear()
        logger.info("所有缓存已清除")
    
    def get_stats(self) -> dict:
        """获取缓存统计信息"""
        return {
            "total_keys": len(self._cache),
            "expired_keys": sum(
                1 for key in self._expire_times
                if datetime.now() > self._expire_times[key]
            )
        }


class CacheManager:
    """缓存管理器（支持不同缓存后端）"""
    
    def __init__(self, cache_type: str = "memory"):
        self.cache_type = cache_type
        if cache_type == "memory":
            self._backend = MemoryCache()
        else:
            raise ValueError(f"不支持的缓存类型: {cache_type}")
    
    def generate_key(self, prefix: str, data: Any) -> str:
        """生成缓存键"""
        data_str = json.dumps(data, sort_keys=True, ensure_ascii=False)
        hash_value = hashlib.md5(data_str.encode()).hexdigest()[:8]
        return f"{prefix}:{hash_value}"
    
    def get(self, key: str) -> Optional[Any]:
        """获取缓存"""
        return self._backend.get(key)
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """设置缓存"""
        self._backend.set(key, value, ttl)
    
    def delete(self, key: str) -> None:
        """删除缓存"""
        self._backend.delete(key)
    
    def clear_all(self) -> None:
        """清除所有缓存"""
        self._backend.clear_all()
    
    def get_stats(self) -> dict:
        """获取缓存统计"""
        return self._backend.get_stats()


# 创建全局缓存管理器实例
cache_manager = CacheManager()

