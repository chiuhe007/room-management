<template>
    <div class="deepseek-chat">
        <!-- 工具栏：会话保存/加载/导出 -->
        <div class="chat-toolbar">
            <div class="left">
                <select v-model="currentConversationId" @change="onSelectConversation">
                    <option value="">新会话</option>
                    <option v-for="conv in savedConversations" :key="conv.id" :value="conv.id">{{ conv.title }} · {{ conv.savedAt }}</option>
                </select>
                <button class="tool-btn" @click="saveConversation" title="保存当前会话">保存</button>
                <button class="tool-btn" @click="exportConversation" title="导出当前会话">导出</button>
                <button class="tool-btn danger" @click="clearConversation" title="清空会话">清空</button>
            </div>
            <div class="right">
                <span class="status">{{ autosaveMessage }}</span>
            </div>
        </div>

        <!-- 消息历史区域 -->
        <div class="message-history" ref="messageContainer">
            <div v-for="(message, index) in messages" :key="message.id || index" class="message" :class="message.role">
                <div class="avatar" aria-hidden>
                    <span v-if="message.role === 'assistant'">🤖</span>
                    <span v-else>🙋</span>
                </div>
                <div class="content">
                    <div class="role-line">
                        <div class="role-label">{{ message.role === 'assistant' ? 'DeepSeek AI' : '您' }}</div>
                        <div class="ts">{{ formatShortDate(message.createdAt) }}</div>
                    </div>

                    <div v-if="message.thinking" class="text thinking">
                        <span class="dot" v-for="n in 3" :key="n"></span>
                    </div>
                    <div v-else class="text" v-html="formatMessage(message.content)"></div>
                </div>
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
            <textarea v-model="userInput" placeholder="输入您的问题..." @keydown.enter.exact.prevent="sendMessage"></textarea>
            <button @click="sendMessage" :disabled="isLoading">
                <span v-if="!isLoading">发送</span>
                <span v-else class="loading-dots">
                    <span class="dot" v-for="n in 3" :key="n"></span>
                </span>
            </button>
        </div>

    </div>
</template>

<script>
export default {
    name: 'DeepSeekChat',
    props: {
        apiKey: {
            type: String,
            default: 'sk-f7c238c5a4d4441aa49691a93554b1e7'
        },
        model: {
            type: String,
            default: 'deepseek-chat' // 可以是 deepseek-chat 或 deepseek-coder
        },
        temperature: {
            type: Number,
            default: 0.7
        },
        maxTokens: {
            type: Number,
            default: 2048
        }
    },
    data() {
        return {
            messages: [],
            savedConversations: [],
            currentConversationId: '',
            autosaveMessage: '',
            userInput: '',
            isLoading: false,
            abortController: null,
            currentThinkingId: null,
            autosaveTimer: null
        }
    },
    mounted() {
        this.loadSavedConversations();
        // 恢复草稿
        try {
            const raw = localStorage.getItem('deepseek_draft');
            if (raw) {
                const draft = JSON.parse(raw);
                if (draft && draft.messages) this.messages = draft.messages;
            }
        } catch (e) {
            console.error('加载草稿失败', e);
        }
    },
    watch: {
        messages: {
            handler() {
                this.scheduleAutosave();
            },
            deep: true
        }
    },
    methods: {
        async sendMessage() {
            if (!this.userInput.trim() || this.isLoading) return;

            // 添加用户消息（带 id 与时间戳）
            const userMsg = { id: 'u_' + Date.now(), role: 'user', content: this.userInput, createdAt: new Date().toISOString() };
            this.messages.push(userMsg);

            // 添加AI思考状态（带 id，便于流式更新时定位）
            const thinkingId = 'a_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
            this.currentThinkingId = thinkingId;
            this.messages.push({ id: thinkingId, role: 'assistant', content: '', thinking: true, createdAt: '' });

            this.userInput = '';
            this.isLoading = true;
            this.scrollToBottom();

            // 创建可中止的请求
            this.abortController = new AbortController();

            try {
                const response = await this.fetchDeepSeekResponse();
                await this.handleResponse(response, thinkingId);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.handleError(error);
                }
            } finally {
                this.isLoading = false;
                this.abortController = null;
                this.scheduleAutosave();
            }
        },
        async fetchDeepSeekResponse() {
            // 仅发送最近若干条消息以避免请求过长（例如最近 20 条）
            const history = this.messages.filter(m => !m.thinking).slice(-20).map(m => ({ role: m.role, content: m.content }));

            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: history,
                    temperature: this.temperature,
                    max_tokens: this.maxTokens,
                    stream: true
                }),
                signal: this.abortController.signal
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            return response;
        },
        async handleResponse(response, thinkingId) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const data = line.replace('data:', '').trim();
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const deltaContent = parsed.choices?.[0]?.delta?.content;
                            if (deltaContent) {
                                // 按 id 查找对应的 thinking 消息并追加
                                const idx = this.messages.findIndex(m => m.id === thinkingId);
                                if (idx !== -1) {
                                    this.messages[idx].content += deltaContent;
                                    this.scrollToBottom();
                                } else {
                                    this.messages.push({ id: thinkingId, role: 'assistant', content: deltaContent, createdAt: new Date().toISOString() });
                                }
                            }
                        } catch (e) {
                            console.error('解析错误:', e);
                        }
                    }
                }
            }

            // 流结束后标记时间戳和 thinking=false
            const finalIdx = this.messages.findIndex(m => m.id === thinkingId);
            if (finalIdx !== -1) {
                this.messages[finalIdx].thinking = false;
                if (!this.messages[finalIdx].createdAt) this.messages[finalIdx].createdAt = new Date().toISOString();
            }
            this.currentThinkingId = null;
        },
        handleError(error) {
            console.error('DeepSeek API错误:', error);
            // 移除对应 thinking 状态消息（优先通过 id）
            const index = this.messages.findIndex(m => m.id === this.currentThinkingId || m.thinking);
            if (index !== -1) this.messages.splice(index, 1);
            this.messages.push({
                id: 'err_' + Date.now(),
                role: 'assistant',
                content: `抱歉，请求过程中出现错误: ${error.message}`,
                createdAt: new Date().toISOString()
            });
            this.currentThinkingId = null;
        },
        formatMessage(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        },
        formatShortDate(iso) {
            if (!iso) return '-';
            const d = new Date(iso);
            if (isNaN(d)) return String(iso);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.messageContainer;
                if (container) container.scrollTop = container.scrollHeight;
            });
        },
        // 本地保存/加载会话相关（轻量）
        loadSavedConversations() {
            try {
                const raw = localStorage.getItem('deepseek_conversations');
                this.savedConversations = raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.error('读取本地会话失败', e);
                this.savedConversations = [];
            }
        },
        persistSavedConversations() {
            try {
                localStorage.setItem('deepseek_conversations', JSON.stringify(this.savedConversations));
            } catch (e) {
                console.error('保存会话失败', e);
            }
        },
        saveConversation() {
            const title = prompt('请输入会话标题（可选）', `会话 ${new Date().toLocaleString()}`) || `会话 ${new Date().toLocaleString()}`;
            const conv = {
                id: 'c_' + Date.now(),
                title,
                messages: JSON.parse(JSON.stringify(this.messages)),
                savedAt: new Date().toLocaleString()
            };
            this.savedConversations.unshift(conv);
            this.persistSavedConversations();
            this.currentConversationId = conv.id;
            this.autosaveMessage = '已保存';
            setTimeout(() => (this.autosaveMessage = ''), 1500);
        },
        exportConversation() {
            const data = { title: `会话_${new Date().toISOString()}`, messages: this.messages };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.title}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        loadConversation(id) {
            if (!id) {
                this.messages = [];
                this.currentConversationId = '';
                return;
            }
            const conv = this.savedConversations.find(c => c.id === id);
            if (conv) {
                this.messages = JSON.parse(JSON.stringify(conv.messages));
                this.currentConversationId = id;
            }
        },
        onSelectConversation(e) {
            this.loadConversation(this.currentConversationId);
        },
        clearConversation() {
            if (confirm('清空当前会话？')) {
                this.messages = [];
                this.currentConversationId = '';
            }
        },
        // 自动保存当前会话为草稿（本地），节流实现
        scheduleAutosave() {
            if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
            this.autosaveTimer = setTimeout(() => {
                try {
                    localStorage.setItem('deepseek_draft', JSON.stringify({ messages: this.messages, updatedAt: new Date().toLocaleString() }));
                    this.autosaveMessage = '已自动保存';
                    setTimeout(() => (this.autosaveMessage = ''), 1200);
                } catch (e) {
                    console.error('自动保存失败', e);
                }
            }, 2000);
        },
        abortRequest() {
            if (this.abortController) {
                this.abortController.abort();
            }
        }
    },
    beforeUnmount() {
        this.abortRequest();
    }
};
</script>

<style scoped>
.deepseek-chat {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 800px;
    margin: 0 auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f9fafb;
}

.message-history {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    max-height: 500px;
}

.message {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 12px;
}

.message.assistant {
    flex-direction: row;
}

.message.user {
    flex-direction: row-reverse;
}

.avatar {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #e6eefc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
}

.content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    max-width: 72%;
}

.role-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.role-label {
    font-size: 12px;
    color: #6b7280;
}

.ts {
    font-size: 11px;
    color: #9ca3af;
}

.text {
    padding: 10px 14px;
    border-radius: 10px;
    line-height: 1.5;
    word-break: break-word;
    box-shadow: 0 1px 0 rgba(16,24,40,0.03);
}

.assistant .text {
    background-color: #ffffff;
    border: 1px solid #e6edf8;
    color: #111827;
}

.user .text {
    background: linear-gradient(180deg,#2563eb,#1e40af);
    color: #ffffff;
    align-self: flex-end;
}

.text code {
    background-color: #f3f4f6;
    padding: 2px 6px;
    border-radius: 6px;
}

code {
    font-family: monospace;
    background-color: #f3f4f6;
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 0.9em;
}

.thinking,
.loading-dots {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #9ca3af;
    animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(2) {
    animation-delay: 0.2s;
}

.dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

.input-area {
    display: flex;
    padding: 12px;
    border-top: 1px solid #e5e7eb;
    background-color: white;
}

.chat-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: linear-gradient(180deg, #ffffff, #f7fbff);
    border-bottom: 1px solid #eef2ff;
}

.chat-toolbar .left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.chat-toolbar select {
    padding: 6px 8px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: white;
}

.tool-btn {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid transparent;
    background: #f3f4f6;
    cursor: pointer;
    font-size: 13px;
}

.tool-btn:hover { background: #eef2ff }
.tool-btn.danger { background: #fee2e2; border-color: #fecaca }

.chat-toolbar .right { font-size: 13px; color: #6b7280 }

textarea {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    resize: none;
    min-height: 44px;
    max-height: 120px;
    outline: none;
    font-family: inherit;
    font-size: 14px;
    transition: border-color 0.2s;
}

textarea:focus {
    border-color: #3b82f6;
}

button {
    margin-left: 8px;
    padding: 0 16px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
    min-width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
}

button:hover {
    background-color: #2563eb;
}

button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
}
</style>
