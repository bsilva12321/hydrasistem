document.addEventListener('DOMContentLoaded', () => {

    // UI Elements
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const chatView = document.getElementById('chat-view');
    const dashboardView = document.getElementById('dashboard-view');

    // Chat Elements
    const currentAgentName = document.getElementById('current-agent-name');
    const currentAgentRole = document.getElementById('current-agent-role');
    const currentAgentIcon = document.getElementById('current-agent-icon');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');
    const objectionBank = document.getElementById('objection-bank');

    const metricTasks = document.getElementById('metric-tasks');
    let tasksCount = parseInt(localStorage.getItem('hydra_tasks_count') || '0');
    if (metricTasks) metricTasks.textContent = tasksCount;

    // --- Productivity Chart Logic (Fase 3) ---
    let tasksHistory = JSON.parse(localStorage.getItem('hydra_tasks_history') || '{}');

    function getTodayString() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function incrementTasks() {
        tasksCount++;
        localStorage.setItem('hydra_tasks_count', tasksCount.toString());
        if (metricTasks) metricTasks.textContent = tasksCount;

        const today = getTodayString();
        tasksHistory[today] = (tasksHistory[today] || 0) + 1;
        localStorage.setItem('hydra_tasks_history', JSON.stringify(tasksHistory));

        if (window.productivityChart) {
            updateChartData();
        }
    }

    function initChart() {
        const ctx = document.getElementById('productivity-chart');
        if (!ctx) return;

        // Prepare last 7 days
        const labels = [];
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const displayStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
            labels.push(displayStr);
            data.push(tasksHistory[dateStr] || 0);
        }

        window.productivityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tarefas Executadas',
                    data: data,
                    backgroundColor: 'rgba(160, 32, 240, 0.6)',
                    borderColor: '#a020f0',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#888', stepSize: 1 },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    x: {
                        ticks: { color: '#888' },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function updateChartData() {
        const labels = [];
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const displayStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
            labels.push(displayStr);
            data.push(tasksHistory[dateStr] || 0);
        }
        window.productivityChart.data.labels = labels;
        window.productivityChart.data.datasets[0].data = data;
        window.productivityChart.update();
    }

    // Initialize chart on load
    setTimeout(initChart, 500);

    // Agent Data
    const agentsContext = {
        '1': {
            name: 'Copywriter Master',
            role: 'Especialista em VSL, Emails e Páginas de Venda',
            icon: '<i class="fa-solid fa-feather-pointed"></i>',
            welcomeMsg: 'Olá. Sou seu Copywriter. Me envie os detalhes do seu produto ou o avatar do cliente, e eu escreverei uma copy persuasiva que convencerá qualquer um a comprar.'
        },
        '2': {
            name: 'Arquiteto de Prompts',
            role: 'Criação e Setup de Apps/SaaS',
            icon: '<i class="fa-solid fa-code"></i>',
            welcomeMsg: 'Saudações, Builder. Sou o Arquiteto de Prompts. Você quer criar um novo SaaS, um aplicativo web ou estruturar sua lógica sistêmica? Me dê sua ideia e te darei o prompt exato para construir isso.'
        },
        '3': {
            name: 'Closer High Ticket',
            role: 'Fechador de Vendas por Mensagem',
            icon: '<i class="fa-solid fa-sack-dollar"></i>',
            welcomeMsg: 'Pronto para botar dinheiro no bolso? Sou seu Closer High Ticket. Colete o histórico de conversa com o Lead ou levante a objeção dele, e eu te darei o script de contorno exato para bater a venda.'
        },
        '4': {
            name: 'Gestor de Tráfego',
            role: 'Especialista em Meta Ads 2026',
            icon: '<i class="fa-solid fa-chart-line"></i>',
            welcomeMsg: 'Pronto para escalar com ROI positivo? Sou seu Gestor de Tráfego. Me passe suas métricas ou faça perguntas sobre anúncios, e eu planejarei a escala cientificamente.'
        }
    };

    let currentAgentId = null;

    // Navigation and View Switching
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked item
            item.classList.add('active');

            const targetViewId = item.getAttribute('data-target');

            // Hide all views
            viewSections.forEach(section => {
                section.classList.remove('active');
            });

            // Show selected view
            const targetView = document.getElementById(targetViewId);
            if (targetView) {
                targetView.classList.add('active');
            }

            // Specific logic if it's an agent chat
            if (item.classList.contains('agent-item')) {
                const agentId = item.getAttribute('data-agent-id');
                openAgentChat(agentId);
            }
        });
    });

    function openAgentChat(agentId) {
        currentAgentId = agentId;
        const agent = agentsContext[agentId];

        // Quick Objection Bank Visibility (Fase 3)
        if (objectionBank) {
            objectionBank.style.display = (agentId === '3') ? 'flex' : 'none';
        }

        // Update Header
        currentAgentName.textContent = agent.name;
        currentAgentRole.textContent = agent.role;
        currentAgentIcon.innerHTML = agent.icon;

        // Reset Chat and add welcome message
        chatContainer.innerHTML = ''; // clear chat

        // System message connecting
        appendMessage('system', 'Conectando Base de Conhecimento RAG do Agente... <span>Emulação Iniciada</span>');

        // Timeout to simulate agent typing initial message
        setTimeout(() => {
            appendMessage('agent', agent.welcomeMsg);
        }, 600);
    }

    function appendMessage(sender, text, isAiResponse = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-msg`;

        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.innerHTML = text; // using innerHTML specifically for the system span tags

        msgDiv.appendChild(bubble);

        if (isAiResponse) {
            const actionBar = document.createElement('div');
            actionBar.style.cssText = "display: flex; gap: 10px; margin-top: 8px; font-size: 0.8rem; justify-content: flex-start;";

            const btnCopy = document.createElement('button');
            btnCopy.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar';
            btnCopy.className = 'btn-icon';
            btnCopy.style.padding = "4px 10px";
            btnCopy.onclick = () => {
                navigator.clipboard.writeText(bubble.innerText);
                btnCopy.innerHTML = '<i class="fa-solid fa-check" style="color: #00ff64;"></i> Copiado';
                setTimeout(() => btnCopy.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar', 2000);
            };

            const btnDownload = document.createElement('button');
            btnDownload.innerHTML = '<i class="fa-solid fa-download"></i> Baixar .TXT';
            btnDownload.className = 'btn-icon';
            btnDownload.style.padding = "4px 10px";
            btnDownload.onclick = () => {
                const blob = new Blob([bubble.innerText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hydra_export_${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            };

            const btnDownloadDocx = document.createElement('button');
            btnDownloadDocx.innerHTML = '<i class="fa-solid fa-file-word"></i> Baixar .DOCX';
            btnDownloadDocx.className = 'btn-icon';
            btnDownloadDocx.style.padding = "4px 10px";
            btnDownloadDocx.onclick = () => {
                const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export DOCX</title></head><body>";
                const footer = "</body></html>";
                const sourceHTML = header + bubble.innerHTML + footer;

                const converted = htmlDocx.asBlob(sourceHTML);
                const url = URL.createObjectURL(converted);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hydra_export_${Date.now()}.docx`;
                a.click();
                URL.revokeObjectURL(url);
            };

            actionBar.appendChild(btnCopy);
            actionBar.appendChild(btnDownload);
            actionBar.appendChild(btnDownloadDocx);
            msgDiv.appendChild(actionBar);
        }

        chatContainer.appendChild(msgDiv);

        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Handles sending message
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text && !currentFile) return;

        // Add user message
        let userMsgHtml = text;
        if (currentFile) {
            userMsgHtml = `<i class="fa-solid fa-image" style="color: var(--primary-neon); margin-right: 8px;"></i> [Imagem Anexada: ${currentFile.name}]<br>` + userMsgHtml;
        }

        appendMessage('user', userMsgHtml);
        chatInput.value = '';

        // Store file data for request and clear UI instantly
        const pendingFile = currentFile;
        const pendingBase64 = currentFileBase64;

        currentFile = null;
        currentFileBase64 = null;
        fileUpload.value = '';
        attachmentPreview.style.display = 'none';

        // Simulate agent typing
        const agent = agentsContext[currentAgentId];

        appendMessage('agent', `<i class="fa-solid fa-ellipsis fa-fade" id="typing-indicator"></i>`);

        // --- Image Generation Hack (Fase 3) ---
        if (text.toLowerCase().startsWith('/imagem ')) {
            const imgPrompt = text.substring(8).trim();
            const safePrompt = encodeURIComponent(imgPrompt);
            const imgUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=800&height=600&nologo=true`;

            setTimeout(() => {
                const typingContent = document.getElementById('typing-indicator');
                if (typingContent && typingContent.closest('.message')) {
                    chatContainer.removeChild(typingContent.closest('.message'));
                }
                appendMessage('agent', `<div style="text-align: center;"><p style="margin-bottom: 15px; color: var(--primary-neon);"><strong><i class="fa-solid fa-wand-magic-sparkles"></i> Criativo Gerado:</strong> "${imgPrompt}"</p><img src="${imgUrl}" alt="${imgPrompt}" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--primary-neon); box-shadow: 0 0 15px var(--primary-glow); margin-bottom: 10px;"></div>`, false);
                incrementTasks();
            }, 1000);
            return;
        }

        // --- URL Scraper Hack (Fase 3) ---
        if (text.toLowerCase().startsWith('/url ')) {
            const urlToScrape = text.substring(5).trim();
            if (!urlToScrape) {
                const typingContent = document.getElementById('typing-indicator');
                if (typingContent && typingContent.closest('.message')) {
                    chatContainer.removeChild(typingContent.closest('.message'));
                }
                appendMessage('agent', 'Por favor, forneça uma URL válida após o comando /url.');
                return;
            }

            try {
                // Remove typing indicator visually to show scraping status
                const typingContent = document.getElementById('typing-indicator');
                if (typingContent) typingContent.parentElement.innerHTML = `<i class="fa-solid fa-spinner fa-spin" id="scraping-indicator" style="color:var(--primary-neon);"></i> Lendo: ${urlToScrape}...`;

                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlToScrape)}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();

                // Basic HTML to Text parsing
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, 'text/html');
                const extractedText = doc.body ? doc.body.innerText.replace(/\s+/g, ' ').trim().substring(0, 15000) : "Não foi possível extrair o texto.";

                // Send this text to the agent workflow (reassigning 'text' variable)
                text = `[CONTEÚDO RASPADO DA URL: ${urlToScrape}]\n\n${extractedText}\n\n======================\n\nAnalise o conteúdo acima com base nos seus conhecimentos básicos para meu projeto e aja de acordo com sua função.`;

                // Remove scraping indicator completely before Gemini kicks in (it will append a new one in the normal flow if needed, but since we are overriding 'text', we must recreate the typing indicator)
                const scrapingContent = document.getElementById('scraping-indicator');
                if (scrapingContent && scrapingContent.closest('.message')) {
                    chatContainer.removeChild(scrapingContent.closest('.message'));
                }
                appendMessage('agent', `<i class="fa-solid fa-ellipsis fa-fade" id="typing-indicator"></i>`);
            } catch (err) {
                const scrapingIndicator = document.getElementById('scraping-indicator');
                if (scrapingIndicator && scrapingIndicator.closest('.message')) {
                    chatContainer.removeChild(scrapingIndicator.closest('.message'));
                }
                appendMessage('agent', `❌ Falha ao tentar raspar a URL: ${err.message}. Verifique se o link é público e permite acesso de terceiros (Bots).`);
                return;
            }
        }

        // RAG and API connection (No artificial delays anymore)
        if ((currentAgentId === '1' && typeof copywriterRAG !== 'undefined') ||
            (currentAgentId === '2' && typeof promptArchitectRAG !== 'undefined') ||
            (currentAgentId === '3' && typeof closerRAG !== 'undefined') ||
            (currentAgentId === '4' && typeof gestorTrafegoRAG !== 'undefined')) {

            // Use stored API key or default fallback
            const storedKey = localStorage.getItem('hydra_api_key');
            const apiKey = storedKey ? storedKey : "AIzaSyA1KQ7xakl5-vqVWInrhrII0N7G8gDiRHU"; // The user's provided API Key fallback

            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

            // Assemble the System Prompt based on the specific Agent
            let systemPrompt = "";
            if (currentAgentId === '1') {
                systemPrompt = `Você é o ${copywriterRAG.agente_config.nome}. 
Objetivo: ${copywriterRAG.agente_config.objetivo}. 
Base teórica: ${copywriterRAG.agente_config.base_teorica}. 
Você DEVE utilizar o conhecimento dos maiores copywriters listados abaixo para gerar todas as suas respostas.
Sempre crie textos reais, VSLs, emails ou anúncios inteiros quando solicitado, usando mecanismos únicos (como os do swipe file) e técnicas viscerais. 
Não seja um assistente genérico: seja um mestre agressivo focado em conversão, usando técnicas como "Slippery Slide", Nível de Consciência de Schwartz e a "Regra de Um".

Aqui está todo o seu cérebro de RAG JSON: ${JSON.stringify(copywriterRAG)}

Instrução Final: O usuário acabou de te enviar o prompt abaixo. Responda em Português usando o seu conhecimento máximo como Copywriter Supremo. Você não tem limitação de tamanho para criar textos longos de VSL. Entregue o texto completo. Aplique formatação em HTML básico (usando <strong>, <br>, <h3>, <ul>, <li>) para ficar bonito no chat.`;
            } else if (currentAgentId === '2') {
                systemPrompt = `Você é o Arquiteteto de Prompts, versão: ${promptArchitectRAG.versao_rag}. 
Contexto temporal: ${promptArchitectRAG.data_conhecimento}. 
Objetivo: ${promptArchitectRAG.objetivo_agente}. 
Você criará super prompts otimizados e contratos de dados (JSON) determinísticos para guiar outras IAs de codificação autônoma (como o Cursor, Claude 3.5 Sonnet Engineer, etc).
Siga estritamente as topologias, engenharias de contexto, e instruções de segurança contidas no seu cérebro.
As restrições de UX e de Segurança listadas devem englobar a arquitetura das aplicações alvo.

Aqui está todo o seu cérebro de RAG JSON: ${JSON.stringify(promptArchitectRAG)}

Instrução Final: O usuário acabou de descrever a ideia de software e tecnologias abaixo. Responda em Português atuando como Arquiteto de Prompts. Formule uma resposta detalhada ou um super-prompt completo pronto para ser copiado. Aplique formatação em HTML básico (usando <strong>, <em>, <br>, <h3>, <pre>, <code>, <ul>, <li>) para ficar perfeitamente elegante no chat.`;
            } else if (currentAgentId === '3') {
                systemPrompt = `Você é o Closer High Ticket da equipe. 
Identidade: ${closerRAG.closer_core_engine.identity.persona}.
Voz: ${closerRAG.closer_core_engine.identity.voice_tonality}.
Status: ${closerRAG.closer_core_engine.identity.status_frame}.

Seja extremamente analítico. Nunca bajule o cliente ou mostre desespero.
Haja como um médico diagnosticando um problema de $100.000, onde a sua solução é a única cura.
Siga incondicionalmente suas Leis Inquebráveis: \n ${closerRAG.closer_core_engine.unbreakable_laws.join('\n')}

Aqui está o seu cofre mental (RAG): ${JSON.stringify(closerRAG)}

Instrução Final: O usuário está te pedindo ajuda para fechar uma venda, reverter objeções, analisar uma call, ou montar um script. Baseado ABSOLUTAMENTE na sua metodologia NEPQ, Gap Selling e Sandler, diagnostique ou responda o problema do usuário com segurança brutal. Aplique formatação em HTML básico (usando <strong>, <em>, <br>, <h3>, <ul>, <li>) para estruturar a sua resposta da melhor maneira possível.`;
            } else if (currentAgentId === '4') {
                systemPrompt = `Você é o Gestor de Tráfego da equipe. 
Identidade: ${gestorTrafegoRAG.agente.identidade}.
Missão: ${gestorTrafegoRAG.agente.missão}.

Siga incondicionalmente suas Instruções de Sistema: \n ${gestorTrafegoRAG.agente.instrucoes_sistema.join('\n')}

Aqui está o seu conhecimento profundo de RAG: ${JSON.stringify(gestorTrafegoRAG)}

Instrução Final: O usuário está pedindo ajuda para otimizar campanhas, regras ativas ou escalar vendas. Responda como um especialista de Elite focado em conversão e ROAS, utilizando seus protocolos rígidos. Aplique formatação em HTML básico (usando <strong>, <em>, <br>, <h3>, <ul>, <li>) para estruturar a sua resposta.`;
            }

            // --- Inject Profile Context (Fase 3) ---
            const collabName = localStorage.getItem('hydra_user_name') || 'Usuário VIP';
            const collabRole = localStorage.getItem('hydra_user_role') || 'Sócio / Operador';
            systemPrompt += `\n\n[CONTEXTO DO USUÁRIO ATUAL]: O nome da pessoa falando com você agora é "${collabName}", e o cargo dele(a) é "${collabRole}". Trate-o(a) pelo nome e molde suas respostas de acordo com o nível técnico desse cargo.`;

            let parts = [{ text: text || "Analise a imagem anexada baseada nos seus princípios de RAG." }];

            if (pendingFile && pendingBase64) {
                if (pendingFile.type.startsWith('image/') || pendingFile.type.startsWith('audio/')) {
                    parts.unshift({
                        inlineData: {
                            mimeType: pendingFile.type,
                            data: pendingBase64
                        }
                    });
                } else {
                    parts.unshift({
                        text: `\n[DOCUMENTO ANEXADO PELO USUÁRIO (Arquivo: ${pendingFile.name})]:\n${pendingBase64}\n\n`
                    });
                }
            }

            // Fetch selected mode
            let selectedMode = 'basic';
            const modeRadios = document.querySelectorAll('input[name="agent_mode"]');
            modeRadios.forEach(radio => {
                if (radio.checked) selectedMode = radio.value;
            });

            if (selectedMode === 'basic') {
                systemPrompt += "\n[MODO BÁSICO DA IA]: Vá direto ao ponto e seja muito resumido. Evite se aprofundar muito nas explicações e gere respostas curtas. Corte saudações.";
            } else {
                systemPrompt += "\n[MODO PRO DA IA]: O usuário ativou o Modo Máximo! Use todo o seu poder de processamento. Gere textos longos, detalhados, profundos e explore toda a sua base RAG.";
            }

            // Adjust API configuration based on mode
            const maxTokens = 8192; // We always allow max tokens so the text NEVER cuts off mid-sentence!
            const tempConfig = (selectedMode === 'pro') ? 0.8 : 0.5;

            // --- Fetch execution based on API key type ---
            if (storedKey && storedKey.startsWith('sk_cr_')) {
                // Bonsai API Fallback (Claude)
                const requestBodyBonsai = {
                    model: "claude-3-haiku-20240307",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: parts.map(p => p.text || "[Arquivo/Imagem Anexado]").join('\n') }
                    ],
                    max_tokens: 4000,
                    temperature: tempConfig
                };

                fetch("https://gateway.trybons.ai/v1/chat/completions", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${storedKey}`
                    },
                    body: JSON.stringify(requestBodyBonsai)
                })
                    .then(response => response.json())
                    .then(data => {
                        const typingContent = document.getElementById('typing-indicator');
                        if (typingContent && typingContent.closest('.message')) {
                            chatContainer.removeChild(typingContent.closest('.message'));
                        }

                        if (data.choices && data.choices.length > 0) {
                            let aiText = data.choices[0].message.content;

                            aiText = aiText.replace(/### (.*?)\n/g, '<h3>$1</h3>\n');
                            aiText = aiText.replace(/## (.*?)\n/g, '<h2>$1</h2>\n');
                            aiText = aiText.replace(/# (.*?)\n/g, '<h1>$1</h1>\n');
                            aiText = aiText.replace(/```([\s\S]*?)```/g, '<div style="background:#000; padding:10px; border-radius:8px; overflow-x:auto; margin:10px 0;"><pre style="margin:0;"><code style="color:#00ff64;">$1</code></pre></div>');
                            aiText = aiText.replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1); padding:2px 4px; border-radius:4px; color:#d000ff;">$1</code>');
                            aiText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            aiText = aiText.replace(/\*(.*?)\*/g, '<em>$1</em>');
                            aiText = aiText.replace(/\n\n/g, '<br><br>');
                            aiText = aiText.replace(/\n/g, '<br>');

                            appendMessage('agent', aiText, true);
                            incrementTasks();
                        } else {
                            console.error("Bonsai API Error Data:", data);
                            appendMessage('system', 'Erro na Bonsai: O modelo cortou a resposta ou falhou. Tente refazer o prompt.');
                        }
                    })
                    .catch(error => {
                        console.error("Fetch Error:", error);
                        const typingContent = document.getElementById('typing-indicator');
                        if (typingContent && typingContent.closest('.message')) {
                            chatContainer.removeChild(typingContent.closest('.message'));
                        }
                        appendMessage('system', `Falha na conexão com a Bonsai (Claude): ${error.message}`);
                    });

            } else {
                // Default Gemini API
                const requestBody = {
                    contents: [{
                        parts: parts
                    }],
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    generationConfig: {
                        temperature: tempConfig,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: maxTokens,
                    }
                };

                fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                })
                    .then(response => response.json())
                    .then(data => {
                        const typingContent = document.getElementById('typing-indicator');
                        if (typingContent && typingContent.closest('.message')) {
                            chatContainer.removeChild(typingContent.closest('.message'));
                        }

                        if (data.candidates && data.candidates.length > 0) {
                            let aiText = data.candidates[0].content.parts[0].text;

                            aiText = aiText.replace(/### (.*?)\n/g, '<h3>$1</h3>\n');
                            aiText = aiText.replace(/## (.*?)\n/g, '<h2>$1</h2>\n');
                            aiText = aiText.replace(/# (.*?)\n/g, '<h1>$1</h1>\n');
                            aiText = aiText.replace(/```([\s\S]*?)```/g, '<div style="background:#000; padding:10px; border-radius:8px; overflow-x:auto; margin:10px 0;"><pre style="margin:0;"><code style="color:#00ff64;">$1</code></pre></div>');
                            aiText = aiText.replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1); padding:2px 4px; border-radius:4px; color:#d000ff;">$1</code>');
                            aiText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            aiText = aiText.replace(/\*(.*?)\*/g, '<em>$1</em>');
                            aiText = aiText.replace(/\n\n/g, '<br><br>');
                            aiText = aiText.replace(/\n/g, '<br>');

                            appendMessage('agent', aiText, true);
                            incrementTasks();
                        } else {
                            console.error("Gemini API Error Data:", data);
                            appendMessage('system', 'Erro: O modelo cortou a resposta ou foi bloqueado. Tente refazer o prompt.');
                        }
                    })
                    .catch(error => {
                        console.error("Fetch Error:", error);
                        const typingContent = document.getElementById('typing-indicator');
                        if (typingContent && typingContent.closest('.message')) {
                            chatContainer.removeChild(typingContent.closest('.message'));
                        }
                        appendMessage('system', `Falha na conexão com a IA: ${error.message}`);
                    });
            }

        } else {
            // Generic response for other agents
            const typingContent = document.getElementById('typing-indicator');
            if (typingContent && typingContent.closest('.message')) chatContainer.removeChild(typingContent.closest('.message'));

            const demoResponses = [
                "Recebido. Sem os dados da RAG configurada e sem conexão de IA, eu estou aguardando minha calibração.",
                "Quando conectarmos minha base (RAG) à IA, poderei dar respostas hiper-personalizadas."
            ];
            let responseText = demoResponses[Math.floor(Math.random() * demoResponses.length)];
            appendMessage('agent', responseText);
        }
    }

    btnSend.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // --- File Attachment Logic ---
    const btnAttach = document.getElementById('btn-attach');
    const fileUpload = document.getElementById('file-upload');
    const attachmentPreview = document.getElementById('attachment-preview');
    const attachmentName = document.getElementById('attachment-name');
    const removeAttachment = document.getElementById('remove-attachment');

    // --- Objection Bank Click Logic (Fase 3) ---
    const objBtns = document.querySelectorAll('.btn-objection');
    if (objBtns) {
        objBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-obj');
                chatInput.value = text;
                chatInput.focus();
                // Optionally auto-send -> uncomment next line
                // btnSend.click(); 
            });
        });
    }

    let currentFile = null;
    let currentFileBase64 = null;

    if (btnAttach) {
        btnAttach.addEventListener('click', () => {
            fileUpload.click();
        });
    }

    if (fileUpload) {
        fileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                currentFile = file;
                attachmentName.textContent = file.name;
                attachmentPreview.style.display = 'flex';

                if (file.type.startsWith('image/')) {
                    attachmentName.previousElementSibling.className = "fa-solid fa-image";
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        currentFileBase64 = event.target.result.split(',')[1];
                    };
                    reader.readAsDataURL(file);
                } else if (file.type.startsWith('audio/')) {
                    attachmentName.previousElementSibling.className = "fa-solid fa-file-audio";
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        currentFileBase64 = event.target.result.split(',')[1];
                    };
                    reader.readAsDataURL(file);
                } else if (file.type === 'application/pdf') {
                    attachmentName.previousElementSibling.className = "fa-solid fa-file-pdf";
                    const reader = new FileReader();
                    reader.onload = async function () {
                        try {
                            const typedarray = new Uint8Array(this.result);
                            // Set worker source for pdf.js
                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                            const pdf = await pdfjsLib.getDocument(typedarray).promise;
                            let maxPages = pdf.numPages;
                            let extractedText = "";
                            for (let ptr = 1; ptr <= maxPages; ptr++) {
                                const page = await pdf.getPage(ptr);
                                const textContent = await page.getTextContent();
                                extractedText += textContent.items.map(s => s.str).join(' ');
                                extractedText += "\n";
                            }
                            currentFileBase64 = extractedText; // keep extracted text for the prompt
                        } catch (err) {
                            console.error("PDF Parsing Error", err);
                            currentFileBase64 = "[Erro interno no navegador ao ler o PDF selecionado.]";
                        }
                    };
                    reader.readAsArrayBuffer(file);
                } else {
                    // Fall back to simple text assuming txt, csv or md
                    attachmentName.previousElementSibling.className = "fa-solid fa-file-lines";
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        currentFileBase64 = event.target.result;
                    };
                    reader.readAsText(file);
                }
            }
        });
    }

    if (removeAttachment) {
        removeAttachment.addEventListener('click', () => {
            currentFile = null;
            currentFileBase64 = null;
            fileUpload.value = '';
            attachmentPreview.style.display = 'none';
        });
    }

    // --- Voice Input Logic (Web Speech API) ---
    const btnVoice = document.getElementById('btn-voice');
    const voiceIndicator = document.getElementById('voice-indicator');
    let recognition = null;
    let isRecording = false;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onstart = function () {
            isRecording = true;
            voiceIndicator.style.display = 'flex';
            btnVoice.style.color = '#ff003c';
        };

        recognition.onresult = function (event) {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            const currentVal = chatInput.value;
            chatInput.value = currentVal ? currentVal + ' ' + finalTranscript : finalTranscript;
        };

        recognition.onend = function () {
            isRecording = false;
            voiceIndicator.style.display = 'none';
            btnVoice.style.color = 'var(--text-secondary)';
        };

        recognition.onerror = function (event) {
            console.error("Speech Recognition Error", event.error);
            isRecording = false;
            voiceIndicator.style.display = 'none';
            btnVoice.style.color = 'var(--text-secondary)';
        };

        if (btnVoice) {
            btnVoice.addEventListener('click', () => {
                if (isRecording) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            });
        }
    } else {
        if (btnVoice) {
            btnVoice.addEventListener('click', () => {
                alert("Seu navegador não suporta digitação por voz nativa. Tente usar o Google Chrome no Desktop.");
            });
        }
    }

    // --- Action Header Logic (RAG Modal & Mode Dropdown) ---
    const btnViewRag = document.getElementById('btn-view-rag');
    const ragModal = document.getElementById('rag-modal');
    const closeRagModal = document.getElementById('close-rag-modal');
    const ragContentDisplay = document.getElementById('rag-content-display');

    if (btnViewRag) {
        btnViewRag.addEventListener('click', () => {
            if (currentAgentId === '1' && typeof copywriterRAG !== 'undefined') {
                ragContentDisplay.textContent = JSON.stringify(copywriterRAG, null, 2);
            } else if (currentAgentId === '2' && typeof promptArchitectRAG !== 'undefined') {
                ragContentDisplay.textContent = JSON.stringify(promptArchitectRAG, null, 2);
            } else if (currentAgentId === '3' && typeof closerRAG !== 'undefined') {
                ragContentDisplay.textContent = JSON.stringify(closerRAG, null, 2);
            } else if (currentAgentId === '4' && typeof gestorTrafegoRAG !== 'undefined') {
                ragContentDisplay.textContent = JSON.stringify(gestorTrafegoRAG, null, 2);
            } else {
                ragContentDisplay.textContent = "// Base de conhecimento não carregada ou não definida para este agente ainda.";
            }
            ragModal.style.display = 'flex';
        });
    }

    if (closeRagModal) {
        closeRagModal.addEventListener('click', () => {
            ragModal.style.display = 'none';
        });
    }

    // Close modal on click outside
    window.addEventListener('click', (e) => {
        if (e.target === ragModal) {
            ragModal.style.display = 'none';
        }
    });

    // Mode Dropdown logic
    const btnAgentMode = document.getElementById('btn-agent-mode');
    const modeDropdown = document.getElementById('mode-dropdown');

    if (btnAgentMode) {
        btnAgentMode.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent immediate window close
            modeDropdown.style.display = modeDropdown.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Hide dropdown on clicking anywhere else
    window.addEventListener('click', () => {
        if (modeDropdown && modeDropdown.style.display === 'block') {
            modeDropdown.style.display = 'none';
        }
    });

    if (modeDropdown) {
        modeDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // --- Settings, API Key & Themes Logic ---
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModal = document.getElementById('close-settings-modal');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const inputApiKey = document.getElementById('input-api-key');
    const inputUserName = document.getElementById('input-user-name');
    const inputUserRole = document.getElementById('input-user-role');
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const sidebarUserRole = document.getElementById('sidebar-user-role');
    const themeBtns = document.querySelectorAll('.theme-btn');

    // --- Zen Mode Logic (Fase 3) ---
    const btnZenMode = document.getElementById('btn-zen-mode');
    if (btnZenMode) {
        btnZenMode.addEventListener('click', () => {
            document.body.classList.toggle('zen-mode');
            const icon = btnZenMode.querySelector('i');
            if (document.body.classList.contains('zen-mode')) {
                icon.className = 'fa-solid fa-compress';
                btnZenMode.title = "Sair do Modo Zen";
            } else {
                icon.className = 'fa-solid fa-expand';
                btnZenMode.title = "Modo Zen (Tela Cheia)";
            }
        });
    }

    // --- Prompts Hub Logic (Fase 3) ---
    const btnPromptsHub = document.getElementById('btn-prompts-hub');
    const promptsModal = document.getElementById('prompts-modal');
    const closePromptsModal = document.getElementById('close-prompts-modal');
    const btnSaveNewPrompt = document.getElementById('btn-save-new-prompt');
    const newPromptTitle = document.getElementById('new-prompt-title');
    const promptsList = document.getElementById('prompts-list');

    function loadSavedPrompts() {
        if (!promptsList) return;
        const saved = JSON.parse(localStorage.getItem('hydra_saved_prompts') || '[]');
        if (saved.length === 0) {
            promptsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; font-size: 0.9rem;">Nenhum prompt salvo ainda. Escreva algo no chat, dê um nome e clique em "Salvar Atual".</p>';
            return;
        }

        promptsList.innerHTML = '';
        saved.forEach((item, index) => {
            const div = document.createElement('div');
            div.style.cssText = "background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;";

            const infoDiv = document.createElement('div');
            infoDiv.style.flex = "1";
            infoDiv.style.marginRight = "10px";
            infoDiv.innerHTML = `<strong style="display: block; color: var(--primary-neon); margin-bottom: 5px;">${item.title}</strong><span style="font-size: 0.8rem; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${item.content}</span>`;

            const actionsDiv = document.createElement('div');
            actionsDiv.style.display = "flex";
            actionsDiv.style.gap = "5px";

            const btnUse = document.createElement('button');
            btnUse.className = "btn-icon";
            btnUse.title = "Usar este Prompt no chat";
            btnUse.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i>';
            btnUse.onclick = () => {
                chatInput.value = item.content;
                promptsModal.style.display = 'none';
                chatInput.focus();
            };

            const btnDel = document.createElement('button');
            btnDel.className = "btn-icon";
            btnDel.title = "Apagar Prompt";
            btnDel.innerHTML = '<i class="fa-solid fa-trash" style="color: #ff4444;"></i>';
            btnDel.onclick = () => {
                saved.splice(index, 1);
                localStorage.setItem('hydra_saved_prompts', JSON.stringify(saved));
                loadSavedPrompts();
            };

            actionsDiv.appendChild(btnUse);
            actionsDiv.appendChild(btnDel);
            div.appendChild(infoDiv);
            div.appendChild(actionsDiv);
            promptsList.appendChild(div);
        });
    }

    if (btnPromptsHub) {
        btnPromptsHub.addEventListener('click', () => {
            loadSavedPrompts();
            promptsModal.style.display = 'flex';
        });
    }

    if (closePromptsModal) {
        closePromptsModal.addEventListener('click', () => {
            promptsModal.style.display = 'none';
        });
    }

    if (btnSaveNewPrompt) {
        btnSaveNewPrompt.addEventListener('click', () => {
            const content = chatInput.value.trim();
            const title = newPromptTitle.value.trim();

            if (!content) {
                alert("O campo de texto do chat está vazio! Digite o prompt que deseja salvar lá primeiro.");
                return;
            }
            if (!title) {
                alert("Dê um nome curto para este prompt para poder achá-lo depois.");
                return;
            }

            const saved = JSON.parse(localStorage.getItem('hydra_saved_prompts') || '[]');
            saved.push({ title, content });
            localStorage.setItem('hydra_saved_prompts', JSON.stringify(saved));

            newPromptTitle.value = '';
            loadSavedPrompts();
        });
    }

    // Load initial settings
    const savedKey = localStorage.getItem('hydra_api_key');
    if (savedKey && inputApiKey) inputApiKey.value = savedKey;

    const savedUserName = localStorage.getItem('hydra_user_name') || 'Usuário VIP';
    const savedUserRole = localStorage.getItem('hydra_user_role') || 'Plano Hydra Prime';

    if (inputUserName) inputUserName.value = savedUserName !== 'Usuário VIP' ? savedUserName : '';
    if (inputUserRole) inputUserRole.value = savedUserRole !== 'Plano Hydra Prime' ? savedUserRole : '';
    if (sidebarUserName) sidebarUserName.textContent = savedUserName;
    if (sidebarUserRole) sidebarUserRole.textContent = savedUserRole;

    const savedTheme = localStorage.getItem('hydra_theme') || 'default';
    document.body.setAttribute('data-theme', savedTheme);

    if (btnOpenSettings) {
        btnOpenSettings.addEventListener('click', () => {
            settingsModal.style.display = 'flex';
        });
    }

    if (closeSettingsModal) {
        closeSettingsModal.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
    }

    // Theme selector UI interaction
    if (themeBtns) {
        themeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.getAttribute('data-theme');
                document.body.setAttribute('data-theme', theme);
                localStorage.setItem('hydra_theme', theme);
            });
        });
    }

    if (btnSaveSettings) {
        btnSaveSettings.addEventListener('click', () => {
            if (inputApiKey) {
                const newKey = inputApiKey.value.trim();
                if (newKey !== "") {
                    localStorage.setItem('hydra_api_key', newKey);
                } else {
                    localStorage.removeItem('hydra_api_key'); // clear if empty
                }
            }

            if (inputUserName && inputUserRole) {
                const newName = inputUserName.value.trim() || 'Usuário VIP';
                const newRole = inputUserRole.value.trim() || 'Plano Hydra Prime';

                localStorage.setItem('hydra_user_name', newName);
                localStorage.setItem('hydra_user_role', newRole);

                if (sidebarUserName) sidebarUserName.textContent = newName;
                if (sidebarUserRole) sidebarUserRole.textContent = newRole;
            }

            settingsModal.style.display = 'none';
            alert("Configurações salvas e aplicadas na Sessão!");
        });
    }

    // --- Automated Agency Workflow & Bonsai Fallback ---
    const btnRunAgency = document.getElementById('btn-run-agency');
    const agencyInput = document.getElementById('agency-input');
    const agencyProgress = document.getElementById('agency-progress');
    const agStep1 = document.getElementById('ag-step-1');
    const agStep2 = document.getElementById('ag-step-2');
    const agStep3 = document.getElementById('ag-step-3');
    const agencyModal = document.getElementById('agency-modal');
    const closeAgencyModal = document.getElementById('close-agency-modal');
    const agencyTabs = document.querySelectorAll('.agency-tab');
    const agencyPanels = document.querySelectorAll('.agency-content-panel');
    const btnExportAgency = document.getElementById('btn-export-agency');
    const btnExportAgencyDocx = document.getElementById('btn-export-agency-docx');

    let agencyResults = { arch: '', copy: '', closer: '' };

    async function callGemini(systemPrompt, userPrompt) {
        const storedKey = localStorage.getItem('hydra_api_key');
        const collabName = localStorage.getItem('hydra_user_name') || 'Usuário VIP';
        const collabRole = localStorage.getItem('hydra_user_role') || 'Sócio / Operador';

        const finalSystemPrompt = systemPrompt + `\n\n[CONTEXTO DO USUÁRIO]: O projeto sendo orquestrado abaixo pertence a "${collabName}" (${collabRole}).`;

        // Bonsai API Fallback
        if (storedKey && storedKey.startsWith('sk_cr_')) {
            const requestBody = {
                model: "claude-3-haiku-20240307",
                messages: [
                    { role: "system", content: finalSystemPrompt },
                    { role: "user", content: userPrompt }
                ],
                max_tokens: 4000,
                temperature: 0.7
            };

            const response = await fetch("https://gateway.trybons.ai/v1/chat/completions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error('Bonsai API Error');
            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                incrementTasks();
                return data.choices[0].message.content;
            }
            return 'Erro na IA da Bonsai.';
        }

        const apiKey = storedKey ? storedKey : "AIzaSyA1KQ7xakl5-vqVWInrhrII0N7G8gDiRHU";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: finalSystemPrompt }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            incrementTasks();
            return data.candidates[0].content.parts[0].text;
        }
        return 'Erro na IA.';
    }

    function formatAgencyText(rawText) {
        let html = rawText.replace(/### (.*?)\n/g, '<h3>$1</h3>\n');
        html = html.replace(/## (.*?)\n/g, '<h2>$1</h2>\n');
        html = html.replace(/# (.*?)\n/g, '<h1>$1</h1>\n');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n\n/g, '<br><br>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    if (btnRunAgency) {
        btnRunAgency.addEventListener('click', async () => {
            const productIdea = agencyInput.value.trim();
            if (!productIdea) { alert('Digite uma ideia de produto primeiro!'); return; }

            btnRunAgency.disabled = true;
            agencyProgress.style.display = 'block';

            agStep1.style.color = 'var(--text-secondary)';
            agStep2.style.color = 'rgba(255,255,255,0.2)';
            agStep3.style.color = 'rgba(255,255,255,0.2)';
            agStep1.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> 1. Arquiteto mapeando a oferta...';

            try {
                // Step 1: Architect
                const archPrompt = "Base RAG: \n" + JSON.stringify(promptArchitectRAG) + "\nInstrução: Gere a estrutura de funil, mecanismos únicos e grande promessa para o produto: " + productIdea;
                const archResult = await callGemini(archPrompt, productIdea);
                agencyResults.arch = archResult;
                document.getElementById('tab-arch').innerHTML = formatAgencyText(archResult);

                // Step 2: Copywriter
                agStep1.innerHTML = '<i class="fa-solid fa-check" style="color:#00ff64"></i> 1. Oferta Mapeada';
                agStep2.style.color = 'var(--text-secondary)';
                agStep2.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> 2. Copywriter redigindo a VSL...';

                const copySys = "Base RAG: \n" + JSON.stringify(copywriterRAG) + "\nInstrução: Crie uma VSL completa usando a seguinte estrutura do Arquiteto: " + archResult;
                const copyResult = await callGemini(copySys, "Escreva a VSL completa com base na arquitetura enviada.");
                agencyResults.copy = copyResult;
                document.getElementById('tab-copy').innerHTML = formatAgencyText(copyResult);

                // Step 3: Closer
                agStep2.innerHTML = '<i class="fa-solid fa-check" style="color:#00ff64"></i> 2. VSL Criada';
                agStep3.style.color = 'var(--text-secondary)';
                agStep3.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> 3. Closer montando o Script final...';

                const closerSys = "Base RAG: \n" + JSON.stringify(closerRAG) + "\nInstrução: Com base nesta VSL, mapeie as 5 principais objeções e crie um script de recuperação de vendas de WhatsApp.\n\nVSL: " + copyResult;
                const closerResult = await callGemini(closerSys, "Crie o script do Closer.");
                agencyResults.closer = closerResult;
                document.getElementById('tab-closer').innerHTML = formatAgencyText(closerResult);

                agStep3.innerHTML = '<i class="fa-solid fa-check" style="color:#00ff64"></i> 3. Script Finalizado';

                setTimeout(() => {
                    agencyProgress.style.display = 'none';
                    btnRunAgency.disabled = false;
                    agencyModal.style.display = 'flex';
                }, 1000);

            } catch (err) {
                console.error(err);
                alert('Erro durante a execução da agência. Verifique logs.');
                btnRunAgency.disabled = false;
            }
        });
    }

    if (closeAgencyModal) {
        closeAgencyModal.addEventListener('click', () => agencyModal.style.display = 'none');
    }

    agencyTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            agencyTabs.forEach(t => { t.classList.remove('active'); t.style.background = 'rgba(255,255,255,0.1)'; });
            agencyPanels.forEach(p => p.style.display = 'none');

            const targetId = e.target.getAttribute('data-tab');
            e.target.classList.add('active');
            e.target.style.background = 'var(--primary-neon)';
            document.getElementById(targetId).style.display = 'block';
        });
    });

    if (btnExportAgency) {
        btnExportAgency.addEventListener('click', () => {
            const fullText = "=== FASE 1: ARQUITETO ===\n\n" + agencyResults.arch + "\n\n\n=== FASE 2: COPYWRITER (VSL) ===\n\n" + agencyResults.copy + "\n\n\n=== FASE 3: CLOSER (SCRIPT) ===\n\n" + agencyResults.closer;
            const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "hydra_agencia_completa_" + Date.now() + ".txt";
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (btnExportAgencyDocx) {
        btnExportAgencyDocx.addEventListener('click', () => {
            const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export DOCX</title></head><body>";
            const footer = "</body></html>";

            let htmlContent = "<h1>Projeto de Coprodução Automatizada Hydra</h1><hr>";
            htmlContent += "<h2>FASE 1: Arquiteto de Ofertas</h2>";
            htmlContent += formatAgencyText(agencyResults.arch);
            htmlContent += "<hr><h2>FASE 2: Copywriter (VSL)</h2>";
            htmlContent += formatAgencyText(agencyResults.copy);
            htmlContent += "<hr><h2>FASE 3: Closer (Script)</h2>";
            htmlContent += formatAgencyText(agencyResults.closer);

            const sourceHTML = header + htmlContent + footer;

            const converted = htmlDocx.asBlob(sourceHTML);
            const url = URL.createObjectURL(converted);
            const a = document.createElement('a');
            a.href = url;
            a.download = "hydra_agencia_completa_" + Date.now() + ".docx";
            a.click();
            URL.revokeObjectURL(url);
        });
    }

});
