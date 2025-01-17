addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const html = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API工具</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            padding: 20px;
            overflow-x: hidden;
        }
        h1 {
            color: #007BFF;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .input-group {
            margin-bottom: 15px;
        }
        .input-group label {
            display: block;
            margin-bottom: 5px;
        }
        .input-group input, .input-group select {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .btn-group {
            text-align: center;
        }
        .btn {
            background-color: #007BFF;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .output {
            margin-top: 20px;
            padding: 10px;
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow-wrap: break-word;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0, 0, 0, 0.4);
        }
        .modal-content {
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 400px;
            border-radius: 8px;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
        .checkbox-group {
            margin-top: 15px;
        }
        .checkbox-group label {
            display: inline;
            margin-left: 5px;
        }
    </style>
</head>
<body>
<div class="container">
    <h1>API工具</h1>
    <div class="input-group">
        <label for="api-url">API URL:</label>
        <input type="text" id="api-url" placeholder="请输入API URL (例如：https://api.openai.com)" value="https://api.openai.com">
    </div>
    <div class="input-group">
        <label for="api-key">API Key:</label>
        <input type="text" id="api-key" placeholder="请输入您的API Key">
    </div>
    <div class="input-group">
        <label for="language-select">语言选择:</label>
        <select id="language-select">
            <option value="中文">中文</option>
            <option value="English">English</option>
        </select>
    </div>
    <div class="btn-group">
        <button class="btn" onclick="getBalance()">获取余额</button>
        <button class="btn" onclick="getModels()">获取模型列表</button>
        <button class="btn" id="copy-models-btn" style="display: none;">复制模型列表</button>
        <button class="btn" id="test-model-btn">测试模型</button>
    </div>
    <div class="output" id="output">
        <!-- 输出区域 -->
    </div>
</div>
<!-- 模型名称输入弹窗 -->
<div id="modelModal" class="modal">
    <div class="modal-content">
        <span class="close" id="modal-close">&times;</span>
        <div class="input-group">
            <label for="model-select">选择模型:</label>
            <select id="model-select">
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            </select>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="full-response" name="full-response">
            <label for="full-response">返回完整信息</label>
        </div>
        <div class="btn-group">
            <button class="btn" onclick="confirmTestModel()">提交</button>
        </div>
    </div>
</div>
<script>
    let modelList = []; // 用于存储模型列表

    // 打开弹窗
    document.getElementById('test-model-btn').onclick = function() {
        document.getElementById('modelModal').style.display = 'block';
    }
    // 关闭弹窗
    document.getElementById('modal-close').onclick = function() {
        document.getElementById('modelModal').style.display = 'none';
    }
    window.onclick = function(event) {
        if (event.target == document.getElementById('modelModal')) {
            document.getElementById('modelModal').style.display = 'none';
        }
    }
    function getBalance() {
        const apiUrl = document.getElementById('api-url').value;
        const apiKey = document.getElementById('api-key').value;
        const output = document.getElementById('output');
        if (!apiKey || !apiUrl) {
            alert("请填写API URL和API Key");
            return;
        }
        const headers = new Headers({
            'Authorization': \`Bearer \${apiKey}\`,
            'Content-Type': 'application/json'
        });
        fetch(\`\${apiUrl}/v1/dashboard/billing/subscription\`, { headers })
            .then(response => response.json())
            .then(data => {
                let total = data.hard_limit_usd;
                let startDate = new Date();
                startDate.setDate(startDate.getDate() - 99);
                let endDate = new Date();
                endDate.setDate(endDate.getDate() + 1);
                fetch(\`\${apiUrl}/v1/dashboard/billing/usage?start_date=\${startDate.toISOString().split('T')[0]}&end_date=\${endDate.toISOString().split('T')[0]}\`, { headers })
                    .then(response => response.json())
                    .then(billingData => {
                        let totalUsage = billingData.total_usage / 100;
                        let remaining = total - totalUsage;
                        output.innerHTML = \`<pre>总额: \${total.toFixed(4)} USD\\n已用: \${totalUsage.toFixed(4)} USD\\n剩余: \${remaining.toFixed(4)} USD</pre>\`;
                    })
                    .catch(error => {
                        output.innerHTML = \`<pre>获取账单失败: \${error}</pre>\`;
                    });
            })
            .catch(error => {
                output.innerHTML = \`<pre>获取订阅信息失败: \${error}</pre>\`;
            });
    }
    function getModels() {
        const apiUrl = document.getElementById('api-url').value;
        const apiKey = document.getElementById('api-key').value;
        const output = document.getElementById('output');
        const copyButton = document.getElementById('copy-models-btn');
        if (!apiKey || !apiUrl) {
            alert("请填写API URL和API Key");
            return;
        }
        fetch(\`\${apiUrl}/v1/models\`, {
            headers: {
                'Authorization': \`Bearer \${apiKey}\`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                modelList = data.data.map(model => model.id);
                const models = modelList.join('\\n');
                output.innerHTML = \`<pre>模型列表:\\n\${models}</pre>\`;
                copyButton.style.display = 'inline-block'; // 显示复制按钮
                updateModelSelect(); // 更新模型选择下拉框
            })
            .catch(error => {
                output.innerHTML = \`<pre>获取模型失败: \${error}</pre>\`;
                copyButton.style.display = 'none'; // 隐藏复制按钮
            });
    }
    function updateModelSelect() {
        const modelSelect = document.getElementById('model-select');
        modelSelect.innerHTML = ''; // 清空现有选项
        modelList.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }
    function copyModels() {
        if (modelList.length === 0) {
            alert('没有可复制的模型列表。请先获取模型列表。');
            return;
        }
        const modelString = modelList.join(',');
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = modelString;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand("copy");
            alert('模型列表已复制到剪贴板！');
        } catch (err) {
            console.error('复制失败: ', err);
            alert('复制失败，请手动复制。');
        }
        document.body.removeChild(tempTextArea);
    }
    function confirmTestModel() {
        document.getElementById('modelModal').style.display = 'none';
        const model = document.getElementById('model-select').value;
        testModel(model);
    }
    function testModel(model) {
        const apiUrl = document.getElementById('api-url').value;
        const apiKey = document.getElementById('api-key').value;
        const output = document.getElementById('output');
        const fullResponse = document.getElementById('full-response').checked;
        if (!apiKey || !apiUrl) {
            alert("请填写API URL和API Key");
            return;
        }
        const data = {
            model: model,
            messages: [
                { role: "user", content: "say this is a test!" }
            ]
        };
        fetch(\`\${apiUrl}/v1/chat/completions\`, {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${apiKey}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(responseData => {
                if (fullResponse) {
                    output.innerHTML = \`<pre>完整响应:\\n\${JSON.stringify(responseData, null, 2)}</pre>\`;
                } else {
                    let content = responseData.choices[0].message.content;
                    output.innerHTML = \`<pre>模型回应:\\n\${content}</pre>\`;
                }
            })
            .catch(error => {
                output.innerHTML = \`<pre>请求模型失败: \${error}</pre>\`;
            });
    }

    document.getElementById('copy-models-btn').onclick = copyModels;
</script>
</body>
</html>
  `
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
