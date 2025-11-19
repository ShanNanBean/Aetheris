"""
进制转换工具
"""
from typing import Dict, Any


async def convert_base(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    进制转换
    
    参数:
        - value: 数值字符串
        - from_base: 源进制（2/8/10/16）
        - to_base: 目标进制（2/8/10/16）
    """
    try:
        value = params.get("value", "").strip()
        from_base = params.get("from_base", 10)
        to_base = params.get("to_base", 10)
        
        if not value:
            return {
                "success": False,
                "error": "请输入数值"
            }
        
        # 验证进制
        valid_bases = [2, 8, 10, 16]
        if from_base not in valid_bases or to_base not in valid_bases:
            return {
                "success": False,
                "error": "仅支持2、8、10、16进制"
            }
        
        # 转换为10进制
        try:
            decimal_value = int(value, from_base)
        except ValueError:
            return {
                "success": False,
                "error": f"输入值不是有效的{from_base}进制数"
            }
        
        # 从10进制转换为目标进制
        if to_base == 2:
            result = bin(decimal_value)[2:]  # 去掉'0b'前缀
        elif to_base == 8:
            result = oct(decimal_value)[2:]  # 去掉'0o'前缀
        elif to_base == 10:
            result = str(decimal_value)
        elif to_base == 16:
            result = hex(decimal_value)[2:].upper()  # 去掉'0x'前缀，转大写
        else:
            return {
                "success": False,
                "error": "不支持的目标进制"
            }
        
        return {
            "success": True,
            "result": result,
            "decimal_value": decimal_value,
            "formula": f"{value}({from_base}) = {result}({to_base})"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"转换失败: {str(e)}"
        }


async def convert_all_bases(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    转换为所有常用进制
    
    参数:
        - value: 数值字符串
        - from_base: 源进制（2/8/10/16）
    """
    try:
        value = params.get("value", "").strip()
        from_base = params.get("from_base", 10)
        
        if not value:
            return {
                "success": False,
                "error": "请输入数值"
            }
        
        # 转换为10进制
        try:
            decimal_value = int(value, from_base)
        except ValueError:
            return {
                "success": False,
                "error": f"输入值不是有效的{from_base}进制数"
            }
        
        return {
            "success": True,
            "decimal": str(decimal_value),
            "binary": bin(decimal_value)[2:],
            "octal": oct(decimal_value)[2:],
            "hexadecimal": hex(decimal_value)[2:].upper()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"转换失败: {str(e)}"
        }
