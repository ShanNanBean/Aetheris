"""
工具相关API接口
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Optional
from app.core.response import success_response, error_response
from app.services.tool_registry import tool_registry

router = APIRouter()


class ToolExecuteRequest(BaseModel):
    """工具执行请求"""
    params: dict
    cache: bool = True


@router.get("/")
async def get_tools():
    """获取所有工具列表"""
    tools = tool_registry.get_all_tools()
    return success_response(data=tools)


@router.get("/{tool_id}")
async def get_tool(tool_id: str):
    """获取工具详情"""
    tool = tool_registry.get_tool(tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="工具不存在")
    return success_response(data=tool)


@router.post("/{tool_id}/execute")
async def execute_tool(tool_id: str, request: ToolExecuteRequest):
    """执行工具"""
    try:
        result = await tool_registry.execute_tool(
            tool_id=tool_id,
            params=request.params,
            use_cache=request.cache
        )
        return success_response(data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"工具执行失败: {str(e)}")
