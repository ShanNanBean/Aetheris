"""
单位转换工具
"""
from typing import Dict, Any, Optional


# 长度单位转换（基准单位：米）
LENGTH_UNITS = {
    "米": 1,
    "千米": 1000,
    "厘米": 0.01,
    "毫米": 0.001,
    "英里": 1609.344,
    "码": 0.9144,
    "英尺": 0.3048,
    "英寸": 0.0254
}

# 重量单位转换（基准单位：千克）
WEIGHT_UNITS = {
    "千克": 1,
    "克": 0.001,
    "毫克": 0.000001,
    "吨": 1000,
    "磅": 0.453592,
    "盎司": 0.0283495
}

# 温度转换需要特殊处理
TEMPERATURE_UNITS = ["摄氏度", "华氏度", "开尔文"]


async def convert_unit(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    单位转换
    
    参数:
        - value: 数值
        - from_unit: 源单位
        - to_unit: 目标单位
        - category: 类别（length/weight/temperature）
    """
    try:
        value = params.get("value")
        from_unit = params.get("from_unit", "")
        to_unit = params.get("to_unit", "")
        category = params.get("category", "length")
        
        if value is None:
            return {
                "success": False,
                "error": "请输入数值"
            }
        
        try:
            value = float(value)
        except (ValueError, TypeError):
            return {
                "success": False,
                "error": "数值格式不正确"
            }
        
        if category == "length":
            result = convert_length(value, from_unit, to_unit)
        elif category == "weight":
            result = convert_weight(value, from_unit, to_unit)
        elif category == "temperature":
            result = convert_temperature(value, from_unit, to_unit)
        else:
            return {
                "success": False,
                "error": f"不支持的类别: {category}"
            }
        
        if result is not None:
            return {
                "success": True,
                "result": result,
                "formula": f"{value} {from_unit} = {result} {to_unit}"
            }
        else:
            return {
                "success": False,
                "error": "转换失败，请检查单位是否正确"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"转换失败: {str(e)}"
        }


def convert_length(value: float, from_unit: str, to_unit: str) -> Optional[float]:
    """长度单位转换"""
    if from_unit not in LENGTH_UNITS or to_unit not in LENGTH_UNITS:
        return None
    
    # 先转换为米，再转换为目标单位
    meters = value * LENGTH_UNITS[from_unit]
    result = meters / LENGTH_UNITS[to_unit]
    return round(result, 6)


def convert_weight(value: float, from_unit: str, to_unit: str) -> Optional[float]:
    """重量单位转换"""
    if from_unit not in WEIGHT_UNITS or to_unit not in WEIGHT_UNITS:
        return None
    
    # 先转换为千克，再转换为目标单位
    kg = value * WEIGHT_UNITS[from_unit]
    result = kg / WEIGHT_UNITS[to_unit]
    return round(result, 6)


def convert_temperature(value: float, from_unit: str, to_unit: str) -> Optional[float]:
    """温度单位转换"""
    if from_unit not in TEMPERATURE_UNITS or to_unit not in TEMPERATURE_UNITS:
        return None
    
    # 先转换为摄氏度
    if from_unit == "华氏度":
        celsius = (value - 32) * 5 / 9
    elif from_unit == "开尔文":
        celsius = value - 273.15
    else:
        celsius = value
    
    # 再转换为目标单位
    if to_unit == "华氏度":
        result = celsius * 9 / 5 + 32
    elif to_unit == "开尔文":
        result = celsius + 273.15
    else:
        result = celsius
    
    return round(result, 2)


async def get_supported_units(params: Dict[str, Any]) -> Dict[str, Any]:
    """获取支持的单位列表"""
    return {
        "length": list(LENGTH_UNITS.keys()),
        "weight": list(WEIGHT_UNITS.keys()),
        "temperature": TEMPERATURE_UNITS
    }
