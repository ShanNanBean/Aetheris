"""
统一响应模型
"""
from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime


class ResponseModel(BaseModel):
    """统一响应格式"""
    code: int = 0  # 0表示成功，其他表示错误
    message: str = "success"
    data: Optional[Any] = None
    timestamp: int = int(datetime.now().timestamp())

    class Config:
        json_schema_extra = {
            "example": {
                "code": 0,
                "message": "success",
                "data": {},
                "timestamp": 1234567890
            }
        }


class ErrorResponse(BaseModel):
    """错误响应格式"""
    code: int
    message: str
    error: Optional[str] = None
    timestamp: int = int(datetime.now().timestamp())


def success_response(data: Any = None, message: str = "success") -> ResponseModel:
    """成功响应"""
    return ResponseModel(
        code=0,
        message=message,
        data=data,
        timestamp=int(datetime.now().timestamp())
    )


def error_response(code: int, message: str, error: Optional[str] = None) -> ErrorResponse:
    """错误响应"""
    return ErrorResponse(
        code=code,
        message=message,
        error=error,
        timestamp=int(datetime.now().timestamp())
    )
