"""
API路由模块
"""
from fastapi import APIRouter

from app.api.endpoints import system, ai, tools

api_router = APIRouter()

# 注册子路由
api_router.include_router(system.router, prefix="/system", tags=["系统"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(tools.router, prefix="/tools", tags=["工具"])
