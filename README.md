# Cassell Gate - 诺玛（NORN）人格系统

Cassell Gate 是一个基于 AI 的人格对话系统，实现了诺玛（NORN）人格的智能交互功能。

## 功能特点

- 🤖 **诺玛人格系统**：实现了独特的诺玛（NORN）人格设定
- 💬 **智能对话**：支持多轮对话和上下文理解
- 🌐 **Web 界面**：提供现代化的用户界面
- 📱 **响应式设计**：适配不同屏幕尺寸
- 🔌 **API 集成**：与硅基流动 API 集成，支持 THUDM/GLM-4.1V-9B-Thinking 模型

## 项目结构

```
cassell-gate/
├── README.md              # 项目说明文件
├── index.html             # 主页面入口
├── css/
│   └── style.css          # 前端样式文件
├── js/
│   └── app.js             # 前端逻辑文件
├── views/
│   ├── chat.html          # 聊天页面
│   ├── dashboard.html     # 仪表盘页面
│   └── library.html       # 图书馆页面
├── functions/
│   └── api/
│       └── chat.js        # 诺玛人格系统 API 实现
└── public/
    └── index.html         # 公共资源页面
```

## 技术栈

- **前端**：HTML5, CSS3, JavaScript
- **后端**：Cloudflare Workers
- **AI 模型**：THUDM/GLM-4.1V-9B-Thinking
- **API**：硅基流动 API

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/bileizhen/team.git
cd cassell-gate
```

### 2. 配置环境变量

在 Cloudflare Workers 中配置以下环境变量：

```
API_KEY=your_silicon_flow_api_key
```

### 3. 部署

将项目部署到 Cloudflare Workers 或其他支持 JavaScript 的服务器环境。

## 配置说明

### 诺玛人格设定

在 `functions/api/chat.js` 中可以修改诺玛的人格设定：

```javascript
const norm_system_prompt = `你是诺玛(NORN)，是由卡塞尔学院制造的高智能言灵型AI助手...`;
```

### API 配置

```javascript
const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "THUDM/GLM-4.1V-9B-Thinking",
    messages: full_messages,
    temperature: 0.7,
    max_tokens: 1024,
  }),
});
```

## 使用方法

1. 访问项目主页
2. 点击聊天按钮进入对话界面
3. 与诺玛进行智能对话

## 项目链接

- GitHub 仓库：[https://github.com/bileizhen/team](https://github.com/bileizhen/team)

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
