"""
JMeter脚本生成器
支持通过用户需求、curl、swagger、json等方式生成JMeter JMX脚本
"""
import json
import re
import uuid
import xml.etree.ElementTree as ET
from xml.dom import minidom
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse, parse_qs
from dataclasses import dataclass, field


# 第三方插件信息
THIRD_PARTY_PLUGINS = {
    "jp@gc - Throughput Shaping Timer": {
        "name": "Throughput Shaping Timer",
        "download_url": "https://jmeter-plugins.org/wiki/ThroughputShapingTimer/",
        "plugin_id": "jpgc-tst",
        "install_cmd": "jmeter-plugins install jpgc-tst"
    },
    "jp@gc - Ultimate Thread Group": {
        "name": "Ultimate Thread Group",
        "download_url": "https://jmeter-plugins.org/wiki/UltimateThreadGroup/",
        "plugin_id": "jpgc-casutg",
        "install_cmd": "jmeter-plugins install jpgc-casutg"
    },
    "jp@gc - Stepping Thread Group": {
        "name": "Stepping Thread Group",
        "download_url": "https://jmeter-plugins.org/wiki/SteppingThreadGroup/",
        "plugin_id": "jpgc-casutg",
        "install_cmd": "jmeter-plugins install jpgc-casutg"
    },
    "jp@gc - Response Times Over Time": {
        "name": "Response Times Over Time",
        "download_url": "https://jmeter-plugins.org/wiki/ResponseTimesOverTime/",
        "plugin_id": "jpgc-graphs-basic",
        "install_cmd": "jmeter-plugins install jpgc-graphs-basic"
    },
    "jp@gc - Transactions per Second": {
        "name": "Transactions per Second",
        "download_url": "https://jmeter-plugins.org/wiki/TransactionsPerSecond/",
        "plugin_id": "jpgc-graphs-basic",
        "install_cmd": "jmeter-plugins install jpgc-graphs-basic"
    },
    "jp@gc - JSON Path Extractor": {
        "name": "JSON Path Extractor",
        "download_url": "https://jmeter-plugins.org/wiki/JSONPathExtractor/",
        "plugin_id": "jpgc-json",
        "install_cmd": "jmeter-plugins install jpgc-json"
    },
    "jp@gc - Random CSV Data Set Config": {
        "name": "Random CSV Data Set Config",
        "download_url": "https://jmeter-plugins.org/wiki/RandomCSVDataSetConfig/",
        "plugin_id": "jpgc-csv",
        "install_cmd": "jmeter-plugins install jpgc-csv"
    },
    "jp@gc - Dummy Sampler": {
        "name": "Dummy Sampler",
        "download_url": "https://jmeter-plugins.org/wiki/DummySampler/",
        "plugin_id": "jpgc-dummy",
        "install_cmd": "jmeter-plugins install jpgc-dummy"
    }
}


@dataclass
class HttpRequest:
    """HTTP请求定义"""
    name: str = "HTTP Request"
    method: str = "GET"
    protocol: str = "https"
    domain: str = ""
    port: str = ""
    path: str = "/"
    content_type: str = ""
    body: str = ""
    headers: Dict[str, str] = field(default_factory=dict)
    params: Dict[str, str] = field(default_factory=dict)
    follow_redirects: bool = True
    use_keepalive: bool = True


@dataclass
class ThreadGroupConfig:
    """线程组配置"""
    name: str = "Thread Group"
    num_threads: int = 10
    ramp_time: int = 5
    loops: int = 1
    scheduler: bool = False
    duration: int = 0
    delay: int = 0
    same_user_on_next_iteration: bool = True


@dataclass
class JMeterConfig:
    """JMeter脚本配置"""
    test_plan_name: str = "Test Plan"
    thread_groups: List[ThreadGroupConfig] = field(default_factory=list)
    requests: List[HttpRequest] = field(default_factory=list)
    # 配置元件
    http_defaults: Optional[Dict] = None
    csv_data_config: Optional[Dict] = None
    user_variables: Dict[str, str] = field(default_factory=dict)
    # 逻辑控制器
    controllers: List[Dict] = field(default_factory=list)
    # 断言
    assertions: List[Dict] = field(default_factory=list)
    # 监听器
    listeners: List[str] = field(default_factory=list)
    # 定时器
    timers: List[Dict] = field(default_factory=list)
    # 前置/后置处理器
    pre_processors: List[Dict] = field(default_factory=list)
    post_processors: List[Dict] = field(default_factory=list)
    # 第三方插件
    third_party_plugins: List[str] = field(default_factory=list)


class JMeterScriptGenerator:
    """JMeter脚本生成器"""
    
    def __init__(self):
        self.used_plugins = []
    
    def generate_test_id(self) -> str:
        """生成测试元素ID"""
        return str(uuid.uuid4().int)[:10]
    
    def parse_curl(self, curl_command: str) -> HttpRequest:
        """解析curl命令"""
        request = HttpRequest()
        
        # 清理curl命令
        curl_command = curl_command.replace('\\\n', ' ').replace('\\', '')
        curl_command = ' '.join(curl_command.split())
        
        # 提取方法
        method_match = re.search(r'-X\s+(\w+)', curl_command, re.IGNORECASE)
        if method_match:
            request.method = method_match.group(1).upper()
        elif '--data' in curl_command or '-d' in curl_command:
            request.method = 'POST'
        
        # 提取URL
        url_match = re.search(r"['\"]?(https?://[^\s'\"]+)['\"]?", curl_command)
        if url_match:
            url = url_match.group(1)
            parsed = urlparse(url)
            request.protocol = parsed.scheme
            request.domain = parsed.hostname or ""
            request.port = str(parsed.port) if parsed.port else ""
            request.path = parsed.path or "/"
            if parsed.query:
                request.params = dict(parse_qs(parsed.query, keep_blank_values=True))
                for k, v in request.params.items():
                    request.params[k] = v[0] if isinstance(v, list) else v
        
        # 提取headers
        header_matches = re.findall(r'-H\s+[\'"]([^:]+):\s*([^"\']+)[\'"]', curl_command)
        for name, value in header_matches:
            request.headers[name.strip()] = value.strip()
            if name.lower() == 'content-type':
                request.content_type = value.strip()
        
        # 提取body
        body_match = re.search(r'(?:--data|-d)\s+[\'"](.+?)[\'"](?:\s|$)', curl_command)
        if body_match:
            request.body = body_match.group(1)
        
        # 设置名称
        if request.path:
            request.name = f"{request.method} {request.path}"
        
        return request
    
    def parse_swagger(self, swagger_data: Dict) -> List[HttpRequest]:
        """解析Swagger/OpenAPI文档"""
        requests = []
        
        # 获取基础信息
        base_path = swagger_data.get('basePath', '')
        host = swagger_data.get('host', '')
        schemes = swagger_data.get('schemes', ['https'])
        
        # OpenAPI 3.0格式
        if 'openapi' in swagger_data:
            servers = swagger_data.get('servers', [])
            if servers:
                parsed = urlparse(servers[0].get('url', ''))
                host = parsed.hostname or host
                base_path = parsed.path or base_path
        
        paths = swagger_data.get('paths', {})
        for path, methods in paths.items():
            for method, details in methods.items():
                if method in ['get', 'post', 'put', 'delete', 'patch', 'options', 'head']:
                    request = HttpRequest()
                    request.method = method.upper()
                    request.domain = host
                    request.path = base_path + path
                    request.protocol = schemes[0] if schemes else 'https'
                    request.name = details.get('summary', f"{method.upper()} {path}")
                    
                    # 解析参数
                    parameters = details.get('parameters', [])
                    for param in parameters:
                        if param.get('in') == 'query':
                            request.params[param['name']] = param.get('example', '${' + param['name'] + '}')
                        elif param.get('in') == 'header':
                            request.headers[param['name']] = param.get('example', '')
                    
                    # 解析请求体
                    request_body = details.get('requestBody', {})
                    if request_body:
                        content = request_body.get('content', {})
                        if 'application/json' in content:
                            request.content_type = 'application/json'
                            schema = content['application/json'].get('schema', {})
                            example = content['application/json'].get('example', {})
                            if example:
                                request.body = json.dumps(example, ensure_ascii=False)
                            elif schema:
                                request.body = json.dumps(self._schema_to_example(schema), ensure_ascii=False)
                    
                    requests.append(request)
        
        return requests
    
    def _schema_to_example(self, schema: Dict) -> Any:
        """将JSON Schema转换为示例数据"""
        if 'example' in schema:
            return schema['example']
        
        schema_type = schema.get('type', 'object')
        
        if schema_type == 'object':
            result = {}
            properties = schema.get('properties', {})
            for prop_name, prop_schema in properties.items():
                result[prop_name] = self._schema_to_example(prop_schema)
            return result
        elif schema_type == 'array':
            items = schema.get('items', {})
            return [self._schema_to_example(items)]
        elif schema_type == 'string':
            return schema.get('example', 'string')
        elif schema_type == 'integer':
            return schema.get('example', 0)
        elif schema_type == 'number':
            return schema.get('example', 0.0)
        elif schema_type == 'boolean':
            return schema.get('example', False)
        
        return None
    
    def parse_json_api(self, api_data: Dict) -> HttpRequest:
        """解析JSON格式的API定义"""
        request = HttpRequest()
        
        request.name = api_data.get('name', 'HTTP Request')
        request.method = api_data.get('method', 'GET').upper()
        
        url = api_data.get('url', '')
        if url:
            parsed = urlparse(url)
            request.protocol = parsed.scheme or 'https'
            request.domain = parsed.hostname or ''
            request.port = str(parsed.port) if parsed.port else ''
            request.path = parsed.path or '/'
        
        request.headers = api_data.get('headers', {})
        request.params = api_data.get('params', {})
        request.body = api_data.get('body', '')
        if isinstance(request.body, dict):
            request.body = json.dumps(request.body, ensure_ascii=False)
        
        request.content_type = request.headers.get('Content-Type', 
                               request.headers.get('content-type', ''))
        
        return request
    
    def _create_string_prop(self, parent: ET.Element, name: str, value: str):
        """创建字符串属性"""
        prop = ET.SubElement(parent, 'stringProp', {'name': name})
        prop.text = value
    
    def _create_bool_prop(self, parent: ET.Element, name: str, value: bool):
        """创建布尔属性"""
        prop = ET.SubElement(parent, 'boolProp', {'name': name})
        prop.text = 'true' if value else 'false'
    
    def _create_int_prop(self, parent: ET.Element, name: str, value: int):
        """创建整数属性"""
        prop = ET.SubElement(parent, 'intProp', {'name': name})
        prop.text = str(value)
    
    def _create_long_prop(self, parent: ET.Element, name: str, value: int):
        """创建长整型属性"""
        prop = ET.SubElement(parent, 'longProp', {'name': name})
        prop.text = str(value)
    
    def _create_element_prop(self, parent: ET.Element, name: str, element_type: str) -> ET.Element:
        """创建元素属性"""
        return ET.SubElement(parent, 'elementProp', {
            'name': name,
            'elementType': element_type
        })
    
    def _add_http_sampler(self, parent: ET.Element, request: HttpRequest):
        """添加HTTP请求取样器"""
        sampler = ET.SubElement(parent, 'HTTPSamplerProxy', {
            'guiclass': 'HttpTestSampleGui',
            'testclass': 'HTTPSamplerProxy',
            'testname': request.name,
            'enabled': 'true'
        })
        
        # 请求参数
        if request.params:
            args_elem = self._create_element_prop(sampler, 'HTTPsampler.Arguments', 'Arguments')
            args_elem.set('guiclass', 'HTTPArgumentsPanel')
            args_elem.set('testclass', 'Arguments')
            args_elem.set('enabled', 'true')
            
            collection = ET.SubElement(args_elem, 'collectionProp', {'name': 'Arguments.arguments'})
            for param_name, param_value in request.params.items():
                arg = ET.SubElement(collection, 'elementProp', {
                    'name': param_name,
                    'elementType': 'HTTPArgument'
                })
                self._create_bool_prop(arg, 'HTTPArgument.always_encode', True)
                self._create_string_prop(arg, 'Argument.name', param_name)
                self._create_string_prop(arg, 'Argument.value', str(param_value))
                self._create_string_prop(arg, 'Argument.metadata', '=')
                self._create_bool_prop(arg, 'HTTPArgument.use_equals', True)
        else:
            args_elem = self._create_element_prop(sampler, 'HTTPsampler.Arguments', 'Arguments')
            args_elem.set('guiclass', 'HTTPArgumentsPanel')
            args_elem.set('testclass', 'Arguments')
            args_elem.set('testname', 'User Defined Variables')
            args_elem.set('enabled', 'true')
            ET.SubElement(args_elem, 'collectionProp', {'name': 'Arguments.arguments'})
        
        self._create_string_prop(sampler, 'HTTPSampler.domain', request.domain)
        self._create_string_prop(sampler, 'HTTPSampler.port', request.port)
        self._create_string_prop(sampler, 'HTTPSampler.protocol', request.protocol)
        self._create_string_prop(sampler, 'HTTPSampler.contentEncoding', 'UTF-8')
        self._create_string_prop(sampler, 'HTTPSampler.path', request.path)
        self._create_string_prop(sampler, 'HTTPSampler.method', request.method)
        self._create_bool_prop(sampler, 'HTTPSampler.follow_redirects', request.follow_redirects)
        self._create_bool_prop(sampler, 'HTTPSampler.auto_redirects', False)
        self._create_bool_prop(sampler, 'HTTPSampler.use_keepalive', request.use_keepalive)
        self._create_bool_prop(sampler, 'HTTPSampler.DO_MULTIPART_POST', False)
        self._create_string_prop(sampler, 'HTTPSampler.embedded_url_re', '')
        self._create_string_prop(sampler, 'HTTPSampler.connect_timeout', '')
        self._create_string_prop(sampler, 'HTTPSampler.response_timeout', '')
        
        # 添加请求体
        if request.body:
            self._create_bool_prop(sampler, 'HTTPSampler.postBodyRaw', True)
            args_elem = sampler.find(".//elementProp[@name='HTTPsampler.Arguments']")
            if args_elem is not None:
                collection = args_elem.find('collectionProp')
                if collection is not None:
                    collection.clear()
                    arg = ET.SubElement(collection, 'elementProp', {
                        'name': '',
                        'elementType': 'HTTPArgument'
                    })
                    self._create_bool_prop(arg, 'HTTPArgument.always_encode', False)
                    self._create_string_prop(arg, 'Argument.value', request.body)
                    self._create_string_prop(arg, 'Argument.metadata', '=')
        
        sampler_hash = ET.SubElement(parent, 'hashTree')
        
        # 添加Header Manager
        if request.headers or request.content_type:
            header_manager = ET.SubElement(sampler_hash, 'HeaderManager', {
                'guiclass': 'HeaderPanel',
                'testclass': 'HeaderManager',
                'testname': 'HTTP Header Manager',
                'enabled': 'true'
            })
            collection = ET.SubElement(header_manager, 'collectionProp', {'name': 'HeaderManager.headers'})
            
            headers = dict(request.headers)
            if request.content_type and 'Content-Type' not in headers:
                headers['Content-Type'] = request.content_type
            
            for header_name, header_value in headers.items():
                header = ET.SubElement(collection, 'elementProp', {
                    'name': '',
                    'elementType': 'Header'
                })
                self._create_string_prop(header, 'Header.name', header_name)
                self._create_string_prop(header, 'Header.value', header_value)
            
            ET.SubElement(sampler_hash, 'hashTree')
    
    def _add_thread_group(self, parent: ET.Element, config: ThreadGroupConfig, requests: List[HttpRequest]):
        """添加线程组"""
        thread_group = ET.SubElement(parent, 'ThreadGroup', {
            'guiclass': 'ThreadGroupGui',
            'testclass': 'ThreadGroup',
            'testname': config.name,
            'enabled': 'true'
        })
        
        self._create_string_prop(thread_group, 'ThreadGroup.on_sample_error', 'continue')
        
        # 循环控制器
        loop_ctrl = self._create_element_prop(thread_group, 'ThreadGroup.main_controller', 'LoopController')
        loop_ctrl.set('guiclass', 'LoopControlPanel')
        loop_ctrl.set('testclass', 'LoopController')
        loop_ctrl.set('testname', 'Loop Controller')
        loop_ctrl.set('enabled', 'true')
        
        self._create_bool_prop(loop_ctrl, 'LoopController.continue_forever', False)
        self._create_string_prop(loop_ctrl, 'LoopController.loops', str(config.loops))
        
        self._create_string_prop(thread_group, 'ThreadGroup.num_threads', str(config.num_threads))
        self._create_string_prop(thread_group, 'ThreadGroup.ramp_time', str(config.ramp_time))
        self._create_bool_prop(thread_group, 'ThreadGroup.scheduler', config.scheduler)
        self._create_string_prop(thread_group, 'ThreadGroup.duration', str(config.duration))
        self._create_string_prop(thread_group, 'ThreadGroup.delay', str(config.delay))
        self._create_bool_prop(thread_group, 'ThreadGroup.same_user_on_next_iteration', config.same_user_on_next_iteration)
        
        thread_hash = ET.SubElement(parent, 'hashTree')
        
        # 添加HTTP请求
        for request in requests:
            self._add_http_sampler(thread_hash, request)
    
    def _add_test_plan(self, root: ET.Element, config: JMeterConfig) -> ET.Element:
        """添加测试计划"""
        test_plan = ET.SubElement(root, 'TestPlan', {
            'guiclass': 'TestPlanGui',
            'testclass': 'TestPlan',
            'testname': config.test_plan_name,
            'enabled': 'true'
        })
        
        self._create_string_prop(test_plan, 'TestPlan.comments', '')
        self._create_bool_prop(test_plan, 'TestPlan.functional_mode', False)
        self._create_bool_prop(test_plan, 'TestPlan.tearDown_on_shutdown', True)
        self._create_bool_prop(test_plan, 'TestPlan.serialize_threadgroups', False)
        
        # 用户定义变量
        args_elem = self._create_element_prop(test_plan, 'TestPlan.user_defined_variables', 'Arguments')
        args_elem.set('guiclass', 'ArgumentsPanel')
        args_elem.set('testclass', 'Arguments')
        args_elem.set('testname', 'User Defined Variables')
        args_elem.set('enabled', 'true')
        
        collection = ET.SubElement(args_elem, 'collectionProp', {'name': 'Arguments.arguments'})
        for var_name, var_value in config.user_variables.items():
            arg = ET.SubElement(collection, 'elementProp', {
                'name': var_name,
                'elementType': 'Argument'
            })
            self._create_string_prop(arg, 'Argument.name', var_name)
            self._create_string_prop(arg, 'Argument.value', var_value)
            self._create_string_prop(arg, 'Argument.metadata', '=')
        
        self._create_string_prop(test_plan, 'TestPlan.user_define_classpath', '')
        
        return test_plan
    
    def _add_http_defaults(self, parent: ET.Element, config: Dict):
        """添加HTTP请求默认值"""
        defaults = ET.SubElement(parent, 'ConfigTestElement', {
            'guiclass': 'HttpDefaultsGui',
            'testclass': 'ConfigTestElement',
            'testname': 'HTTP Request Defaults',
            'enabled': 'true'
        })
        
        args_elem = self._create_element_prop(defaults, 'HTTPsampler.Arguments', 'Arguments')
        args_elem.set('guiclass', 'HTTPArgumentsPanel')
        args_elem.set('testclass', 'Arguments')
        args_elem.set('enabled', 'true')
        ET.SubElement(args_elem, 'collectionProp', {'name': 'Arguments.arguments'})
        
        self._create_string_prop(defaults, 'HTTPSampler.domain', config.get('domain', ''))
        self._create_string_prop(defaults, 'HTTPSampler.port', config.get('port', ''))
        self._create_string_prop(defaults, 'HTTPSampler.protocol', config.get('protocol', 'https'))
        self._create_string_prop(defaults, 'HTTPSampler.contentEncoding', config.get('encoding', 'UTF-8'))
        self._create_string_prop(defaults, 'HTTPSampler.path', config.get('path', ''))
        self._create_string_prop(defaults, 'HTTPSampler.connect_timeout', config.get('connect_timeout', ''))
        self._create_string_prop(defaults, 'HTTPSampler.response_timeout', config.get('response_timeout', ''))
        
        ET.SubElement(parent, 'hashTree')
    
    def _add_csv_data_config(self, parent: ET.Element, config: Dict):
        """添加CSV数据集配置"""
        csv_config = ET.SubElement(parent, 'CSVDataSet', {
            'guiclass': 'TestBeanGUI',
            'testclass': 'CSVDataSet',
            'testname': config.get('name', 'CSV Data Set Config'),
            'enabled': 'true'
        })
        
        self._create_string_prop(csv_config, 'delimiter', config.get('delimiter', ','))
        self._create_string_prop(csv_config, 'fileEncoding', config.get('encoding', 'UTF-8'))
        self._create_string_prop(csv_config, 'filename', config.get('filename', ''))
        self._create_bool_prop(csv_config, 'ignoreFirstLine', config.get('ignore_first_line', False))
        self._create_bool_prop(csv_config, 'quotedData', config.get('quoted_data', False))
        self._create_bool_prop(csv_config, 'recycle', config.get('recycle', True))
        self._create_string_prop(csv_config, 'shareMode', config.get('share_mode', 'shareMode.all'))
        self._create_bool_prop(csv_config, 'stopThread', config.get('stop_thread', False))
        self._create_string_prop(csv_config, 'variableNames', config.get('variable_names', ''))
        
        ET.SubElement(parent, 'hashTree')
    
    def _add_constant_timer(self, parent: ET.Element, config: Dict):
        """添加固定定时器"""
        timer = ET.SubElement(parent, 'ConstantTimer', {
            'guiclass': 'ConstantTimerGui',
            'testclass': 'ConstantTimer',
            'testname': config.get('name', 'Constant Timer'),
            'enabled': 'true'
        })
        
        self._create_string_prop(timer, 'ConstantTimer.delay', str(config.get('delay', 300)))
        ET.SubElement(parent, 'hashTree')
    
    def _add_uniform_random_timer(self, parent: ET.Element, config: Dict):
        """添加统一随机定时器"""
        timer = ET.SubElement(parent, 'UniformRandomTimer', {
            'guiclass': 'UniformRandomTimerGui',
            'testclass': 'UniformRandomTimer',
            'testname': config.get('name', 'Uniform Random Timer'),
            'enabled': 'true'
        })
        
        self._create_string_prop(timer, 'ConstantTimer.delay', str(config.get('constant_delay', 0)))
        self._create_string_prop(timer, 'RandomTimer.range', str(config.get('random_delay', 100)))
        ET.SubElement(parent, 'hashTree')
    
    def _add_response_assertion(self, parent: ET.Element, config: Dict):
        """添加响应断言"""
        assertion = ET.SubElement(parent, 'ResponseAssertion', {
            'guiclass': 'AssertionGui',
            'testclass': 'ResponseAssertion',
            'testname': config.get('name', 'Response Assertion'),
            'enabled': 'true'
        })
        
        collection = ET.SubElement(assertion, 'collectionProp', {'name': 'Asserion.test_strings'})
        for pattern in config.get('patterns', []):
            string_prop = ET.SubElement(collection, 'stringProp', {'name': str(uuid.uuid4().int)[:10]})
            string_prop.text = pattern
        
        self._create_string_prop(assertion, 'Assertion.custom_message', config.get('message', ''))
        self._create_string_prop(assertion, 'Assertion.test_field', config.get('test_field', 'Assertion.response_data'))
        self._create_bool_prop(assertion, 'Assertion.assume_success', False)
        self._create_int_prop(assertion, 'Assertion.test_type', config.get('test_type', 2))
        
        ET.SubElement(parent, 'hashTree')
    
    def _add_json_extractor(self, parent: ET.Element, config: Dict):
        """添加JSON提取器"""
        extractor = ET.SubElement(parent, 'JSONPostProcessor', {
            'guiclass': 'JSONPostProcessorGui',
            'testclass': 'JSONPostProcessor',
            'testname': config.get('name', 'JSON Extractor'),
            'enabled': 'true'
        })
        
        self._create_string_prop(extractor, 'JSONPostProcessor.referenceNames', config.get('variable', ''))
        self._create_string_prop(extractor, 'JSONPostProcessor.jsonPathExprs', config.get('json_path', ''))
        self._create_string_prop(extractor, 'JSONPostProcessor.match_numbers', config.get('match_no', '1'))
        self._create_string_prop(extractor, 'JSONPostProcessor.defaultValues', config.get('default', ''))
        
        ET.SubElement(parent, 'hashTree')
    
    def _add_regex_extractor(self, parent: ET.Element, config: Dict):
        """添加正则表达式提取器"""
        extractor = ET.SubElement(parent, 'RegexExtractor', {
            'guiclass': 'RegexExtractorGui',
            'testclass': 'RegexExtractor',
            'testname': config.get('name', 'Regular Expression Extractor'),
            'enabled': 'true'
        })
        
        self._create_string_prop(extractor, 'RegexExtractor.useHeaders', config.get('use_headers', 'false'))
        self._create_string_prop(extractor, 'RegexExtractor.refname', config.get('variable', ''))
        self._create_string_prop(extractor, 'RegexExtractor.regex', config.get('regex', ''))
        self._create_string_prop(extractor, 'RegexExtractor.template', config.get('template', '$1$'))
        self._create_string_prop(extractor, 'RegexExtractor.default', config.get('default', ''))
        self._create_string_prop(extractor, 'RegexExtractor.match_number', config.get('match_no', '1'))
        
        ET.SubElement(parent, 'hashTree')
    
    def _add_view_results_tree(self, parent: ET.Element):
        """添加查看结果树"""
        listener = ET.SubElement(parent, 'ResultCollector', {
            'guiclass': 'ViewResultsFullVisualizer',
            'testclass': 'ResultCollector',
            'testname': 'View Results Tree',
            'enabled': 'true'
        })
        
        self._create_bool_prop(listener, 'ResultCollector.error_logging', False)
        obj_prop = ET.SubElement(listener, 'objProp')
        name_elem = ET.SubElement(obj_prop, 'name')
        name_elem.text = 'saveConfig'
        value_elem = ET.SubElement(obj_prop, 'value', {'class': 'SampleSaveConfiguration'})
        
        for prop_name in ['time', 'latency', 'timestamp', 'success', 'label', 'code', 
                          'message', 'threadName', 'dataType', 'encoding', 'assertions',
                          'subresults', 'responseData', 'samplerData', 'xml', 'fieldNames',
                          'responseHeaders', 'requestHeaders', 'responseDataOnError',
                          'saveAssertionResultsFailureMessage', 'assertionsResultsToSave',
                          'bytes', 'sentBytes', 'url', 'threadCounts', 'idleTime', 'connectTime']:
            prop = ET.SubElement(value_elem, prop_name)
            prop.text = 'true' if prop_name in ['time', 'timestamp', 'success', 'label', 'code'] else 'false'
        
        self._create_string_prop(listener, 'filename', '')
        ET.SubElement(parent, 'hashTree')
    
    def _add_summary_report(self, parent: ET.Element):
        """添加聚合报告"""
        listener = ET.SubElement(parent, 'ResultCollector', {
            'guiclass': 'SummaryReport',
            'testclass': 'ResultCollector',
            'testname': 'Summary Report',
            'enabled': 'true'
        })
        
        self._create_bool_prop(listener, 'ResultCollector.error_logging', False)
        obj_prop = ET.SubElement(listener, 'objProp')
        name_elem = ET.SubElement(obj_prop, 'name')
        name_elem.text = 'saveConfig'
        value_elem = ET.SubElement(obj_prop, 'value', {'class': 'SampleSaveConfiguration'})
        
        self._create_string_prop(listener, 'filename', '')
        ET.SubElement(parent, 'hashTree')
    
    def _add_aggregate_report(self, parent: ET.Element):
        """添加聚合报告"""
        listener = ET.SubElement(parent, 'ResultCollector', {
            'guiclass': 'StatVisualizer',
            'testclass': 'ResultCollector',
            'testname': 'Aggregate Report',
            'enabled': 'true'
        })
        
        self._create_bool_prop(listener, 'ResultCollector.error_logging', False)
        obj_prop = ET.SubElement(listener, 'objProp')
        name_elem = ET.SubElement(obj_prop, 'name')
        name_elem.text = 'saveConfig'
        value_elem = ET.SubElement(obj_prop, 'value', {'class': 'SampleSaveConfiguration'})
        
        self._create_string_prop(listener, 'filename', '')
        ET.SubElement(parent, 'hashTree')
    
    def _add_loop_controller(self, parent: ET.Element, config: Dict, requests: List[HttpRequest]):
        """添加循环控制器"""
        controller = ET.SubElement(parent, 'LoopController', {
            'guiclass': 'LoopControlPanel',
            'testclass': 'LoopController',
            'testname': config.get('name', 'Loop Controller'),
            'enabled': 'true'
        })
        
        self._create_bool_prop(controller, 'LoopController.continue_forever', config.get('forever', False))
        self._create_string_prop(controller, 'LoopController.loops', str(config.get('loops', 1)))
        
        ctrl_hash = ET.SubElement(parent, 'hashTree')
        
        for request in requests:
            self._add_http_sampler(ctrl_hash, request)
    
    def _add_if_controller(self, parent: ET.Element, config: Dict, requests: List[HttpRequest]):
        """添加If控制器"""
        controller = ET.SubElement(parent, 'IfController', {
            'guiclass': 'IfControllerPanel',
            'testclass': 'IfController',
            'testname': config.get('name', 'If Controller'),
            'enabled': 'true'
        })
        
        self._create_string_prop(controller, 'IfController.condition', config.get('condition', ''))
        self._create_bool_prop(controller, 'IfController.evaluateAll', config.get('evaluate_all', False))
        self._create_bool_prop(controller, 'IfController.useExpression', config.get('use_expression', True))
        
        ctrl_hash = ET.SubElement(parent, 'hashTree')
        
        for request in requests:
            self._add_http_sampler(ctrl_hash, request)
    
    def _add_while_controller(self, parent: ET.Element, config: Dict, requests: List[HttpRequest]):
        """添加While控制器"""
        controller = ET.SubElement(parent, 'WhileController', {
            'guiclass': 'WhileControllerGui',
            'testclass': 'WhileController',
            'testname': config.get('name', 'While Controller'),
            'enabled': 'true'
        })
        
        self._create_string_prop(controller, 'WhileController.condition', config.get('condition', ''))
        
        ctrl_hash = ET.SubElement(parent, 'hashTree')
        
        for request in requests:
            self._add_http_sampler(ctrl_hash, request)
    
    def _add_transaction_controller(self, parent: ET.Element, config: Dict, requests: List[HttpRequest]):
        """添加事务控制器"""
        controller = ET.SubElement(parent, 'TransactionController', {
            'guiclass': 'TransactionControllerGui',
            'testclass': 'TransactionController',
            'testname': config.get('name', 'Transaction Controller'),
            'enabled': 'true'
        })
        
        self._create_bool_prop(controller, 'TransactionController.includeTimers', config.get('include_timers', False))
        self._create_bool_prop(controller, 'TransactionController.parent', config.get('generate_parent', False))
        
        ctrl_hash = ET.SubElement(parent, 'hashTree')
        
        for request in requests:
            self._add_http_sampler(ctrl_hash, request)
    
    def _add_foreach_controller(self, parent: ET.Element, config: Dict, requests: List[HttpRequest]):
        """添加ForEach控制器"""
        controller = ET.SubElement(parent, 'ForeachController', {
            'guiclass': 'ForeachControlPanel',
            'testclass': 'ForeachController',
            'testname': config.get('name', 'ForEach Controller'),
            'enabled': 'true'
        })
        
        self._create_string_prop(controller, 'ForeachController.inputVal', config.get('input_variable', ''))
        self._create_string_prop(controller, 'ForeachController.returnVal', config.get('output_variable', ''))
        self._create_bool_prop(controller, 'ForeachController.useSeparator', config.get('use_separator', True))
        self._create_string_prop(controller, 'ForeachController.startIndex', config.get('start_index', ''))
        self._create_string_prop(controller, 'ForeachController.endIndex', config.get('end_index', ''))
        
        ctrl_hash = ET.SubElement(parent, 'hashTree')
        
        for request in requests:
            self._add_http_sampler(ctrl_hash, request)
    
    def generate_jmx(self, config: JMeterConfig) -> str:
        """生成JMX脚本"""
        # 创建根节点
        root = ET.Element('jmeterTestPlan', {
            'version': '1.2',
            'properties': '5.0',
            'jmeter': '5.5'
        })
        
        root_hash = ET.SubElement(root, 'hashTree')
        
        # 添加测试计划
        self._add_test_plan(root_hash, config)
        plan_hash = ET.SubElement(root_hash, 'hashTree')
        
        # 添加HTTP默认配置
        if config.http_defaults:
            self._add_http_defaults(plan_hash, config.http_defaults)
        
        # 添加CSV数据配置
        if config.csv_data_config:
            self._add_csv_data_config(plan_hash, config.csv_data_config)
        
        # 添加线程组
        thread_config = config.thread_groups[0] if config.thread_groups else ThreadGroupConfig()
        self._add_thread_group(plan_hash, thread_config, config.requests)
        
        # 找到线程组的hashTree
        thread_hash = plan_hash.findall('hashTree')[-1]
        
        # 添加定时器
        for timer in config.timers:
            timer_type = timer.get('type', 'constant')
            if timer_type == 'constant':
                self._add_constant_timer(thread_hash, timer)
            elif timer_type == 'uniform_random':
                self._add_uniform_random_timer(thread_hash, timer)
        
        # 添加断言
        for assertion in config.assertions:
            self._add_response_assertion(thread_hash, assertion)
        
        # 添加后置处理器
        for processor in config.post_processors:
            proc_type = processor.get('type', 'json')
            if proc_type == 'json':
                self._add_json_extractor(thread_hash, processor)
            elif proc_type == 'regex':
                self._add_regex_extractor(thread_hash, processor)
        
        # 添加监听器
        listeners = config.listeners or ['view_results_tree', 'summary_report']
        for listener in listeners:
            if listener == 'view_results_tree':
                self._add_view_results_tree(plan_hash)
            elif listener == 'summary_report':
                self._add_summary_report(plan_hash)
            elif listener == 'aggregate_report':
                self._add_aggregate_report(plan_hash)
        
        # 格式化输出
        xml_str = ET.tostring(root, encoding='unicode')
        dom = minidom.parseString(xml_str)
        formatted_xml = dom.toprettyxml(indent='  ', encoding='UTF-8')
        
        # 移除多余空行
        lines = formatted_xml.decode('utf-8').split('\n')
        lines = [line for line in lines if line.strip()]
        
        return '\n'.join(lines)
    
    def check_third_party_plugins(self, config: JMeterConfig) -> List[Dict]:
        """检查并返回需要的第三方插件信息"""
        required_plugins = []
        
        for plugin_name in config.third_party_plugins:
            if plugin_name in THIRD_PARTY_PLUGINS:
                required_plugins.append(THIRD_PARTY_PLUGINS[plugin_name])
        
        return required_plugins


async def generate_jmeter_script(params: Dict[str, Any]) -> Dict[str, Any]:
    """生成JMeter脚本的异步接口"""
    try:
        generator = JMeterScriptGenerator()
        config = JMeterConfig()
        
        # 解析测试计划名称
        config.test_plan_name = params.get('test_plan_name', 'Test Plan')
        
        # 解析线程组配置
        thread_group_params = params.get('thread_group', {})
        thread_config = ThreadGroupConfig(
            name=thread_group_params.get('name', 'Thread Group'),
            num_threads=thread_group_params.get('num_threads', 10),
            ramp_time=thread_group_params.get('ramp_time', 5),
            loops=thread_group_params.get('loops', 1),
            scheduler=thread_group_params.get('scheduler', False),
            duration=thread_group_params.get('duration', 0),
            delay=thread_group_params.get('delay', 0)
        )
        config.thread_groups = [thread_config]
        
        # 解析请求
        requests = []
        
        # 从curl命令解析
        curl_commands = params.get('curl_commands', [])
        for curl in curl_commands:
            if curl.strip():
                requests.append(generator.parse_curl(curl))
        
        # 从swagger解析
        swagger_data = params.get('swagger', None)
        if swagger_data:
            requests.extend(generator.parse_swagger(swagger_data))
        
        # 从json api定义解析
        api_list = params.get('apis', [])
        for api in api_list:
            requests.append(generator.parse_json_api(api))
        
        config.requests = requests
        
        # HTTP默认配置
        http_defaults = params.get('http_defaults', None)
        if http_defaults:
            config.http_defaults = http_defaults
        
        # CSV配置
        csv_config = params.get('csv_data_config', None)
        if csv_config:
            config.csv_data_config = csv_config
        
        # 用户变量
        config.user_variables = params.get('user_variables', {})
        
        # 定时器
        config.timers = params.get('timers', [])
        
        # 断言
        config.assertions = params.get('assertions', [])
        
        # 后置处理器
        config.post_processors = params.get('post_processors', [])
        
        # 监听器
        config.listeners = params.get('listeners', ['view_results_tree', 'summary_report'])
        
        # 第三方插件
        config.third_party_plugins = params.get('third_party_plugins', [])
        
        # 生成脚本
        jmx_content = generator.generate_jmx(config)
        
        # 检查第三方插件
        required_plugins = generator.check_third_party_plugins(config)
        
        return {
            'success': True,
            'jmx_content': jmx_content,
            'required_plugins': required_plugins,
            'request_count': len(requests)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


async def parse_input(params: Dict[str, Any]) -> Dict[str, Any]:
    """解析输入内容（curl/swagger/json）"""
    try:
        generator = JMeterScriptGenerator()
        input_type = params.get('type', 'curl')
        content = params.get('content', '')
        
        requests = []
        
        if input_type == 'curl':
            if content.strip():
                request = generator.parse_curl(content)
                requests.append({
                    'name': request.name,
                    'method': request.method,
                    'url': f"{request.protocol}://{request.domain}{(':' + request.port) if request.port else ''}{request.path}",
                    'headers': request.headers,
                    'params': request.params,
                    'body': request.body,
                    'content_type': request.content_type
                })
        
        elif input_type == 'swagger':
            swagger_data = json.loads(content) if isinstance(content, str) else content
            parsed_requests = generator.parse_swagger(swagger_data)
            for req in parsed_requests:
                requests.append({
                    'name': req.name,
                    'method': req.method,
                    'url': f"{req.protocol}://{req.domain}{(':' + req.port) if req.port else ''}{req.path}",
                    'headers': req.headers,
                    'params': req.params,
                    'body': req.body,
                    'content_type': req.content_type
                })
        
        elif input_type == 'json':
            api_data = json.loads(content) if isinstance(content, str) else content
            if isinstance(api_data, list):
                for api in api_data:
                    req = generator.parse_json_api(api)
                    requests.append({
                        'name': req.name,
                        'method': req.method,
                        'url': f"{req.protocol}://{req.domain}{(':' + req.port) if req.port else ''}{req.path}",
                        'headers': req.headers,
                        'params': req.params,
                        'body': req.body,
                        'content_type': req.content_type
                    })
            else:
                req = generator.parse_json_api(api_data)
                requests.append({
                    'name': req.name,
                    'method': req.method,
                    'url': f"{req.protocol}://{req.domain}{(':' + req.port) if req.port else ''}{req.path}",
                    'headers': req.headers,
                    'params': req.params,
                    'body': req.body,
                    'content_type': req.content_type
                })
        
        return {
            'success': True,
            'requests': requests
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def get_plugin_info() -> Dict[str, Any]:
    """获取第三方插件信息"""
    return {
        'plugins': list(THIRD_PARTY_PLUGINS.values()),
        'plugins_manager_url': 'https://jmeter-plugins.org/wiki/PluginsManager/'
    }
