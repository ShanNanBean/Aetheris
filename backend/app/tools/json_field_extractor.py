"""
JSON 字段提取工具
支持单字段、嵌套字段、数组索引字段提取，支持多字段同时提取
支持 items[] 语法遍历数组
支持 CSV 和 TXT 格式导出
"""
import json
import re
from typing import Any, List, Dict, Optional, Union
import logging

logger = logging.getLogger(__name__)

# 特殊标记：表示数组遍历
ARRAY_ITERATE = "__ARRAY_ITERATE__"


def parse_field_path(field_path: str) -> List[Union[str, int, str]]:
    """
    解析字段路径，支持点分隔、数组索引和数组遍历
    例如: "user.info.name" -> ["user", "info", "name"]
         "data.list[0].id" -> ["data", "list", 0, "id"]
         "items[2].value" -> ["items", 2, "value"]
         "body.items[].id" -> ["body", "items", ARRAY_ITERATE, "id"]
    """
    parts = []
    # 匹配字段名、数组索引和数组遍历标记
    pattern = r'([a-zA-Z_][a-zA-Z0-9_]*|\[\d+\]|\[\])'
    tokens = re.findall(pattern, field_path)
    
    for token in tokens:
        if token == '[]':
            # 数组遍历标记
            parts.append(ARRAY_ITERATE)
        elif token.startswith('[') and token.endswith(']'):
            # 数组索引
            index = int(token[1:-1])
            parts.append(index)
        else:
            parts.append(token)
    
    return parts


def get_nested_values(data: Any, path_parts: List[Union[str, int, str]]) -> List[Any]:
    """
    根据路径获取嵌套值，支持数组遍历
    返回值列表（因为可能有多个结果）
    """
    if not path_parts:
        return [data]
    
    current_values = [data]
    
    for part in path_parts:
        new_values = []
        
        for current in current_values:
            if current is None:
                new_values.append(None)
                continue
            
            if part == ARRAY_ITERATE:
                # 数组遍历：展开数组中的所有元素
                if isinstance(current, list):
                    new_values.extend(current)
                else:
                    new_values.append(None)
            elif isinstance(part, int):
                # 数组索引
                if isinstance(current, list) and 0 <= part < len(current):
                    new_values.append(current[part])
                else:
                    new_values.append(None)
            else:
                # 字典键
                if isinstance(current, dict) and part in current:
                    new_values.append(current[part])
                else:
                    new_values.append(None)
        
        current_values = new_values
    
    return current_values


def get_nested_value(data: Any, path_parts: List[Union[str, int]]) -> Any:
    """
    根据路径获取单个嵌套值（兼容旧版本）
    """
    current = data
    for part in path_parts:
        if current is None:
            return None
        
        if isinstance(part, int):
            # 数组索引
            if isinstance(current, list) and 0 <= part < len(current):
                current = current[part]
            else:
                return None
        else:
            # 字典键
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return None
    
    return current


def has_array_iterate(field_path: str) -> bool:
    """检查字段路径是否包含数组遍历标记"""
    return '[]' in field_path


def extract_with_array_iterate(data: Any, field_paths: List[str]) -> List[Dict[str, Any]]:
    """
    支持数组遍历的字段提取
    """
    # 检查是否有数组遍历字段
    iterate_fields = [f for f in field_paths if has_array_iterate(f)]
    normal_fields = [f for f in field_paths if not has_array_iterate(f)]
    
    if not iterate_fields:
        # 没有数组遍历，使用普通提取
        return extract_fields(data, field_paths)
    
    # 有数组遍历字段
    results = []
    
    # 获取每个字段的值列表
    field_values = {}
    max_length = 0
    
    for field in field_paths:
        path_parts = parse_field_path(field)
        values = get_nested_values(data, path_parts)
        field_values[field] = values
        max_length = max(max_length, len(values))
    
    # 生成结果行
    for i in range(max_length):
        row = {}
        for field in field_paths:
            values = field_values[field]
            if i < len(values):
                row[field] = values[i]
            else:
                # 如果该字段值不够，重复最后一个或置空
                if not has_array_iterate(field) and values:
                    row[field] = values[0]  # 非遍历字段重复第一个值
                else:
                    row[field] = None
        results.append(row)
    
    return results


def extract_fields_from_item(item: Any, field_paths: List[str]) -> Dict[str, Any]:
    """
    从单个项中提取多个字段
    """
    result = {}
    for field_path in field_paths:
        path_parts = parse_field_path(field_path)
        value = get_nested_value(item, path_parts)
        result[field_path] = value
    return result


def extract_fields(data: Any, field_paths: List[str]) -> List[Dict[str, Any]]:
    """
    从数据中提取字段
    如果数据是数组，则从每个元素提取
    如果数据是对象，则直接提取
    """
    results = []
    
    if isinstance(data, list):
        for item in data:
            result = extract_fields_from_item(item, field_paths)
            results.append(result)
    else:
        result = extract_fields_from_item(data, field_paths)
        results.append(result)
    
    return results


def format_value(value: Any) -> str:
    """
    格式化值为字符串
    """
    if value is None:
        return ""
    elif isinstance(value, bool):
        return "true" if value else "false"
    elif isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    else:
        return str(value)


def to_csv(results: List[Dict[str, Any]], field_paths: List[str]) -> str:
    """
    转换为 CSV 格式（带表头）
    只在值包含逗号或换行时才用引号包裹
    """
    if not results:
        return ""
    
    lines = []
    # 表头
    header = ",".join(field_paths)
    lines.append(header)
    
    # 数据行
    for result in results:
        row_values = []
        for field in field_paths:
            value = format_value(result.get(field))
            # 只在包含逗号、换行或双引号时才用引号包裹
            if ',' in value or '\n' in value or '"' in value:
                escaped = value.replace('"', '""')
                row_values.append(f'"{escaped}"')
            else:
                row_values.append(value)
        lines.append(",".join(row_values))
    
    return "\n".join(lines)


def to_txt(results: List[Dict[str, Any]], field_paths: List[str], separator: str = "\t") -> str:
    """
    转换为 TXT 格式
    单字段：每行一个值
    多字段：使用分隔符分隔
    """
    if not results:
        return ""
    
    lines = []
    
    if len(field_paths) == 1:
        # 单字段，每行一个值
        field = field_paths[0]
        for result in results:
            lines.append(format_value(result.get(field)))
    else:
        # 多字段，使用分隔符
        for result in results:
            row_values = [format_value(result.get(field)) for field in field_paths]
            lines.append(separator.join(row_values))
    
    return "\n".join(lines)


async def extract_json_fields(params: dict) -> dict:
    """
    JSON 字段提取主函数
    
    参数：
        json_input: JSON 字符串
        fields: 字段列表，支持嵌套路径如 "user.name", "data.list[0].id"
        output_format: 输出格式 "csv" 或 "txt"
        txt_separator: TXT 格式的分隔符，默认为制表符
    
    返回：
        success: 是否成功
        results: 提取结果列表
        output: 格式化输出
        stats: 统计信息
        error: 错误信息（如果失败）
    """
    json_input = params.get("json_input", "")
    fields = params.get("fields", [])
    output_format = params.get("output_format", "csv")
    txt_separator = params.get("txt_separator", "\t")
    
    # 验证输入
    if not json_input or not json_input.strip():
        return {
            "success": False,
            "error": "请输入 JSON 内容",
            "results": [],
            "output": "",
            "stats": None
        }
    
    if not fields:
        return {
            "success": False,
            "error": "请指定要提取的字段",
            "results": [],
            "output": "",
            "stats": None
        }
    
    # 确保 fields 是列表
    if isinstance(fields, str):
        fields = [f.strip() for f in fields.split(",") if f.strip()]
    
    try:
        # 解析 JSON
        data = json.loads(json_input)
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": f"JSON 格式错误: {str(e)}",
            "results": [],
            "output": "",
            "stats": None
        }
    
    try:
        # 提取字段（支持数组遍历）
        results = extract_with_array_iterate(data, fields)
        
        # 统计信息
        total_records = len(results)
        fields_found = {}
        fields_missing = {}
        
        for field in fields:
            found_count = sum(1 for r in results if r.get(field) is not None)
            fields_found[field] = found_count
            fields_missing[field] = total_records - found_count
        
        # 格式化输出
        if output_format == "csv":
            output = to_csv(results, fields)
        else:
            output = to_txt(results, fields, txt_separator)
        
        return {
            "success": True,
            "results": results,
            "output": output,
            "output_format": output_format,
            "stats": {
                "total_records": total_records,
                "fields_count": len(fields),
                "fields_found": fields_found,
                "fields_missing": fields_missing
            },
            "error": None
        }
    
    except Exception as e:
        logger.error(f"字段提取失败: {str(e)}")
        return {
            "success": False,
            "error": f"字段提取失败: {str(e)}",
            "results": [],
            "output": "",
            "stats": None
        }
