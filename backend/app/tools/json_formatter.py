"""
JSON格式化工具
"""
import json
from typing import Dict, Any


async def format_json(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    JSON格式化工具
    
    参数:
        - input: 待格式化的JSON字符串
        - indent: 缩进空格数（默认2）
        - sort_keys: 是否排序键（默认False）
        - ensure_ascii: 是否确保ASCII（默认False）
    """
    try:
        input_text = params.get("input", "")
        indent = params.get("indent", 2)
        sort_keys = params.get("sort_keys", False)
        ensure_ascii = params.get("ensure_ascii", False)
        
        if not input_text:
            return {
                "success": False,
                "error": "输入内容不能为空"
            }
        
        # 解析JSON
        try:
            data = json.loads(input_text)
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"JSON解析错误: {str(e)}"
            }
        
        # 格式化JSON
        formatted = json.dumps(
            data,
            indent=indent,
            sort_keys=sort_keys,
            ensure_ascii=ensure_ascii
        )
        
        # 压缩JSON
        compressed = json.dumps(
            data,
            separators=(',', ':'),
            ensure_ascii=ensure_ascii
        )
        
        return {
            "success": True,
            "formatted": formatted,
            "compressed": compressed,
            "stats": {
                "original_length": len(input_text),
                "formatted_length": len(formatted),
                "compressed_length": len(compressed),
                "keys_count": count_keys(data)
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"处理失败: {str(e)}"
        }


def count_keys(obj: Any) -> int:
    """递归计算JSON对象中的键数量"""
    if isinstance(obj, dict):
        count = len(obj)
        for value in obj.values():
            count += count_keys(value)
        return count
    elif isinstance(obj, list):
        count = 0
        for item in obj:
            count += count_keys(item)
        return count
    return 0


async def validate_json(params: Dict[str, Any]) -> Dict[str, Any]:
    """验证JSON格式"""
    try:
        input_text = params.get("input", "")
        
        if not input_text:
            return {
                "valid": False,
                "error": "输入内容不能为空"
            }
        
        try:
            json.loads(input_text)
            return {
                "valid": True,
                "message": "JSON格式正确"
            }
        except json.JSONDecodeError as e:
            return {
                "valid": False,
                "error": str(e),
                "line": e.lineno,
                "column": e.colno
            }
    except Exception as e:
        return {
            "valid": False,
            "error": f"验证失败: {str(e)}"
        }
