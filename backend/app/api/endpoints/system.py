"""
系统相关API接口
"""
from fastapi import APIRouter
from app.core.response import success_response
from app.core.cache import cache_manager
from app.services.tool_registry import tool_registry

router = APIRouter()


@router.get("/health")
async def health_check():
    """健康检查"""
    cache_stats = cache_manager.get_stats()
    return success_response(data={
        "status": "healthy",
        "cache": cache_stats
    })


@router.get("/navigation")
async def get_navigation():
    """获取导航树"""
    navigation = tool_registry.get_navigation_tree()
    return success_response(data=navigation)
