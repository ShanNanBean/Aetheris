# Aetheris 测试指南

## 快速测试流程

### 1. 后端测试（已完成）

#### 1.1 启动后端服务
```bash
cd backend
python -m app.main
```

预期输出：
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

#### 1.2 测试健康检查API
```bash
curl http://127.0.0.1:8000/api/system/health
```

预期响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "healthy",
    "cache": {
      "total_keys": 0,
      "expired_keys": 0
    }
  },
  "timestamp": 1763448193
}
```

#### 1.3 测试导航树API
```bash
curl http://127.0.0.1:8000/api/system/navigation
```

预期响应：包含AI助手、文本处理、数据处理等分类

#### 1.4 测试工具列表API
```bash
curl http://127.0.0.1:8000/api/tools/
```

预期响应：返回所有注册的工具列表

#### 1.5 测试JSON格式化工具
```bash
curl -X POST http://127.0.0.1:8000/api/tools/json_formatter/execute \
  -H "Content-Type: application/json" \
  -d "{\"params\": {\"input\": \"{\\\"name\\\":\\\"test\\\",\\\"age\\\":25}\", \"indent\": 2}}"
```

预期响应：返回格式化和压缩后的JSON

### 2. 前端测试

#### 2.1 安装前端依赖
```bash
cd frontend
npm install
```

#### 2.2 启动前端开发服务器
```bash
npm run dev
```

预期输出：
```
VITE v5.0.0  ready in xxx ms
➜  Local:   http://localhost:3000/
```

#### 2.3 浏览器访问测试

1. **主页测试**
   - 访问：http://localhost:3000
   - 验证：AI对话界面正常显示
   - 测试：发送消息，收到AI回复

2. **JSON格式化工具测试**
   - 点击左侧导航：文本处理 > JSON格式化
   - 输入JSON：`{"name":"test","age":25}`
   - 点击"格式化"按钮
   - 验证：显示格式化和压缩结果
   - 测试：复制功能正常

3. **导航测试**
   - 验证：左侧菜单显示所有工具分类
   - 测试：点击不同工具，页面正常切换
   - 测试：折叠/展开菜单正常

### 3. 集成测试

#### 3.1 前后端联调测试

确保后端和前端都在运行，然后：

1. **AI对话测试**
   - 在首页输入："你好"
   - 验证：收到AI助手的回复
   - 测试：清除历史记录功能

2. **工具执行测试**
   - 访问JSON格式化工具
   - 输入有效JSON
   - 验证：后端处理成功，前端显示结果
   - 输入无效JSON
   - 验证：显示错误提示

3. **缓存测试**
   - 执行相同的JSON格式化操作两次
   - 验证：第二次响应更快（使用缓存）

## 测试用例

### JSON格式化工具测试用例

| 测试项 | 输入 | 预期输出 |
|--------|------|----------|
| 有效JSON | `{"a":1,"b":2}` | 成功格式化和压缩 |
| 无效JSON | `{a:1}` | 显示错误信息 |
| 空输入 | 空字符串 | 提示"输入内容不能为空" |
| 嵌套JSON | `{"a":{"b":{"c":1}}}` | 正确格式化多层嵌套 |
| 数组JSON | `[1,2,3]` | 正确格式化数组 |

### 单位转换工具测试用例（后端）

```bash
# 长度转换测试
curl -X POST http://127.0.0.1:8000/api/tools/unit_converter/execute \
  -H "Content-Type: application/json" \
  -d "{\"params\": {\"value\": 100, \"from_unit\": \"厘米\", \"to_unit\": \"米\", \"category\": \"length\"}}"
```

预期：100厘米 = 1米

### 进制转换工具测试用例（后端）

```bash
# 十进制转十六进制
curl -X POST http://127.0.0.1:8000/api/tools/base_converter/execute \
  -H "Content-Type: application/json" \
  -d "{\"params\": {\"value\": \"255\", \"from_base\": 10, \"to_base\": 16}}"
```

预期：255(10) = FF(16)

## 性能测试

### 响应时间测试

使用 curl 的 -w 参数测试响应时间：

```bash
curl -w "@curl-format.txt" -o /dev/null -s http://127.0.0.1:8000/api/system/health
```

curl-format.txt 内容：
```
time_total: %{time_total}s
```

预期：< 0.5秒

### 并发测试

使用 Apache Bench 测试：

```bash
ab -n 100 -c 10 http://127.0.0.1:8000/api/system/health
```

预期：所有请求成功，无错误

## 错误场景测试

### 1. 后端未启动
- 启动前端，访问页面
- 预期：显示网络错误提示

### 2. 无效输入
- JSON格式化工具输入非JSON内容
- 预期：显示格式错误提示

### 3. 网络超时
- 模拟慢速网络
- 预期：显示加载状态，超时后显示错误

## 浏览器兼容性测试

测试浏览器：
- ✅ Chrome (推荐)
- ✅ Edge
- ✅ Firefox
- 🔄 Safari (待测试)

## 移动端测试（可选）

- 浏览器开发者工具切换到移动设备模式
- 验证：基础布局正常显示
- 注：完整响应式支持待实现

## 测试检查清单

### 后端
- [ ] 服务正常启动
- [ ] 健康检查API正常
- [ ] 导航树API正常
- [ ] 工具列表API正常
- [ ] JSON格式化工具正常
- [ ] 单位转换工具正常
- [ ] 进制转换工具正常
- [ ] 缓存功能正常
- [ ] API文档可访问

### 前端
- [ ] 开发服务器正常启动
- [ ] 主页正常显示
- [ ] AI对话界面正常
- [ ] 左侧导航正常
- [ ] 工具页面切换正常
- [ ] JSON格式化页面正常
- [ ] 复制功能正常
- [ ] 错误提示正常
- [ ] Loading状态正常

### 集成
- [ ] 前后端通信正常
- [ ] API调用成功
- [ ] 数据正确显示
- [ ] 错误处理正确
- [ ] 缓存机制有效

## 问题排查

### 常见问题

1. **后端启动失败**
   - 检查Python版本
   - 检查依赖是否安装
   - 查看错误日志

2. **前端无法访问后端**
   - 检查后端是否运行
   - 检查CORS配置
   - 查看浏览器控制台

3. **工具执行失败**
   - 检查输入参数
   - 查看后端日志
   - 验证工具是否注册

## 测试报告模板

```
测试日期：____
测试人员：____
测试环境：____

测试结果：
- 后端测试：通过/失败
- 前端测试：通过/失败
- 集成测试：通过/失败

发现的问题：
1. ____
2. ____

建议：
1. ____
2. ____
```

---

**测试完成后，项目即可投入使用！** 🎉
