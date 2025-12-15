"""测试条码生成器功能"""
import asyncio
from app.tools.code_generator import generate_code, generate_codes_batch, get_supported_formats

async def test_qrcode():
    """测试二维码生成"""
    print("=== 测试二维码生成 ===")
    result = await generate_code({
        "content": "Hello World!",
        "code_type": "qrcode",
        "qr_box_size": 10,
        "qr_border": 4,
    })
    print(f"成功: {result.get('success')}")
    print(f"尺寸: {result.get('width')} x {result.get('height')}")
    print(f"格式: {result.get('format')}")
    print()

async def test_barcode():
    """测试条形码生成"""
    print("=== 测试条形码生成 ===")
    result = await generate_code({
        "content": "1234567890",
        "code_type": "barcode",
        "barcode_format": "code128",
    })
    print(f"成功: {result.get('success')}")
    print(f"尺寸: {result.get('width')} x {result.get('height')}")
    print(f"格式: {result.get('format')}")
    print()

async def test_batch():
    """测试批量生成"""
    print("=== 测试批量生成 ===")
    result = await generate_codes_batch({
        "items": [
            {"content": "item1"},
            {"content": "item2"},
            {"content": "item3"},
        ],
        "common_config": {
            "code_type": "qrcode",
        },
        "max_concurrent": 3
    })
    print(f"总数: {result.get('total')}")
    print(f"成功: {result.get('success_count')}")
    print(f"失败: {result.get('fail_count')}")
    print()

def test_formats():
    """测试获取支持的格式"""
    print("=== 支持的格式 ===")
    formats = get_supported_formats()
    print(f"条形码格式: {formats['barcode_formats']}")
    print(f"二维码纠错级别: {formats['qrcode_error_correct']}")
    print(f"输出格式: {formats['output_formats']}")
    print()

if __name__ == "__main__":
    test_formats()
    asyncio.run(test_qrcode())
    asyncio.run(test_barcode())
    asyncio.run(test_batch())
    print("所有测试完成!")
