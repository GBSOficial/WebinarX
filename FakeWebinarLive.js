/**
 * FakeWebinarLive - Componente vanilla JS para simular webinar ao vivo
 * Base ATANAZIO: minimalista, organizado e suave
 */

// Detectar sistema operacional
window.isMacOS = function() {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0 || 
           navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
};

// Função global simplificada para fallback de imagem
window.handleImageError = function(img) {
    console.warn('⚠️ Imagem falhou, usando fallback...');
    img.onerror = null; // Evitar loop
    img.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=1080&fit=crop';
};

class FakeWebinarLive {
    constructor(config = {}) {
        // Detectar macOS
        const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isYouTube = config.videoImageUrl && (config.videoImageUrl.includes('youtube.com') || config.videoImageUrl.includes('youtu.be'));
        
        // FORÇAR thumbnail no macOS + YouTube
        let useRealVideo = config.useRealVideo === true;
        if (isMacOS && isYouTube && useRealVideo) {
            console.warn('🍎 macOS + YouTube: FORÇANDO thumbnail (YouTube não funciona no macOS)');
            useRealVideo = false;
        }
        
        this.config = {
            videoImageUrl: config.videoImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=1080&fit=crop',
            initialViews: config.initialViews || 847,
            viewIncrementMin: config.viewIncrementMin || 1,
            viewIncrementMax: config.viewIncrementMax || 5,
            chatSpeed: config.chatSpeed || 3000,
            messages: config.messages || this.getDefaultMessages(),
            timedMessages: config.timedMessages || [],
            videoTitle: config.videoTitle || '🔴 Webinar Ao Vivo - Estratégias Avançadas para 2025',
            videoDescription: config.videoDescription || 'Aprenda as melhores estratégias e técnicas comprovadas para transformar seu negócio. Conteúdo exclusivo e ao vivo!',
            requireLogin: config.requireLogin !== false,
            useRealVideo: useRealVideo  // Forçado para false no macOS + YouTube
        };

        this.currentViews = this.config.initialViews;
        this.currentMessageIndex = 0;
        this.viewIntervalId = null;
        this.chatIntervalId = null;
        this.timedMessagesIntervalId = null;
        this.videoTimestampIntervalId = null;
        this.videoStartTime = Date.now();
        this.videoCurrentTime = 0;
        this.videoTotalTime = config.videoDuration || 2700; // Duração em SEGUNDOS do dashboard
        console.log(`⏱️ Duração configurada: ${this.videoTotalTime} segundos (${Math.floor(this.videoTotalTime / 60)}:${(this.videoTotalTime % 60).toString().padStart(2, '0')})`);
        this.isLoggedIn = false;
        this.userData = null;
        this.isLiked = false;
        this.likeCount = Math.floor(this.config.initialViews * 0.7);
    }
    
    getRandomVideoDuration() {
        // Duração aleatória entre 30 e 120 minutos (em segundos)
        return Math.floor(Math.random() * (120 - 30 + 1) + 30) * 60;
    }

    getDefaultMessages() {
        return [
            { user: 'Maria Silva', text: 'Olá! Acabei de entrar, estou animada!' },
            { user: 'João Santos', text: 'Esse conteúdo está incrível 🔥' },
            { user: 'Ana Costa', text: 'Alguém consegue me ajudar com uma dúvida?' },
            { user: 'Pedro Lima', text: 'Estou tomando notas de tudo!' },
            { user: 'Carla Mendes', text: 'Primeira vez aqui, muito bom!' },
            { user: 'Lucas Oliveira', text: 'Como faço para aplicar isso no meu negócio?' },
            { user: 'Fernanda Rocha', text: 'Compartilhando com meu time agora mesmo' },
            { user: 'Roberto Alves', text: 'Conteúdo de alto nível 👏' },
            { user: 'Juliana Pereira', text: 'Tem como rever depois?' },
            { user: 'Marcos Souza', text: 'Já salvei nos favoritos!' },
            { user: 'Patrícia Dias', text: 'Isso vai revolucionar meu trabalho' },
            { user: 'Gabriel Martins', text: 'Qual a próxima live?' },
            { user: 'Beatriz Cardoso', text: 'Estou impressionada com esse método' },
            { user: 'Ricardo Ferreira', text: 'Parabéns pelo conteúdo!' },
            { user: 'Amanda Ribeiro', text: 'Finalmente um conteúdo que funciona de verdade' },
            { user: 'Thiago Borges', text: 'Minha equipe toda está assistindo' },
            { user: 'Camila Nunes', text: 'Onde posso encontrar mais informações?' },
            { user: 'Felipe Castro', text: 'Isso é exatamente o que eu precisava!' }
        ];
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container with id "${containerId}" not found`);
            return;
        }

        this.containerId = containerId;
        
        console.log('🎬 FakeWebinarLive.render() iniciado');
        console.log('📦 Config:', this.config);
        console.log('🖼️ VideoImageUrl:', this.config.videoImageUrl);
        
        // Detectar tipo de mídia e gerar HTML apropriado
        const mediaHTML = this.generateMediaHTML();
        console.log('✅ MediaHTML gerado:', mediaHTML.substring(0, 200) + '...');

        container.innerHTML = `
            <div class="fake-webinar">
                <div class="video-section">
                    <div class="video-wrapper">
                        ${mediaHTML}
                        <div class="live-badge">
                            <span class="live-dot"></span>
                            AO VIVO
                        </div>
                        <div class="video-controls">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <div class="video-timestamp" id="video-timestamp-${containerId}">
                                <span class="timestamp-current">0:00</span>
                            </div>
                        </div>
                    </div>
                    <div class="video-info">
                        <div class="video-title">${this.config.videoTitle}</div>
                        <div class="video-meta">
                            <span>👁️ <span class="meta-views">${this.formatNumber(this.currentViews)}</span> visualizações</span>
                            <span>•</span>
                            <span>Iniciado há ${this.getRandomTime()}</span>
                        </div>
                    </div>
                    <div class="video-actions">
                        <button class="action-btn" id="like-btn-${containerId}">
                            <span class="action-btn-icon">👍</span>
                            <span class="like-count">${this.formatNumber(this.likeCount)}</span>
                        </button>
                        <button class="action-btn">
                            <span class="action-btn-icon">💬</span>
                            <span>Chat</span>
                        </button>
                        <button class="action-btn">
                            <span class="action-btn-icon">↗️</span>
                            <span>Compartilhar</span>
                        </button>
                        <button class="action-btn">
                            <span class="action-btn-icon">⭐</span>
                            <span>Salvar</span>
                        </button>
                    </div>
                    <div class="description-section">
                        <div class="description-title">Sobre esta live</div>
                        <div class="description-text">${this.config.videoDescription}</div>
                    </div>
                </div>
                <div class="chat-section" style="position: relative;">
                    <div class="chat-header">
                        <h3>Chat ao vivo</h3>
                        <div class="chat-status">
                            <span class="online-dot"></span>
                            <span class="status-online">${this.formatNumber(this.currentViews)} online</span>
                        </div>
                    </div>
                    <div class="chat-messages" id="chat-messages-${containerId}">
                        <!-- Mensagens serão inseridas aqui -->
                    </div>
                    <div class="chat-input-container" id="chat-input-container-${containerId}">
                        <button class="chat-login-trigger" id="chat-login-trigger-${containerId}">
                            💬 Clique aqui para participar do chat
                        </button>
                    </div>
                    ${this.config.requireLogin ? this.renderLoginOverlay(containerId) : ''}
                </div>
            </div>
        `;

        console.log('📄 HTML inserido no container');
        
        // Verificar se a imagem foi criada
        setTimeout(() => {
            const videoImg = container.querySelector('.video-image');
            const fakePlayer = container.querySelector('.fake-video-player');
            const videoWrapper = container.querySelector('.video-wrapper');
            
            console.log('🔍 Verificando elementos criados:');
            console.log('  .video-wrapper:', videoWrapper ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
            console.log('  .fake-video-player:', fakePlayer ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
            console.log('  .video-image:', videoImg ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
            
            if (videoImg) {
                console.log('  📸 Imagem src:', videoImg.src);
                console.log('  📸 Imagem complete:', videoImg.complete);
                console.log('  📸 Imagem naturalWidth:', videoImg.naturalWidth);
                console.log('  📸 Imagem naturalHeight:', videoImg.naturalHeight);
                
                // Verificar estilos computados da IMAGEM
                const computedStyle = window.getComputedStyle(videoImg);
                console.log('  🎨 Estilos da IMAGEM:');
                console.log('    display:', computedStyle.display);
                console.log('    opacity:', computedStyle.opacity);
                console.log('    visibility:', computedStyle.visibility);
                console.log('    z-index:', computedStyle.zIndex);
                console.log('    width:', computedStyle.width);
                console.log('    height:', computedStyle.height);
                console.log('    position:', computedStyle.position);
                
                // Verificar PAIS (pode estar escondido)
                const parent = videoImg.parentElement;
                const grandParent = parent?.parentElement;
                
                if (parent) {
                    const parentStyle = window.getComputedStyle(parent);
                    console.log('  👨 PAI (.fake-video-player):');
                    console.log('    display:', parentStyle.display);
                    console.log('    opacity:', parentStyle.opacity);
                    console.log('    visibility:', parentStyle.visibility);
                    console.log('    background:', parentStyle.background);
                }
                
                if (grandParent) {
                    const grandStyle = window.getComputedStyle(grandParent);
                    console.log('  👴 AVÔ (.video-wrapper):');
                    console.log('    display:', grandStyle.display);
                    console.log('    opacity:', grandStyle.opacity);
                    console.log('    background:', grandStyle.background);
                    console.log('    height:', grandStyle.height);
                }
                
                // FORÇAR visibilidade por JavaScript
                videoImg.style.cssText = `
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    display: block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    z-index: 50 !important;
                    object-fit: cover !important;
                `;
                console.log('🔧 Estilos FORÇADOS via JavaScript!');
                
                // FORÇAR pais também
                if (parent) {
                    parent.style.cssText = `
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        display: block !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        background: transparent !important;
                    `;
                }
                
                if (grandParent) {
                    grandParent.style.cssText = `
                        position: relative !important;
                        width: 100% !important;
                        padding-bottom: 56.25% !important;
                        display: block !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        background: #000 !important;
                        overflow: hidden !important;
                    `;
                }
                
                console.log('🔧 Pais também FORÇADOS!');
                
                videoImg.addEventListener('load', () => {
                    console.log('✅ IMAGEM CARREGOU COM SUCESSO!');
                });
                
                videoImg.addEventListener('error', () => {
                    console.error('❌ ERRO ao carregar imagem!');
                });
            }
        }, 500);

        this.cacheElements(containerId);
        this.attachEventListeners();
        this.start();
        
        console.log('✅ FakeWebinarLive.render() concluído');
    }

    renderLoginOverlay(containerId) {
        return `
            <div class="chat-login-overlay" id="login-overlay-${containerId}">
                <form class="chat-login-form" id="login-form-${containerId}">
                    <h3>🎯 Participe do Chat</h3>
                    <p>Preencha seus dados para interagir com outros participantes</p>
                    <div class="form-group">
                        <label for="name-${containerId}">Nome completo *</label>
                        <input 
                            type="text" 
                            id="name-${containerId}" 
                            name="name" 
                            placeholder="Seu nome"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label for="email-${containerId}">E-mail *</label>
                        <input 
                            type="email" 
                            id="email-${containerId}" 
                            name="email" 
                            placeholder="seu@email.com"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label for="phone-${containerId}">Telefone *</label>
                        <input 
                            type="tel" 
                            id="phone-${containerId}" 
                            name="phone" 
                            placeholder="(00) 00000-0000"
                            required
                        >
                    </div>
                    <button type="submit" class="form-submit-btn">
                        Entrar no Chat 🚀
                    </button>
                </form>
            </div>
        `;
    }

    cacheElements(containerId) {
        this.chatMessagesContainer = document.getElementById(`chat-messages-${containerId}`);
        this.viewCounterElement = document.querySelector('.view-counter-number');
        this.chatStatusElement = document.querySelector('.status-online');
        this.metaViewsElement = document.querySelector('.meta-views');
        this.likeBtn = document.getElementById(`like-btn-${containerId}`);
        this.loginOverlay = document.getElementById(`login-overlay-${containerId}`);
        this.loginForm = document.getElementById(`login-form-${containerId}`);
        
        // Esses serão criados depois do login
        this.chatInput = null;
        this.chatSendBtn = null;
    }

    attachEventListeners() {
        // Like button
        if (this.likeBtn) {
            this.likeBtn.addEventListener('click', () => this.handleLike());
        }

        // Chat login trigger button
        const loginTrigger = document.getElementById(`chat-login-trigger-${this.containerId}`);
        if (loginTrigger && this.config.requireLogin) {
            loginTrigger.addEventListener('click', () => {
                if (this.loginOverlay) {
                    this.loginOverlay.style.display = 'flex';
                }
            });
        }

        // Login form
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }
    }

    handleLike() {
        this.isLiked = !this.isLiked;
        
        if (this.isLiked) {
            this.likeCount++;
            this.likeBtn.classList.add('liked');
        } else {
            this.likeCount--;
            this.likeBtn.classList.remove('liked');
        }
        
        this.likeBtn.querySelector('.like-count').textContent = this.formatNumber(this.likeCount);
    }

    handleLogin(e) {
        const formData = new FormData(e.target);
        this.userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        };

        // Validação básica
        if (!this.userData.name || !this.userData.email || !this.userData.phone) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        this.isLoggedIn = true;
        
        // Remover overlay
        if (this.loginOverlay) {
            this.loginOverlay.style.display = 'none';
        }

        // Substituir botão por input
        const inputContainer = document.getElementById(`chat-input-container-${this.containerId}`);
        if (inputContainer) {
            inputContainer.innerHTML = `
                <div class="chat-input-wrapper">
                    <input 
                        type="text" 
                        class="chat-input" 
                        id="chat-input-${this.containerId}"
                        placeholder="Digite sua mensagem..."
                    >
                    <button class="chat-send-btn" id="chat-send-${this.containerId}">
                        ➤
                    </button>
                </div>
            `;
            
            // Re-cachear elementos
            this.chatInput = document.getElementById(`chat-input-${this.containerId}`);
            this.chatSendBtn = document.getElementById(`chat-send-${this.containerId}`);
            
            // Re-anexar eventos
            if (this.chatSendBtn) {
                this.chatSendBtn.addEventListener('click', () => this.handleSendMessage());
            }
            if (this.chatInput) {
                this.chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleSendMessage();
                    }
                });
                this.chatInput.focus();
            }
        }

        // Adicionar mensagem de boas-vindas
        this.addWelcomeMessage();

        // Callback opcional
        if (this.config.onLogin) {
            this.config.onLogin(this.userData);
        }
    }

    addWelcomeMessage() {
        if (!this.chatMessagesContainer) return;

        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'user-welcome';
        welcomeDiv.innerHTML = `
            <div class="user-welcome-text">
                ✅ Bem-vindo(a), ${this.userData.name.split(' ')[0]}! Você agora pode participar do chat.
            </div>
        `;
        this.chatMessagesContainer.appendChild(welcomeDiv);
        this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
    }

    handleSendMessage() {
        if (!this.chatInput || !this.isLoggedIn) return;

        const message = this.chatInput.value.trim();
        if (!message) return;

        // Adicionar mensagem do usuário
        this.addUserMessage(this.userData.name, message);
        
        // Limpar input
        this.chatInput.value = '';

        // Callback opcional
        if (this.config.onMessage) {
            this.config.onMessage({
                user: this.userData,
                message: message,
                timestamp: new Date()
            });
        }
    }

    addUserMessage(userName, text) {
        if (!this.chatMessagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        messageElement.innerHTML = `
            <div class="message-user" style="color: #00d95f;">${userName}</div>
            <div class="message-text">${this.escapeHtml(text)}</div>
        `;

        this.chatMessagesContainer.appendChild(messageElement);
        this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;

        // Limitar mensagens
        if (this.chatMessagesContainer.children.length > 100) {
            this.chatMessagesContainer.removeChild(this.chatMessagesContainer.firstChild);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getRandomTime() {
        const minutes = Math.floor(Math.random() * 45) + 5;
        return `${minutes} minutos`;
    }

    // Detectar e gerar HTML apropriado para YouTube, Vimeo ou imagem
    generateMediaHTML() {
        const url = this.config.videoImageUrl;
        
        // YouTube - SEMPRE usar thumbnail (99% dos vídeos bloqueiam embed)
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = this.extractYouTubeId(url);
            if (videoId) {
                console.log('🖼️ YouTube detectado: Usando thumbnail (embed bloqueado pela maioria dos vídeos)');
                return `
                    <div class="fake-video-player">
                        <img 
                            src="https://img.youtube.com/vi/${videoId}/sddefault.jpg" 
                            class="video-image video-playing" 
                            alt="Live Stream"
                            onerror="window.handleImageError(this)">
                        <div class="video-playing-overlay"></div>
                        <div class="video-sound-waves">
                            <span class="wave"></span>
                            <span class="wave"></span>
                            <span class="wave"></span>
                            <span class="wave"></span>
                            <span class="wave"></span>
                        </div>
                        <div class="video-quality-indicator" style="font-size: 11px; padding: 5px 10px;">
                            <span class="view-counter-number">${this.formatNumber(this.currentViews)}</span> assistindo
                        </div>
                    </div>
                `;
            }
        }
        
        // Google Drive - Suporte para vídeos hospedados no Drive
        if (url.includes('drive.google.com')) {
            // Extrair ID do Google Drive
            let driveId = null;
            const driveMatch = url.match(/\/d\/([^/]+)/);
            if (driveMatch) {
                driveId = driveMatch[1];
            }
            
            if (driveId) {
                console.log('🎥 Google Drive detectado! ID:', driveId);
                // Usar IFRAME do Google Drive com overlay para simular live
                return `
                    <div class="fake-video-player" style="position: relative; width: 100%; height: 100%; overflow: hidden; background: #000;">
                        <!-- Vídeo do Google Drive - RECORTE MÁXIMO -->
                        <iframe 
                            src="https://drive.google.com/file/d/${driveId}/preview?autoplay=1" 
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            style="
                                position: absolute;
                                top: -45px;
                                left: 0;
                                width: 100%;
                                height: calc(100% + 200px);
                                border: none;
                                pointer-events: none;
                            ">
                        </iframe>
                        
                        <!-- OVERLAY TRANSPARENTE -->
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            z-index: 50;
                            background: transparent;
                        "></div>
                        
                        <!-- Indicadores de LIVE -->
                        <div class="video-quality-indicator" style="z-index: 100; font-size: 11px; padding: 5px 10px;">
                            <span class="view-counter-number">${this.formatNumber(this.currentViews)}</span> assistindo
                        </div>
                        <div class="video-sound-waves" style="z-index: 100;">
                            <span class="wave"></span>
                            <span class="wave"></span>
                            <span class="wave"></span>
                            <span class="wave"></span>
                            <span class="wave"></span>
                        </div>
                    </div>
                `;
            }
        }
        
        // Link direto de vídeo (MP4, WebM, etc)
        if (url.match(/\.(mp4|webm|ogg)$/i)) {
            return `
                <div class="fake-video-player">
                    <video class="video-element video-playing" autoplay muted loop playsinline>
                        <source src="${url}" type="video/mp4">
                        Seu navegador não suporta vídeo.
                    </video>
                    <div class="video-playing-overlay"></div>
                    <div class="video-sound-waves">
                        <span class="wave"></span>
                        <span class="wave"></span>
                        <span class="wave"></span>
                        <span class="wave"></span>
                        <span class="wave"></span>
                    </div>
                    <div class="video-quality-indicator" style="font-size: 11px; padding: 5px 10px;">
                        <span class="view-counter-number">${this.formatNumber(this.currentViews)}</span> assistindo
                    </div>
                </div>
            `;
        }
        
        // Padrão: Imagem com simulação de vídeo
        return `
            <div class="fake-video-player">
                <img 
                    src="${url}" 
                    alt="Live Stream" 
                    class="video-image video-playing" 
                    onerror="window.handleImageError(this)">
                <div class="video-playing-overlay"></div>
                <div class="video-sound-waves">
                    <span class="wave"></span>
                    <span class="wave"></span>
                    <span class="wave"></span>
                    <span class="wave"></span>
                    <span class="wave"></span>
                </div>
                <div class="video-quality-indicator" style="font-size: 11px; padding: 5px 10px;">
                    <span class="view-counter-number">${this.formatNumber(this.currentViews)}</span> assistindo
                </div>
            </div>
        `;
    }

    // Extrair ID do YouTube
    extractYouTubeId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
            /youtube\.com\/watch\?.*v=([^&\s]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }

    // Extrair ID do Vimeo
    extractVimeoId(url) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : null;
    }

    // Atualizar mídia dinamicamente
    updateMedia(newUrl) {
        this.config.videoImageUrl = newUrl;
        const videoWrapper = document.querySelector('.video-wrapper');
        if (videoWrapper) {
            // Manter badges e controles
            const liveBadge = videoWrapper.querySelector('.live-badge');
            const viewCounter = videoWrapper.querySelector('.view-counter');
            const videoControls = videoWrapper.querySelector('.video-controls');
            
            // Remover mídia antiga
            const oldMedia = videoWrapper.querySelector('.video-image, .video-iframe, .video-element');
            if (oldMedia) {
                oldMedia.remove();
            }
            
            // Adicionar nova mídia
            const mediaHTML = this.generateMediaHTML();
            videoWrapper.insertAdjacentHTML('afterbegin', mediaHTML);
        }
    }

    start() {
        // Iniciar incremento de views
        this.startViewCounter();
        
        // Iniciar chat automático
        this.startChat();
        
        // Iniciar mensagens com tempo
        this.startTimedMessages();
        
        // Iniciar timestamp do vídeo (simula reprodução)
        this.startVideoTimestamp();
    }
    
    startVideoTimestamp() {
        const timestampElement = document.getElementById(`video-timestamp-${this.containerId}`);
        if (!timestampElement) return;
        
        // Atualizar total time
        const totalSpan = timestampElement.querySelector('.timestamp-total');
        if (totalSpan) {
            totalSpan.textContent = this.formatTime(this.videoTotalTime);
        }
        
        // Buscar barra de progresso
        const progressFill = document.querySelector('.progress-fill');
        
        // Atualizar current time a cada segundo
        this.videoTimestampIntervalId = setInterval(() => {
            // Só incrementa se não passou do tempo total
            if (this.videoCurrentTime < this.videoTotalTime) {
                this.videoCurrentTime++;
            }
            // Quando chegar no final, PARA (não reinicia - é uma live!)
            
            // Atualizar timestamp
            const currentSpan = timestampElement.querySelector('.timestamp-current');
            if (currentSpan) {
                currentSpan.textContent = this.formatTime(this.videoCurrentTime);
            }
            
            // Atualizar barra de progresso
            if (progressFill) {
                const percentage = (this.videoCurrentTime / this.videoTotalTime) * 100;
                progressFill.style.width = `${Math.min(percentage, 100)}%`;
            }
        }, 1000);
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    startViewCounter() {
        this.viewIntervalId = setInterval(() => {
            const increment = Math.floor(
                Math.random() * (this.config.viewIncrementMax - this.config.viewIncrementMin + 1)
            ) + this.config.viewIncrementMin;
            
            this.currentViews += increment;
            this.updateViewCounter();
        }, 5000); // Atualiza a cada 5 segundos
    }

    updateViewCounter() {
        const formatted = this.formatNumber(this.currentViews);
        
        if (this.viewCounterElement) {
            this.viewCounterElement.textContent = formatted;
        }
        if (this.chatStatusElement) {
            this.chatStatusElement.textContent = `${formatted} online`;
        }
        if (this.metaViewsElement) {
            this.metaViewsElement.textContent = formatted;
        }
    }

    startChat() {
        // Adicionar primeira mensagem imediatamente
        this.addChatMessage();

        // Continue adicionando mensagens no intervalo definido
        this.chatIntervalId = setInterval(() => {
            this.addChatMessage();
        }, this.config.chatSpeed);
    }

    addChatMessage() {
        if (!this.chatMessagesContainer) return;

        const message = this.config.messages[this.currentMessageIndex];
        
        // Gerar cor aleatória para o usuário
        const colors = ['#9147ff', '#1f69ff', '#f70266', '#00c7ac', '#ffa500', '#e91916'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message bot-message';
        messageElement.innerHTML = `
            <div class="message-user" style="color: ${randomColor};">${message.user}</div>
            <div class="message-text">${message.text}</div>
        `;

        this.chatMessagesContainer.appendChild(messageElement);
        
        // Auto scroll para o final (somente se usuário não estiver scrollando)
        const isScrolledToBottom = this.chatMessagesContainer.scrollHeight - this.chatMessagesContainer.clientHeight <= this.chatMessagesContainer.scrollTop + 50;
        if (isScrolledToBottom) {
            this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
        }

        // Limitar número de mensagens visíveis (performance)
        if (this.chatMessagesContainer.children.length > 100) {
            this.chatMessagesContainer.removeChild(this.chatMessagesContainer.firstChild);
        }

        // Avançar para próxima mensagem (loop circular)
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.config.messages.length;
    }

    formatNumber(num) {
        return num.toLocaleString('pt-BR');
    }

    startTimedMessages() {
        if (!this.config.timedMessages || this.config.timedMessages.length === 0) return;
        
        // Marcar todas como não enviadas
        this.config.timedMessages.forEach(msg => msg.sent = false);
        
        // Verificar a cada segundo se alguma mensagem deve ser enviada
        this.timedMessagesIntervalId = setInterval(() => {
            const currentTime = Math.floor((Date.now() - this.videoStartTime) / 1000);
            
            this.config.timedMessages.forEach(msg => {
                if (!msg.sent && currentTime >= msg.timeInSeconds) {
                    this.addTimedMessage(msg.user, msg.text);
                    msg.sent = true;
                }
            });
        }, 1000);
    }
    
    addTimedMessage(userName, text) {
        if (!this.chatMessagesContainer) return;
        
        // Gerar cor aleatória
        const colors = ['#9147ff', '#1f69ff', '#f70266', '#00c7ac', '#ffa500', '#e91916'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message bot-message';
        messageElement.innerHTML = `
            <div class="message-user" style="color: ${randomColor};">${userName}</div>
            <div class="message-text">${text}</div>
        `;
        
        this.chatMessagesContainer.appendChild(messageElement);
        
        // Auto scroll
        const isScrolledToBottom = this.chatMessagesContainer.scrollHeight - this.chatMessagesContainer.clientHeight <= this.chatMessagesContainer.scrollTop + 50;
        if (isScrolledToBottom) {
            this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
        }
        
        // Limitar mensagens
        if (this.chatMessagesContainer.children.length > 100) {
            this.chatMessagesContainer.removeChild(this.chatMessagesContainer.firstChild);
        }
    }

    destroy() {
        if (this.viewIntervalId) {
            clearInterval(this.viewIntervalId);
        }
        if (this.chatIntervalId) {
            clearInterval(this.chatIntervalId);
        }
        if (this.timedMessagesIntervalId) {
            clearInterval(this.timedMessagesIntervalId);
        }
        if (this.videoTimestampIntervalId) {
            clearInterval(this.videoTimestampIntervalId);
        }
    }
}

// Exportar para uso global
window.FakeWebinarLive = FakeWebinarLive;

