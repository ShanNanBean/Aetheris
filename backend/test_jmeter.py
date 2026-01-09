"""测试JMeter脚本生成器"""
import asyncio
from app.tools.jmeter_generator import JMeterScriptGenerator, JMeterConfig, ThreadGroupConfig, HttpRequest, generate_jmeter_script, parse_input

def test_curl_parsing():
    """测试curl解析"""
    generator = JMeterScriptGenerator()
    curl = "curl -X POST 'https://api.example.com/login' -H 'Content-Type: application/json' -d '{\"username\": \"test\", \"password\": \"123456\"}'"
    request = generator.parse_curl(curl)
    print(f'Parsed request: {request.method} {request.domain}{request.path}')
    print(f'Body: {request.body}')
    print(f'Headers: {request.headers}')
    assert request.method == 'POST'
    assert request.domain == 'api.example.com'
    assert request.path == '/login'
    print("✓ curl解析测试通过")

def test_jmx_generation():
    """测试JMX生成"""
    generator = JMeterScriptGenerator()
    
    # 创建请求
    request = HttpRequest(
        name="Login API",
        method="POST",
        protocol="https",
        domain="api.example.com",
        path="/login",
        content_type="application/json",
        body='{"username": "test", "password": "123456"}'
    )
    
    # 创建配置
    config = JMeterConfig()
    config.test_plan_name = 'Performance Test Plan'
    config.thread_groups = [ThreadGroupConfig(name="User Thread Group", num_threads=10, ramp_time=5, loops=1)]
    config.requests = [request]
    config.listeners = ['view_results_tree', 'summary_report']
    
    jmx = generator.generate_jmx(config)
    print('JMX generated successfully!')
    print(f'JMX length: {len(jmx)} chars')
    
    # 验证生成的JMX包含必要元素
    assert 'jmeterTestPlan' in jmx
    assert 'TestPlan' in jmx
    assert 'ThreadGroup' in jmx
    assert 'HTTPSamplerProxy' in jmx
    assert 'Performance Test Plan' in jmx
    print("✓ JMX生成测试通过")
    
    # 保存到文件供预览
    with open('test_output.jmx', 'w', encoding='utf-8') as f:
        f.write(jmx)
    print("✓ JMX文件已保存到 test_output.jmx")

async def test_async_api():
    """测试异步API"""
    # 测试解析
    result = await parse_input({
        'type': 'curl',
        'content': "curl -X GET 'https://api.example.com/users'"
    })
    assert result['success'] == True
    assert len(result['requests']) == 1
    print(f"✓ 异步解析API测试通过: {result['requests'][0]['method']} {result['requests'][0]['url']}")
    
    # 测试生成
    result = await generate_jmeter_script({
        'test_plan_name': 'API Test',
        'thread_group': {
            'num_threads': 5,
            'ramp_time': 3,
            'loops': 2
        },
        'apis': [
            {
                'name': 'Get Users',
                'method': 'GET',
                'url': 'https://api.example.com/users'
            }
        ]
    })
    assert result['success'] == True
    assert result['request_count'] == 1
    print(f"✓ 异步生成API测试通过: {result['request_count']} requests")

if __name__ == '__main__':
    print("=" * 50)
    print("JMeter脚本生成器测试")
    print("=" * 50)
    
    test_curl_parsing()
    print()
    test_jmx_generation()
    print()
    asyncio.run(test_async_api())
    
    print()
    print("=" * 50)
    print("所有测试通过!")
    print("=" * 50)
