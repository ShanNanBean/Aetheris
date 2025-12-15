"""
AI相关API接口
"""
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from app.core.response import success_response, error_response
from app.services.ai_service import ai_service

router = APIRouter()


class ChatRequest(BaseModel):
    """对话请求"""
    message: str
    session_id: Optional[str] = None
    context: Optional[List[dict]] = None
    enable_thinking: bool = False  # 是否启用思考模式


class ChatResponse(BaseModel):
    """对话响应"""
    reply: str
    reasoning_content: Optional[str] = None  # 思考过程
    intent: str
    recommended_tools: Optional[List[dict]] = None
    session_id: str


@router.post("/chat")
async def chat(request: ChatRequest):
    """AI对话接口"""
    result = await ai_service.chat(
        message=request.message,
        session_id=request.session_id,
        context=request.context,
        enable_thinking=request.enable_thinking
    )
    return success_response(data=result)


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """流式AI对话接口 (SSE)"""
    
    async def event_generator():
        async for chunk in ai_service.chat_stream(
            message=request.message,
            session_id=request.session_id,
            context=request.context,
            enable_thinking=request.enable_thinking
        ):
            # 格式化为 SSE 格式
            yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # 禁用 Nginx 缓冲
        }
    )


@router.get("/history/{session_id}")
async def get_history(session_id: str):
    """获取对话历史"""
    history = ai_service.get_history(session_id)
    return success_response(data=history)


@router.delete("/history/{session_id}")
async def clear_history(session_id: str):
    """清除对话历史"""
    ai_service.clear_history(session_id)
    return success_response(message="历史记录已清除")


@router.post("/recommend")
async def recommend_tools(request: ChatRequest):
    """工具推荐"""
    # TODO: 根据用户输入推荐工具
    return success_response(data={
        "recommended_tools": []
    })
