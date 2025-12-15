"""
条形码/二维码生成器工具
支持生成条形码（Code128, Code39, EAN13等）和二维码（QRCode）
支持将生成的码合成到模板图片上
支持并发处理
"""

import asyncio
import base64
import io
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, List, Dict, Any, Literal
from PIL import Image
import qrcode
from qrcode.constants import ERROR_CORRECT_L, ERROR_CORRECT_M, ERROR_CORRECT_Q, ERROR_CORRECT_H
import barcode
from barcode.writer import ImageWriter

# 线程池用于并发生成
_executor = ThreadPoolExecutor(max_workers=10)


# 错误纠正级别映射
ERROR_CORRECT_MAP = {
    'L': ERROR_CORRECT_L,
    'M': ERROR_CORRECT_M,
    'Q': ERROR_CORRECT_Q,
    'H': ERROR_CORRECT_H
}

# 支持的条形码类型
BARCODE_TYPES = [
    'code128', 'code39', 'ean13', 'ean8', 'upca', 'isbn13', 'isbn10', 'issn', 'pzn'
]


class CodeGeneratorConfig:
    """码生成配置"""
    
    def __init__(
        self,
        content: str,
        code_type: Literal['qrcode', 'barcode'] = 'qrcode',
        barcode_format: str = 'code128',
        # QRCode配置
        qr_version: int = 1,
        qr_error_correct: str = 'M',
        qr_box_size: int = 10,
        qr_border: int = 4,
        qr_fill_color: str = 'black',
        qr_back_color: str = 'white',
        # 条形码配置
        barcode_width: float = 0.4,
        barcode_height: float = 15.0,
        barcode_write_text: bool = True,
        # 输出配置
        output_width: Optional[int] = None,
        output_height: Optional[int] = None,
        # 模板合成配置
        use_template: bool = False,
        template_path: Optional[str] = None,
        template_base64: Optional[str] = None,
        position_x: int = 0,
        position_y: int = 0,
        # 最终输出配置
        output_format: str = 'PNG',
        output_quality: int = 95,
        output_path: Optional[str] = None,
    ):
        self.content = content
        self.code_type = code_type
        self.barcode_format = barcode_format.lower()
        # QRCode
        self.qr_version = qr_version
        self.qr_error_correct = qr_error_correct
        self.qr_box_size = qr_box_size
        self.qr_border = qr_border
        self.qr_fill_color = qr_fill_color
        self.qr_back_color = qr_back_color
        # Barcode
        self.barcode_width = barcode_width
        self.barcode_height = barcode_height
        self.barcode_write_text = barcode_write_text
        # Output
        self.output_width = output_width
        self.output_height = output_height
        # Template
        self.use_template = use_template
        self.template_path = template_path
        self.template_base64 = template_base64
        self.position_x = position_x
        self.position_y = position_y
        # Final output
        self.output_format = output_format.upper()
        self.output_quality = output_quality
        self.output_path = output_path


def generate_qrcode(config: CodeGeneratorConfig) -> Image.Image:
    """生成二维码"""
    qr = qrcode.QRCode(
        version=config.qr_version,
        error_correction=ERROR_CORRECT_MAP.get(config.qr_error_correct, ERROR_CORRECT_M),
        box_size=config.qr_box_size,
        border=config.qr_border,
    )
    qr.add_data(config.content)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color=config.qr_fill_color, back_color=config.qr_back_color)
    img = img.convert('RGBA')
    
    # 调整尺寸
    if config.output_width and config.output_height:
        img = img.resize((config.output_width, config.output_height), Image.Resampling.LANCZOS)
    elif config.output_width:
        ratio = config.output_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((config.output_width, new_height), Image.Resampling.LANCZOS)
    elif config.output_height:
        ratio = config.output_height / img.height
        new_width = int(img.width * ratio)
        img = img.resize((new_width, config.output_height), Image.Resampling.LANCZOS)
    
    return img


def generate_barcode(config: CodeGeneratorConfig) -> Image.Image:
    """生成条形码"""
    barcode_format = config.barcode_format
    if barcode_format not in BARCODE_TYPES:
        barcode_format = 'code128'
    
    barcode_class = barcode.get_barcode_class(barcode_format)
    
    writer = ImageWriter()
    # 设置条形码参数
    writer_options = {
        'module_width': config.barcode_width,
        'module_height': config.barcode_height,
        'write_text': config.barcode_write_text,
        'quiet_zone': 6.5,
    }
    
    # 创建条形码
    bc = barcode_class(config.content, writer=writer)
    
    # 生成图像到内存
    buffer = io.BytesIO()
    bc.write(buffer, options=writer_options)
    buffer.seek(0)
    
    img = Image.open(buffer).convert('RGBA')
    
    # 调整尺寸
    if config.output_width and config.output_height:
        img = img.resize((config.output_width, config.output_height), Image.Resampling.LANCZOS)
    elif config.output_width:
        ratio = config.output_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((config.output_width, new_height), Image.Resampling.LANCZOS)
    elif config.output_height:
        ratio = config.output_height / img.height
        new_width = int(img.width * ratio)
        img = img.resize((new_width, config.output_height), Image.Resampling.LANCZOS)
    
    return img


def merge_with_template(code_img: Image.Image, config: CodeGeneratorConfig) -> Image.Image:
    """将生成的码合成到模板图片上"""
    # 获取模板图片
    if config.template_base64:
        template_data = base64.b64decode(config.template_base64)
        template_img = Image.open(io.BytesIO(template_data)).convert('RGBA')
    elif config.template_path and os.path.exists(config.template_path):
        template_img = Image.open(config.template_path).convert('RGBA')
    else:
        raise ValueError("模板图片未提供或不存在")
    
    # 在指定位置粘贴码图片
    template_img.paste(code_img, (config.position_x, config.position_y), code_img)
    
    return template_img


def save_image(img: Image.Image, config: CodeGeneratorConfig) -> Dict[str, Any]:
    """保存图片并返回结果"""
    result = {
        "width": img.width,
        "height": img.height,
        "format": config.output_format,
        "quality": config.output_quality,
    }
    
    # 转换为适合保存的模式
    if config.output_format == 'JPEG':
        img = img.convert('RGB')
    
    # 保存到文件
    if config.output_path:
        # 确保目录存在
        output_dir = os.path.dirname(config.output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
        
        save_kwargs = {}
        if config.output_format in ['JPEG', 'WEBP']:
            save_kwargs['quality'] = config.output_quality
        if config.output_format == 'PNG':
            # PNG使用压缩级别 (0-9)
            save_kwargs['compress_level'] = min(9, max(0, (100 - config.output_quality) // 10))
        
        img.save(config.output_path, format=config.output_format, **save_kwargs)
        result["saved_path"] = config.output_path
        result["file_size"] = os.path.getsize(config.output_path)
    
    # 生成base64用于预览
    buffer = io.BytesIO()
    save_kwargs = {}
    if config.output_format in ['JPEG', 'WEBP']:
        save_kwargs['quality'] = config.output_quality
    img.save(buffer, format=config.output_format, **save_kwargs)
    buffer.seek(0)
    result["base64"] = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return result


def generate_single_code(config: CodeGeneratorConfig) -> Dict[str, Any]:
    """生成单个条形码/二维码（同步）"""
    try:
        # 生成码
        if config.code_type == 'qrcode':
            code_img = generate_qrcode(config)
        else:
            code_img = generate_barcode(config)
        
        # 如果需要合成模板
        if config.use_template:
            final_img = merge_with_template(code_img, config)
        else:
            final_img = code_img
        
        # 保存并返回结果
        result = save_image(final_img, config)
        result["success"] = True
        result["content"] = config.content
        return result
        
    except Exception as e:
        return {
            "success": False,
            "content": config.content,
            "error": str(e)
        }


async def generate_code(params: Dict[str, Any]) -> Dict[str, Any]:
    """生成条形码/二维码（异步接口）"""
    config = CodeGeneratorConfig(**params)
    
    # 在线程池中执行
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(_executor, generate_single_code, config)
    
    return result


async def generate_codes_batch(params: Dict[str, Any]) -> Dict[str, Any]:
    """批量生成条形码/二维码（支持并发）"""
    items = params.get('items', [])
    common_config = params.get('common_config', {})
    max_concurrent = params.get('max_concurrent', 10)
    
    if not items:
        return {"success": False, "error": "没有提供要生成的内容"}
    
    # 限制并发数
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def process_item(item: Dict[str, Any]) -> Dict[str, Any]:
        async with semaphore:
            # 合并通用配置和单项配置
            config_dict = {**common_config, **item}
            return await generate_code(config_dict)
    
    # 并发处理
    tasks = [process_item(item) for item in items]
    results = await asyncio.gather(*tasks)
    
    # 统计结果
    success_count = sum(1 for r in results if r.get('success'))
    fail_count = len(results) - success_count
    
    return {
        "success": True,
        "total": len(results),
        "success_count": success_count,
        "fail_count": fail_count,
        "results": results
    }


def get_supported_formats() -> Dict[str, List[str]]:
    """获取支持的格式列表"""
    return {
        "barcode_formats": BARCODE_TYPES,
        "qrcode_error_correct": list(ERROR_CORRECT_MAP.keys()),
        "output_formats": ["PNG", "JPEG", "WEBP", "BMP", "GIF"]
    }
