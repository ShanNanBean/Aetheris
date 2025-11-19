"""
工具注册中心
"""
from typing import Dict, List, Optional, Any, Callable
import logging
from app.core.cache import cache_manager

logger = logging.getLogger(__name__)


class ToolMetadata:
    """工具元数据"""
    
    def __init__(
        self,
        tool_id: str,
        name: str,
        description: str,
        category: str,
        icon: str = "",
        keywords: List[str] = None,
        version: str = "1.0.0"
    ):
        self.tool_id = tool_id
        self.name = name
        self.description = description
        self.category = category
        self.icon = icon
        self.keywords = keywords or []
        self.version = version
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "tool_id": self.tool_id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "icon": self.icon,
            "keywords": self.keywords,
            "version": self.version
        }


class ToolRegistry:
    """工具注册中心"""
    
    def __init__(self):
        self._tools: Dict[str, ToolMetadata] = {}
        self._executors: Dict[str, Callable] = {}
        self._initialize_default_tools()
    
    def _initialize_default_tools(self):
        """初始化默认工具"""
        from app.tools import json_formatter, unit_converter, base_converter
        
        # 注册默认工具
        self.register_tool(
            metadata=ToolMetadata(
                tool_id="ai_chat",
                name="AI助手",
                description="智能对话助手",
                category="AI助手",
                icon="message",
                keywords=["对话", "AI", "助手"]
            ),
            executor=None
        )
        
        # 注册JSON格式化工具
        self.register_tool(
            metadata=ToolMetadata(
                tool_id="json_formatter",
                name="JSON格式化",
                description="格式化、压缩、验证JSON数据",
                category="文本处理",
                icon="file",
                keywords=["JSON", "格式化", "压缩", "验证"]
            ),
            executor=json_formatter.format_json
        )
        
        # 注册单位转换工具
        self.register_tool(
            metadata=ToolMetadata(
                tool_id="unit_converter",
                name="单位转换",
                description="长度、重量、温度等单位转换",
                category="数据处理",
                icon="calculator",
                keywords=["单位", "转换", "长度", "重量", "温度"]
            ),
            executor=unit_converter.convert_unit
        )
        
        # 注册进制转换工具
        self.register_tool(
            metadata=ToolMetadata(
                tool_id="base_converter",
                name="进制转换",
                description="2/8/10/16进制相互转换",
                category="数据处理",
                icon="calculator",
                keywords=["进制", "转换", "二进制", "十六进制"]
            ),
            executor=base_converter.convert_base
        )
        
        logger.info("默认工具已注册")
    
    def register_tool(
        self,
        metadata: ToolMetadata,
        executor: Optional[Callable] = None
    ):
        """注册工具"""
        self._tools[metadata.tool_id] = metadata
        if executor:
            self._executors[metadata.tool_id] = executor
        logger.info(f"工具已注册: {metadata.tool_id} - {metadata.name}")
    
    def get_tool(self, tool_id: str) -> Optional[dict]:
        """获取工具信息"""
        if tool_id in self._tools:
            return self._tools[tool_id].to_dict()
        return None
    
    def get_all_tools(self) -> List[dict]:
        """获取所有工具"""
        return [tool.to_dict() for tool in self._tools.values()]
    
    def get_navigation_tree(self) -> List[dict]:
        """获取导航树"""
        # 按分类组织工具
        categories = {}
        for tool in self._tools.values():
            if tool.category not in categories:
                categories[tool.category] = []
            categories[tool.category].append(tool.to_dict())
        
        # 构建导航树
        navigation = []
        for category, tools in categories.items():
            navigation.append({
                "id": category.lower().replace(" ", "_"),
                "label": category,
                "type": "category",
                "children": [
                    {
                        "id": tool["tool_id"],
                        "label": tool["name"],
                        "type": "tool",
                        "icon": tool["icon"],
                        "component": tool["tool_id"]
                    }
                    for tool in tools
                ]
            })
        
        return navigation
    
    async def execute_tool(
        self,
        tool_id: str,
        params: dict,
        use_cache: bool = True
    ) -> Any:
        """执行工具"""
        if tool_id not in self._tools:
            raise ValueError(f"工具不存在: {tool_id}")
        
        # 检查缓存
        if use_cache:
            cache_key = cache_manager.generate_key(f"tool:{tool_id}", params)
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                logger.info(f"使用缓存结果: {tool_id}")
                return cached_result
        
        # 执行工具
        if tool_id not in self._executors:
            raise ValueError(f"工具未实现: {tool_id}")
        
        executor = self._executors[tool_id]
        result = await executor(params)
        
        # 缓存结果
        if use_cache:
            cache_manager.set(cache_key, result, ttl=3600)
        
        return result


# 创建全局工具注册中心实例
tool_registry = ToolRegistry()
