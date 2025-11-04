<template>
    <div class="deepseek-chat">
        <!-- 消息历史区域 -->
        <div class="message-history" ref="messageContainer">
            <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
                <div class="avatar">
                    <img v-if="message.role === 'assistant'" src="../deepseek-logo.png" alt="AI" />
                    <span v-else class="user-icon">👤</span>
                </div>
                <div class="content">
                    <div class="role-label">{{ message.role === 'assistant' ? 'DeepSeek AI' : 'You' }}</div>
                    <div v-if="message.thinking" class="thinking">
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
            userInput: '',
            isLoading: false,
            abortController: null
        }
    },
    methods: {
        async sendMessage() {
            if (!this.userInput.trim() || this.isLoading) return;

            // 添加用户消息
            this.messages.push({
                role: 'user',
                content: this.userInput
            });

            // 添加AI思考状态
            this.messages.push({
                role: 'assistant',
                content: '',
                thinking: true
            });

            this.userInput = '';
            this.isLoading = true;
            this.scrollToBottom();

            // 创建可中止的请求
            this.abortController = new AbortController();

            try {
                const response = await this.fetchDeepSeekResponse();
                await this.handleResponse(response);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.handleError(error);
                }
            } finally {
                this.isLoading = false;
                this.abortController = null;
            }
        },
        async fetchDeepSeekResponse() {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: this.messages.filter(m => !m.thinking), // 去掉 thinking 状态
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
        async handleResponse(response) {
            // 找到thinking消息索引
            const index = this.messages.findIndex(m => m.thinking);
            if (index === -1) return;

            let assistantMessage = this.messages[index];
            assistantMessage.content = '';
            assistantMessage.thinking = false;

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
                                assistantMessage.content += deltaContent;
                                // 响应式替换消息
                                this.messages.splice(index, 1, { ...assistantMessage });
                                this.scrollToBottom();
                            }
                        } catch (e) {
                            console.error('解析错误:', e);
                        }
                    }
                }
            }
        },
        handleError(error) {
            console.error('DeepSeek API错误:', error);
            // 移除thinking状态消息
            const index = this.messages.findIndex(m => m.thinking);
            if (index !== -1) this.messages.splice(index, 1);
            this.messages.push({
                role: 'assistant',
                content: `抱歉，请求过程中出现错误: ${error.message}`
            });
        },
        formatMessage(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.messageContainer;
                if (container) container.scrollTop = container.scrollHeight;
            });
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
    margin-bottom: 16px;
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
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.user-icon {
    font-size: 20px;
}

.content {
    flex: 1;
    max-width: calc(100% - 44px);
}

.role-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
}

.text {
    padding: 8px 12px;
    border-radius: 6px;
    line-height: 1.5;
}

.assistant .text {
    background-color: white;
    border: 1px solid #e5e7eb;
}

.user .text {
    background-color: #3b82f6;
    color: white;
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
