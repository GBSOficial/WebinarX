// Demo de uso do componente FakeWebinarLive

// CARREGAR CONFIGURAÇÃO DO DASHBOARD (se existir)
function loadConfigFromDashboard() {
    const savedConfig = localStorage.getItem('webinarConfig');
    
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            
            // FORÇAR thumbnail no macOS se for YouTube
            const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isYouTube = config.videoImageUrl && (config.videoImageUrl.includes('youtube.com') || config.videoImageUrl.includes('youtu.be'));
            
            if (isMacOS && isYouTube && config.useRealVideo === true) {
                console.warn('⚠️ macOS + YouTube detectado: FORÇANDO thumbnail (evitar erro 153)');
                config.useRealVideo = false;
                // Salvar correção
                localStorage.setItem('webinarConfig', JSON.stringify(config));
            }
            
            console.log('✅ Configuração carregada!', config);
            console.log(`🎥 useRealVideo: ${config.useRealVideo} | ${config.useRealVideo ? 'Vídeo real ativado' : 'Thumbnail ativada'}`);
            console.log(`⏱️ Duração do vídeo: ${config.videoDuration || 2700} segundos`);
            return config;
        } catch (e) {
            console.error('Erro ao carregar configuração:', e);
            return null;
        }
    }
    
    return null;
}

// Tentar carregar configuração do dashboard
const dashboardConfig = loadConfigFromDashboard();

// Se existe configuração do dashboard, usar ela. Senão, usar padrão
const webinar = new FakeWebinarLive({
    // URL da mídia - SUPORTA:
    // ✅ YouTube: https://youtube.com/watch?v=...
    // ✅ Vimeo: https://vimeo.com/...
    // ✅ Vídeo MP4: https://...video.mp4
    // ✅ Imagem: https://...imagem.jpg
    videoImageUrl: dashboardConfig?.videoImageUrl || 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1920&h=1080&fit=crop&q=80',
    
    // Informações do vídeo
    videoTitle: dashboardConfig?.videoTitle || '🔴 Webinar Ao Vivo - Como Faturar 6 Dígitos em 2025',
    videoDescription: dashboardConfig?.videoDescription || 'Descubra as estratégias exatas que empresários de sucesso estão usando para multiplicar seus resultados. Aula 100% prática e exclusiva!',
    
    // Duração do vídeo (em SEGUNDOS)
    videoDuration: dashboardConfig?.videoDuration || 2700,
    
    // Configurações de views
    initialViews: dashboardConfig?.initialViews || 2847,
    viewIncrementMin: dashboardConfig?.viewIncrementMin || 3,
    viewIncrementMax: dashboardConfig?.viewIncrementMax || 12,
    
    // Velocidade do chat (ms entre mensagens)
    chatSpeed: dashboardConfig?.chatSpeed || 2000,
    
    // Exigir login para participar do chat?
    requireLogin: dashboardConfig?.requireLogin !== undefined ? dashboardConfig.requireLogin : true,
    
    // Usar vídeo real do YouTube (tocando)? PADRÃO: false (thumbnail sempre funciona)
    useRealVideo: dashboardConfig?.useRealVideo === true ? true : false,
    
    // Mensagens normais (loop automático)
    messages: dashboardConfig?.messages || [
        { user: 'Maria Silva', text: 'Olá! Acabei de entrar, estou animada! 🎉' },
        { user: 'João Santos', text: 'Esse conteúdo está incrível 🔥' },
        { user: 'Ana Costa', text: 'Alguém consegue me ajudar com uma dúvida?' },
        { user: 'Pedro Lima', text: 'Estou tomando notas de tudo!' },
        { user: 'Carla Mendes', text: 'Primeira vez aqui, muito bom! 👏' },
        { user: 'Lucas Oliveira', text: 'Como faço para aplicar isso no meu negócio?' },
        { user: 'Fernanda Rocha', text: 'Compartilhando com meu time agora mesmo' },
        { user: 'Roberto Alves', text: 'Conteúdo de alto nível 💪' },
        { user: 'Juliana Pereira', text: 'Tem como rever depois?' },
        { user: 'Marcos Souza', text: 'Já salvei nos favoritos! ⭐' },
        { user: 'Patrícia Dias', text: 'Isso vai revolucionar meu trabalho' },
        { user: 'Gabriel Martins', text: 'Qual a próxima live?' },
        { user: 'Beatriz Cardoso', text: 'Estou impressionada com esse método 😮' },
        { user: 'Ricardo Ferreira', text: 'Parabéns pelo conteúdo!' },
        { user: 'Amanda Ribeiro', text: 'Finalmente um conteúdo que funciona de verdade' },
        { user: 'Thiago Borges', text: 'Minha equipe toda está assistindo 👥' },
        { user: 'Camila Nunes', text: 'Onde posso encontrar mais informações?' },
        { user: 'Felipe Castro', text: 'Isso é exatamente o que eu precisava! 💯' },
        { user: 'Sandra Lima', text: 'Alguém já testou essa estratégia?' },
        { user: 'Daniel Souza', text: 'Funciona mesmo! Testei semana passada ✅' },
        { user: 'Paula Martins', text: 'Estou anotando tudo! 📝' },
        { user: 'Carlos Eduardo', text: 'Melhor webinar que já assisti!' },
        { user: 'Renata Costa', text: 'Compartilhei no grupo da empresa' },
        { user: 'Fábio Almeida', text: 'Conteúdo premium 🏆' },
        { user: 'Larissa Rocha', text: 'Quanto custa o curso completo?' }
    ],
    
    // Mensagens com tempo específico (aparecem em horários definidos do vídeo)
    timedMessages: dashboardConfig?.timedMessages || [],
    
    // Callback quando usuário faz login
    onLogin: (userData) => {
        console.log('Novo usuário logado:', userData);
        // Aqui você pode enviar para seu backend, Google Sheets, etc
    },
    // Callback quando usuário envia mensagem
    onMessage: (data) => {
        console.log('Nova mensagem:', data);
        // Aqui você pode processar a mensagem do usuário
    }
});

webinar.render('webinar-container');

// Máscara de telefone brasileira
document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 6) {
                value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            } else if (value.length > 0) {
                value = value.replace(/^(\d{0,2})/, '($1');
            }
            
            e.target.value = value;
        });
    }
});

// Para destruir o componente (limpar intervalos)
// webinar.destroy();

