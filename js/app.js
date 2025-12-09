// 文件路径: js/app.js

const App = {
    chatHistory: [],

    init() {
        this.loadView('dashboard');
        
        // 绑定全局事件
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#send-btn')) this.sendMessage();
        });
        document.body.addEventListener('keypress', (e) => {
            if (e.target.id === 'chat-input' && e.key === 'Enter') this.sendMessage();
        });
    },

    async loadView(viewName) {
        // 更新导航状态
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`nav-${viewName}`);
        if(activeBtn) activeBtn.classList.add('active');

        // 获取并渲染 HTML
        const viewport = document.getElementById('app-viewport');
        try {
            // 注意：这里确保你的 views 文件夹里有对应的 html 文件
            const response = await fetch(`views/${viewName}.html`);
            if(!response.ok) throw new Error("View not found");
            const html = await response.text();
            viewport.innerHTML = html;
        } catch (err) {
            viewport.innerHTML = `<div class="text-red-500 p-8 font-mono">Error loading view: ${err.message}</div>`;
        }
        
        // 如果加载的是聊天页面，恢复历史记录
        if(viewName === 'chat') {
            this.restoreChatUI();
        }
    },

    restoreChatUI() {
        const container = document.getElementById('chat-container');
        if(!container) return;
        // 清空除了欢迎语之外的内容
        // (这里简化处理，直接清空重绘历史，你可以根据需要保留欢迎语DOM)
        if(this.chatHistory.length > 0) {
            container.innerHTML = ''; 
            this.chatHistory.forEach(msg => {
                this.appendMessage(msg.role === 'user' ? 'user' : 'norn', msg.content, false);
            });
        }
    },

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;

        // 1. UI 更新：显示用户消息
        input.value = '';
        input.disabled = true;
        this.appendMessage('user', message);
        this.chatHistory.push({ role: 'user', content: message });

        // 2. 显示 Loading 状态
        const loadingId = this.appendLoading();

        try {
            // 3. 调用后端 API
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: message, // 发送给后端的字段名
                    history: this.chatHistory.slice(-6) // 只带最近6条历史
                })
            });

            const data = await res.json();
            
            // 移除 Loading
            const loadingEl = document.getElementById(loadingId);
            if(loadingEl) loadingEl.remove();

            // 4. 关键：处理响应结果
            if (data.choices && data.choices[0]) {
                // 成功：获取 AI 回复
                const reply = data.choices[0].message.content;
                this.appendMessage('norn', reply);
                this.chatHistory.push({ role: 'assistant', content: reply });
            } else if (data.error) {
                // 失败：显示后端传回的具体错误
                console.error("Backend Error:", data);
                this.appendMessage('norn', `❌ **系统警告 (System Alert)**\n\n错误信息：\`${data.error}\`\n\n详细日志：\`${data.details || '无'}\``);
            } else {
                // 未知情况
                this.appendMessage('norn', '⚠️ **连接异常**：收到空响应，请检查网络或控制台日志。');
                console.log("Raw Data:", data);
            }

        } catch (err) {
            // 网络层面的错误
            const loadingEl = document.getElementById(loadingId);
            if(loadingEl) loadingEl.remove();
            
            this.appendMessage('norn', `⛔ **通讯链路中断**\n\n原因：\`${err.message}\``);
        } finally {
            input.disabled = false;
            input.focus();
        }
    },

    appendLoading() {
        const container = document.getElementById('chat-container');
        if(!container) return;
        const id = 'loading-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = "flex gap-4 mb-6 animate-pulse";
        div.innerHTML = `
            <div class="w-10 h-10 rounded bg-red-900/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <i class="ri-loader-5-line text-red-500 animate-spin"></i>
            </div>
            <div class="flex items-center text-xs text-red-500/70 font-mono">
                ANALYZING DRAGON SCRIPT...
            </div>
        `;
        container.appendChild(div);
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        return id;
    },

// 替换原有的 appendMessage 函数
    appendMessage(role, text) {
        const container = document.getElementById('chat-container');
        if (!container) return;

        const div = document.createElement('div');
        // 添加 fade-in 动画类
        div.className = `flex gap-4 mb-6 ${role === 'user' ? 'flex-row-reverse' : ''} opacity-0 animate-[slideUp_0.5s_ease-out_forwards]`;

        if (role === 'user') {
            // 用户消息
            div.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 shrink-0 overflow-hidden shadow-lg">
                    <img src="https://ui-avatars.com/api/?name=User&background=333&color=fff" class="w-full h-full">
                </div>
                <div class="max-w-[80%]">
                    <div class="glass-panel bg-white/5 p-3 rounded-2xl rounded-tr-none text-sm text-zinc-200 border border-white/5">
                        ${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                    </div>
                </div>
            `;
        } else {
            // 诺玛消息 - 启用高级渲染
            
            // 1. 配置 marked 选项 (确保表格能渲染)
            marked.setOptions({
                gfm: true, // 开启 GitHub 风格 (必须!)
                breaks: true, // 开启换行符转 <br>
                headerIds: false
            });

            // 2. 解析 Markdown
            const htmlContent = marked.parse(text);

            div.innerHTML = `
                <div class="w-10 h-10 rounded-lg bg-red-900/10 border border-red-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                    <i class="ri-eye-line text-red-500 animate-pulse"></i>
                </div>
                <div class="max-w-[90%]">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] text-red-500/70 font-mono tracking-wider">NORN // SYSTEM</span>
                        <span class="w-1 h-1 rounded-full bg-red-500 animate-ping"></span>
                    </div>
                    
                    <!-- 注意：这里应用了我们刚才写的 CSS 类 .markdown-body -->
                    <div class="glass-panel p-5 rounded-2xl rounded-tl-none text-sm text-zinc-200 border-red-900/20 shadow-xl backdrop-blur-xl markdown-body">
                        ${htmlContent}
                    </div>
                </div>
            `;
        }

        container.appendChild(div);
        
        // 代码高亮
        if (role !== 'user') {
            div.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }

        // 平滑滚动到底部
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => App.init());