"""
工具相关API接口
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Any, Optional, List
from app.core.response import success_response, error_response
from app.services.tool_registry import tool_registry
from app.tools import code_generator
import base64

router = APIRouter()


class ToolExecuteRequest(BaseModel):
    """工具执行请求"""
    params: dict
    cache: bool = True


class CodeGenerateRequest(BaseModel):
    """条码生成请求"""
    content: str
    code_type: str = "qrcode"  # qrcode 或 barcode
    barcode_format: str = "code128"
    # QRCode配置
    qr_version: int = 1
    qr_error_correct: str = "M"
    qr_box_size: int = 10
    qr_border: int = 4
    qr_fill_color: str = "black"
    qr_back_color: str = "white"
    # 条形码配置
    barcode_width: float = 0.4
    barcode_height: float = 15.0
    barcode_write_text: bool = True
    # 输出配置
    output_width: Optional[int] = None
    output_height: Optional[int] = None
    # 模板合成配置
    use_template: bool = False
    template_base64: Optional[str] = None
    position_x: int = 0
    position_y: int = 0
    # 最终输出配置
    output_format: str = "PNG"
    output_quality: int = 95
    output_path: Optional[str] = None


class BatchCodeGenerateRequest(BaseModel):
    """批量条码生成请求"""
    items: List[dict]
    common_config: dict = {}
    max_concurrent: int = 10


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


# ============ 条形码/二维码生成器专用接口 ============

@router.get("/code_generator/formats")
async def get_code_formats():
    """获取支持的条码/二维码格式"""
    formats = code_generator.get_supported_formats()
    return success_response(data=formats)


@router.post("/code_generator/generate")
async def generate_code(request: CodeGenerateRequest):
    """生成单个条码/二维码"""
    try:
        params = request.model_dump()
        result = await code_generator.generate_code(params)
        if result.get("success"):
            return success_response(data=result)
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "生成失败"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成失败: {str(e)}")


@router.post("/code_generator/generate_batch")
async def generate_codes_batch(request: BatchCodeGenerateRequest):
    """批量生成条码/二维码（支持并发）"""
    try:
        params = request.model_dump()
        result = await code_generator.generate_codes_batch(params)
        return success_response(data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"批量生成失败: {str(e)}")


@router.post("/code_generator/generate_with_template")
async def generate_code_with_template(
    content: str = Form(...),
    code_type: str = Form("qrcode"),
    barcode_format: str = Form("code128"),
    position_x: int = Form(0),
    position_y: int = Form(0),
    output_width: Optional[int] = Form(None),
    output_height: Optional[int] = Form(None),
    output_format: str = Form("PNG"),
    output_quality: int = Form(95),
    output_path: Optional[str] = Form(None),
    qr_box_size: int = Form(10),
    qr_border: int = Form(4),
    barcode_width: float = Form(0.4),
    barcode_height: float = Form(15.0),
    template: UploadFile = File(...)
):
    """生成条码/二维码并合成到模板图片（支持文件上传）"""
    try:
        # 读取模板图片
        template_content = await template.read()
        template_base64 = base64.b64encode(template_content).decode('utf-8')
        
        params = {
            "content": content,
            "code_type": code_type,
            "barcode_format": barcode_format,
            "use_template": True,
            "template_base64": template_base64,
            "position_x": position_x,
            "position_y": position_y,
            "output_width": output_width,
            "output_height": output_height,
            "output_format": output_format,
            "output_quality": output_quality,
            "output_path": output_path,
            "qr_box_size": qr_box_size,
            "qr_border": qr_border,
            "barcode_width": barcode_width,
            "barcode_height": barcode_height,
        }
        
        result = await code_generator.generate_code(params)
        if result.get("success"):
            return success_response(data=result)
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "生成失败"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成失败: {str(e)}")
