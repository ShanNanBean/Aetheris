"""
AI 服务模块
使用 httpx 调用 OpenAI 兼容的 API（支持 DeepSeek、OpenAI 等）
"""
import httpx
import uuid
import json
from typing import List, Dict, Optional, AsyncGenerator
from app.core.config import settings
from app.core.cache import cache_manager
import logging

logger = logging.getLogger(__name__)


class AIService:
    """AI 服务类"""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.api_base = settings.OPENAI_API_BASE.rstrip('/')
        self.model = settings.OPENAI_MODEL
        self.temperature = settings.AI_TEMPERATURE
        self.max_tokens = settings.AI_MAX_TOKENS

        # 系统提示词
        self.system_prompt = """你是 Aetheris 智能助手，一个友好且专业的 AI 助理。

你的职责包括：
1. 回答用户的各种问题，提供准确、有帮助的信息
2. 帮助用户了解和使用平台上的各种工具
3. 提供工具推荐和使用指导
4. 以友好、专业的方式与用户交流

请使用中文回答，保持简洁清晰，必要时使用 markdown 格式美化输出。"""

    async def chat(
        self,
        message: str,
        session_id: Optional[str] = None,
        context: Optional[List[Dict]] = None,
        enable_thinking: bool = False
    ) -> Dict:
        """
        发送对话请求

        Args:
            message: 用户消息
            session_id: 会话 ID
            context: 历史对话上下文
            enable_thinking: 是否启用思考模式

        Returns:
            对话响应
        """
        if not self.api_key:
            return {
                "reply": "AI 服务未配置，请联系管理员设置 API 密钥。",
                "intent": "error",
                "recommended_tools": [],
                "session_id": session_id or str(uuid.uuid4())
            }

        # 生成或使用现有会话 ID
        if not session_id:
            session_id = str(uuid.uuid4())

        # 构建消息列表
        messages = self._build_messages(message, context)

        try:
            # 调用 API
            response = await self._call_api(messages, enable_thinking)

            # 提取回复和思考过程
            choice = response.get("choices", [{}])[0]
            message_data = choice.get("message", {})
            reply = message_data.get("content", "")
            reasoning_content = message_data.get("reasoning_content", "")

            if not reply:
                reply = "抱歉，我暂时无法回答这个问题。请稍后再试。"

            # 保存到历史记录
            self._save_to_history(session_id, message, reply)

            return {
                "reply": reply,
                "reasoning_content": reasoning_content,
                "intent": "chat",
                "recommended_tools": [],
                "session_id": session_id
            }

        except httpx.HTTPStatusError as e:
            logger.error(f"API HTTP error: {e.response.status_code} - {e.response.text}")
            return {
                "reply": f"AI 服务请求失败 (HTTP {e.response.status_code})，请稍后重试。",
                "intent": "error",
                "recommended_tools": [],
                "session_id": session_id
            }
        except httpx.RequestError as e:
            logger.error(f"API request error: {str(e)}")
            return {
                "reply": "网络连接失败，请检查网络后重试。",
                "intent": "error",
                "recommended_tools": [],
                "session_id": session_id
            }
        except Exception as e:
            logger.error(f"AI service error: {str(e)}")
            return {
                "reply": f"服务异常：{str(e)}",
                "intent": "error",
                "recommended_tools": [],
                "session_id": session_id
            }

    def _build_messages(
        self,
        message: str,
        context: Optional[List[Dict]] = None
    ) -> List[Dict]:
        """构建消息列表"""
        messages = [
            {"role": "system", "content": self.system_prompt}
        ]

        # 添加历史上下文
        if context:
            for msg in context:
                role = "assistant" if msg.get("role") == "assistant" else "user"
                content = msg.get("content", "")
                if content:
                    messages.append({"role": role, "content": content})

        # 添加当前消息
        messages.append({"role": "user", "content": message})

        return messages

    async def _call_api(self, messages: List[Dict], enable_thinking: bool = False) -> Dict:
        """调用 OpenAI 兼容 API"""
        url = f"{self.api_base}/v1/chat/completions"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens
        }

        # 启用思考模式（DeepSeek 特性）
        if enable_thinking:
            # 使用 deepseek-reasoner 模型或启用 reasoning
            if "deepseek" in self.model.lower():
                payload["model"] = "deepseek-reasoner"
                # deepseek-reasoner 不支持 temperature，移除它
                payload.pop("temperature", None)

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()

    async def chat_stream(
        self,
        message: str,
        session_id: Optional[str] = None,
        context: Optional[List[Dict]] = None,
        enable_thinking: bool = False
    ) -> AsyncGenerator[Dict, None]:
        """
        流式对话请求，实时返回思考过程和回复内容

        Args:
            message: 用户消息
            session_id: 会话 ID
            context: 历史对话上下文
            enable_thinking: 是否启用思考模式

        Yields:
            流式响应数据
        """
        if not self.api_key:
            yield {
                "type": "error",
                "content": "AI 服务未配置，请联系管理员设置 API 密钥。"
            }
            return

        if not session_id:
            session_id = str(uuid.uuid4())

        messages = self._build_messages(message, context)
        url = f"{self.api_base}/v1/chat/completions"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "stream": True
        }

        # 启用思考模式
        if enable_thinking:
            if "deepseek" in self.model.lower():
                payload["model"] = "deepseek-reasoner"
                payload.pop("temperature", None)

        # 用于收集完整响应
        full_reasoning = ""
        full_content = ""

        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                async with client.stream("POST", url, headers=headers, json=payload) as response:
                    response.raise_for_status()
                    
                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        
                        data_str = line[6:]  # 移除 "data: " 前缀
                        
                        if data_str == "[DONE]":
                            break
                        
                        try:
                            data = json.loads(data_str)
                            delta = data.get("choices", [{}])[0].get("delta", {})
                            
                            # 思考内容 (DeepSeek Reasoner)
                            if "reasoning_content" in delta:
                                reasoning_chunk = delta["reasoning_content"]
                                if reasoning_chunk:
                                    full_reasoning += reasoning_chunk
                                    yield {
                                        "type": "reasoning",
                                        "content": reasoning_chunk,
                                        "session_id": session_id
                                    }
                            
                            # 回复内容
                            if "content" in delta:
                                content_chunk = delta["content"]
                                if content_chunk:
                                    full_content += content_chunk
                                    yield {
                                        "type": "content",
                                        "content": content_chunk,
                                        "session_id": session_id
                                    }
                        
                        except json.JSONDecodeError:
                            continue

            # 保存到历史记录
            if full_content:
                self._save_to_history(session_id, message, full_content)

            # 发送完成信号
            yield {
                "type": "done",
                "session_id": session_id,
                "full_reasoning": full_reasoning,
                "full_content": full_content
            }

        except httpx.HTTPStatusError as e:
            logger.error(f"Stream API HTTP error: {e.response.status_code}")
            yield {
                "type": "error",
                "content": f"AI 服务请求失败 (HTTP {e.response.status_code})"
            }
        except Exception as e:
            logger.error(f"Stream error: {str(e)}")
            yield {
                "type": "error",
                "content": f"服务异常：{str(e)}"
            }

    def _save_to_history(self, session_id: str, user_message: str, ai_reply: str):
        """保存对话到历史记录"""
        cache_key = f"chat_history:{session_id}"
        history = cache_manager.get(cache_key) or []

        history.append({
            "role": "user",
            "content": user_message
        })
        history.append({
            "role": "assistant",
            "content": ai_reply
        })

        # 只保留最近 50 条消息
        if len(history) > 50:
            history = history[-50:]

        cache_manager.set(cache_key, history, ttl=3600 * 24)  # 24 小时过期

    def get_history(self, session_id: str) -> List[Dict]:
        """获取对话历史"""
        cache_key = f"chat_history:{session_id}"
        return cache_manager.get(cache_key) or []

    def clear_history(self, session_id: str) -> bool:
        """清除对话历史"""
        cache_key = f"chat_history:{session_id}"
        cache_manager.delete(cache_key)
        return True


# 创建全局服务实例
ai_service = AIService()
