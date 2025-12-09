// Cloudflare Pages Functions 入口
// 文件路径: functions/api/chat.js

export async function onRequestPost(context) {
  try {
    // 1. 解析请求体
    let body;
    try {
      body = await context.request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "请求体不是有效的 JSON 格式" }), { status: 400 });
    }
    const { message, history } = body;

    // 2. 检查 API Key
    const apiKey = context.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "API Key 未配置", 
        details: "请在 Cloudflare Pages 后台设置 SILICONFLOW_API_KEY 环境变量，并重新部署。" 
      }), { status: 500 });
    }

    // 3. 诺玛设定
    const systemPrompt = {
      role: 'system',
      content: `你现在是【诺玛(NORN)】，卡塞尔学院的中央人工智能主机。
      设定：
      1. 说话风格冷静、理智、带有机械感。
      2. 称呼用户为“专员”或“S级学员”。
      3. 必须使用 Markdown 格式回复（支持表格、代码块、加粗）。
      4. 世界观基于《龙族》。`
    };

    const fullMessages = [systemPrompt, ...(history || []), { role: 'user', content: message }];

    // 4. 调用硅基流动
    console.log("正在连接 SiliconFlow...");
    
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // 推荐先用 V2.5 跑通，它最稳定
        model: 'deepseek-ai/DeepSeek-V2.5', 
        messages: fullMessages,
        stream: false,
        max_tokens: 2048,
        temperature: 0.7
      })
    });

    // 5. 关键错误捕获：如果上游报错，读取具体内容
    const rawText = await response.text();
    
    if (!response.ok) {
      console.error("Upstream Error:", rawText);
      return new Response(JSON.stringify({ 
        error: `上游 API 报错 (${response.status})`, 
        details: rawText 
      }), { status: 200 }); // 返回 200 是为了让前端能展示错误信息，而不是红框
    }

    // 6. 正常解析
    try {
      const data = JSON.parse(rawText);
      return new Response(JSON.stringify(data), { 
        headers: { 'Content-Type': 'application/json' } 
      });
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "上游响应解析失败", 
        details: rawText.substring(0, 100) 
      }), { status: 200 });
    }

  } catch (err) {
    return new Response(JSON.stringify({ 
      error: "Worker 内部致命错误", 
      details: err.message 
    }), { status: 500 });
  }
}