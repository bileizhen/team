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

        // 获取并渲染 HTML 片段
        const viewport = document.getElementById('app-viewport');
        try {
            const response = await fetch(`views/${viewName}.html`);
            const html = await response.text();
            viewport.innerHTML = html;
        } catch (err) {
            viewport.innerHTML = `<div class="text-red-500 p-8">Error loading module: ${err}</div>`;
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

        // 2. 显示思考状态
        const indicator = document.getElementById('thinking-indicator');
        if(indicator) indicator.classList.remove('hidden');

        try {
            // 3. 调用后端 API
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: this.chatHistory 
                })
            });

            const data = await res.json();
            
            if(indicator) indicator.classList.add('hidden');

            if (data.choices && data.choices[0]) {
                const reply = data.choices[0].message.content;
                this.appendMessage('norn', reply);
                this.chatHistory.push({ role: 'assistant', content: reply });
            } else {
                this.appendMessage('norn', 'Error: Neural Link Broken.');
            }

        } catch (err) {
            if(indicator) indicator.classList.add('hidden');
            this.appendMessage('norn', `System Failure: ${err.message}`);
        } finally {
            input.disabled = false;
            input.focus();
        }
    },

    appendMessage(role, text) {
        const container = document.getElementById('chat-container');
        if (!container) return;

        const div = document.createElement('div');
        div.className = `flex gap-4 msg-enter mb-6 ${role === 'user' ? 'flex-row-reverse' : ''}`;
        
        if (role === 'user') {
            div.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 shrink-0 overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=User&background=333&color=fff" class="w-full h-full">
                </div>
                <div class="max-w-[80%]">
                    <div class="glass-panel bg-white/5 p-3 rounded-xl rounded-tr-none text-sm text-zinc-200">
                        ${text}
                    </div>
                </div>
            `;
            container.appendChild(div);
        } else {
            // 诺玛消息
            div.innerHTML = `
                <div class="w-10 h-10 rounded bg-red-900/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <i class="ri-eye-line text-red-500"></i>
                </div>
                <div class="max-w-[85%]">
                    <div class="text-[10px] text-red-500/50 font-mono mb-1">NORN // GLM-4.1V</div>
                    <div class="glass-panel p-4 rounded-xl rounded-tl-none text-sm text-zinc-200 font-mono border-red-900/30 type-target">
                        <!-- Content will be typed here -->
                    </div>
                </div>
            `;
            container.appendChild(div);
            // 触发打字机特效
            const target = div.querySelector('.type-target');
            this.typeWriter(target, text);
        }
        
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    },

    typeWriter(element, text, index = 0) {
        if (index < text.length) {
            // 处理换行符
            const char = text.charAt(index);
            element.innerHTML = text.substring(0, index + 1).replace(/\n/g, '<br>') + '<span class="cursor-blink"></span>';
            
            // 滚动到底部
            const container = document.getElementById('chat-container');
            if(index % 5 === 0) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });

            setTimeout(() => this.typeWriter(element, text, index + 1), 15); // 打字速度
        } else {
            element.innerHTML = text.replace(/\n/g, '<br>'); // 移除光标
        }
    }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => App.init());