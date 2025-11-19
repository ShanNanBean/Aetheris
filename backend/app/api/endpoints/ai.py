"""
AI相关API接口
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.response import success_response, error_response

router = APIRouter()


class ChatRequest(BaseModel):
    """对话请求"""
    message: str
    session_id: Optional[str] = None
    context: Optional[List[dict]] = None


class ChatResponse(BaseModel):
    """对话响应"""
    reply: str
    intent: str
    recommended_tools: Optional[List[dict]] = None
    session_id: str


@router.post("/chat")
async def chat(request: ChatRequest):
    """AI对话接口"""
    # TODO: 集成AI服务
    # 暂时返回模拟响应
    return success_response(data={
        "reply": "您好！我是Aetheris助手，很高兴为您服务。请问有什么我可以帮助您的？",
        "intent": "chat",
        "recommended_tools": [],
        "session_id": request.session_id or "default"
    })


@router.get("/history/{session_id}")
async def get_history(session_id: str):
    """获取对话历史"""
    # TODO: 从缓存中获取历史记录
    return success_response(data=[])


@router.delete("/history/{session_id}")
async def clear_history(session_id: str):
    """清除对话历史"""
    # TODO: 清除缓存中的历史记录
    return success_response(message="历史记录已清除")


@router.post("/recommend")
async def recommend_tools(request: ChatRequest):
    """工具推荐"""
    # TODO: 根据用户输入推荐工具
    return success_response(data={
        "recommended_tools": []
    })
