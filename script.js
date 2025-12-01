/* --- VARIABLES --- */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const fileInput = document.getElementById('fileInput');
const scanBtn = document.getElementById('scanBtn');
const scanStatus = document.getElementById('scanStatus');
const progressBar = document.getElementById('progressBar');
const statusText = document.getElementById('statusText');
const resultCard = document.getElementById('resultCard');
const historyList = document.getElementById('historyList');
const notifBadge = document.getElementById('notif-badge');
const clearHistoryBtn = document.getElementById('clearHistory');
const contactForm = document.getElementById('contactForm');

// Initialize State
let scanHistory = JSON.parse(localStorage.getItem('shadowGuardHistory')) || [];

/* --- THEME TOGGLE LOGIC --- */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    } else {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
});

/* --- MOBILE MENU --- */
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fa-solid fa-xmark"></i>' 
        : '<i class="fa-solid fa-bars"></i>';
});

/* --- NOTIFICATIONS / HISTORY --- */
function updateHistoryUI() {
    historyList.innerHTML = '';
    notifBadge.innerText = scanHistory.length;
    
    if (scanHistory.length === 0) {
        historyList.innerHTML = '<li class="empty-msg">No scan history available.</li>';
        return;
    }

    scanHistory.forEach(item => {
        const li = document.createElement('li');
        const statusClass = item.status === 'Safe' ? 'status-safe' : 'status-suspicious';
        
        li.innerHTML = `
            <span><i class="fa-solid fa-file"></i> ${item.name}</span>
            <span class="${statusClass}">${item.status}</span>
            <span style="font-size: 0.8rem; opacity: 0.7;">${item.time}</span>
        `;
        // Insert at top
        historyList.prepend(li);
    });
}

clearHistoryBtn.addEventListener('click', () => {
    scanHistory = [];
    localStorage.setItem('shadowGuardHistory', JSON.stringify(scanHistory));
    updateHistoryUI();
});

// Load history on init
updateHistoryUI();

/* --- SCANNING LOGIC --- */
scanBtn.addEventListener('click', () => {
    if (fileInput.files.length === 0) {
        alert("Please select a file to scan first.");
        return;
    }

    const file = fileInput.files[0];
    startScan(file.name);
});

function startScan(fileName) {
    // UI Reset
    scanStatus.style.display = 'block';
    resultCard.style.display = 'none';
    progressBar.style.width = '0%';
    statusText.innerText = 'Initializing AI Core...';
    scanBtn.disabled = true;
    scanBtn.innerText = 'Scanning...';

    let width = 0;
    
    // Simulate Progress
    const interval = setInterval(() => {
        width += Math.random() * 5;
        if (width >= 100) {
            width = 100;
            clearInterval(interval);
            finishScan(fileName);
        }
        progressBar.style.width = width + '%';
        
        // Random Text updates
        if (width > 30 && width < 60) statusText.innerText = 'Heuristic Analysis in progress...';
        if (width > 60 && width < 90) statusText.innerText = 'Checking Database signatures...';
    }, 100);
}

function finishScan(fileName) {
    scanBtn.disabled = false;
    scanBtn.innerText = 'Scan Now';
    statusText.innerText = 'Scan Complete.';

    // Randomize Result (Simulation)
    const isSafe = Math.random() > 0.3; // 70% chance safe, 30% suspicious
    const result = isSafe ? 'Safe' : 'Suspicious';
    
    // UI Update
    resultCard.style.display = 'block';
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultDesc = document.getElementById('resultDesc');
    
    if (isSafe) {
        resultCard.style.borderColor = 'var(--neon-green)';
        resultIcon.innerHTML = '<i class="fa-solid fa-shield-check" style="font-size: 3rem; color: var(--neon-green);"></i>';
        resultTitle.innerText = "No Threats Detected";
        resultTitle.style.color = "var(--neon-green)";
        resultDesc.innerText = `File "${fileName}" appears to be clean.`;
    } else {
        resultCard.style.borderColor = 'var(--neon-red)';
        resultIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: var(--neon-red);"></i>';
        resultTitle.innerText = "Malicious Threat Detected!";
        resultTitle.style.color = "var(--neon-red)";
        resultDesc.innerText = `High risk detected in "${fileName}". Quarantine recommended.`;
    }

    // Save to History
    const newEntry = {
        name: fileName,
        status: result,
        time: new Date().toLocaleTimeString()
    };
    scanHistory.push(newEntry);
    localStorage.setItem('shadowGuardHistory', JSON.stringify(scanHistory));
    updateHistoryUI();
}

/* --- CONTACT FORM --- */
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button');
    const originalText = btn.innerText;
    
    btn.innerText = 'Transmitting...';
    
    setTimeout(() => {
        alert('Transmission Received. ShadowGuard agents will contact you shortly.');
        contactForm.reset();
        btn.innerText = originalText;
    }, 1500);
});

/* --- NAVBAR CLICK SMOOTH TRANSITION --- */
(function () {
    const body = document.body;
    const links = Array.from(document.querySelectorAll('a[href^="#"]'));
    const FADE_DURATION = 520; // ms (should be slightly longer than CSS)

    links.forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            // avoid re-triggering while transition active
            if (body.classList.contains('page-fade')) return;

            // apply fade-out
            body.classList.add('page-fade');

            // allow a small delay for the fade-out effect, then smooth-scroll
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // remove fade after scroll finishes (approx)
                setTimeout(() => {
                    body.classList.remove('page-fade');
                    // push new hash to history so back button works
                    try { history.pushState(null, '', href); } catch (err) { /* ignore */ }
                }, FADE_DURATION);
            }, 80);

            // close mobile nav if open
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        });
    });

    // Back/forward: just scroll smoothly to the hash (no extra fade)
    window.addEventListener('popstate', () => {
        const id = location.hash || '#home';
        const el = document.querySelector(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
})();

/* --- particles.js Initialization --- */
try {
        if (typeof particlesJS !== 'undefined') {
                particlesJS("particles-js", {
                    particles: {
                        number: { value: 80, density: { enable: true, value_area: 900 } },
                        color: { value: "#38bdf8" },
                        size: { value: 3.5, random: true },
                        line_linked: {
                            enable: true,
                            distance: 150,
                            color: "#60a5fa",
                            opacity: 0.4,
                            width: 1.2
                        },
                        move: { enable: true, speed: 2.2 }
                    },
                    interactivity: {
                        detect_on: "window",
                        events: {
                            onhover: { enable: true, mode: "grab" },
                            onclick: { enable: true, mode: "repulse" }
                        },
                        modes: {
                            grab: { distance: 180, line_linked: { opacity: 0.8 } },
                            repulse: { distance: 140, duration: 0.4 }
                        }
                    },
                    retina_detect: true
                });
        } else {
                console.warn('particlesJS not found — make sure particles.min.js is loaded before script.js');
        }
} catch (err) {
        console.error('particlesJS initialization error:', err);
}

/* --- Simple Chatbot Integration (Hugging Face) --- */
(function () {
    const widget = document.getElementById('chat-widget');
    if (!widget) return;

    const toggle = document.getElementById('chat-toggle');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const settingsBtn = document.getElementById('chat-settings');
    const settingsPanel = document.getElementById('chat-settings-panel');
    const hfInput = document.getElementById('hf-key');
    const hfModelInput = document.getElementById('hf-model');
    const saveKeyBtn = document.getElementById('save-key');
    const clearKeyBtn = document.getElementById('clear-key');
    const providerSelect = document.getElementById('chat-provider-select');
    const openrouterKeyInput = document.getElementById('openrouter-key');
    const hfModelOpenrouterInput = document.getElementById('hf-model-openrouter');
    const multiturnCheckbox = document.getElementById('chat-multiturn');
    const messagesEl = document.getElementById('chat-messages');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const providerLabel = document.getElementById('chat-provider');
    const imageBtn = document.createElement('button');
    imageBtn.type = 'button';
    imageBtn.className = 'btn outline-btn';
    imageBtn.style.marginLeft = '8px';
    imageBtn.innerText = 'Image';
    // add image button next to send
    const chatForm = document.getElementById('chat-form');
    if (chatForm) chatForm.appendChild(imageBtn);

    const HF_STORAGE_KEY = 'shadowguard_hf_key';
    const HF_MODEL_STORAGE_KEY = 'shadowguard_hf_model';
    const PROVIDER_STORAGE_KEY = 'shadowguard_chat_provider';
    const OPENROUTER_KEY_STORAGE_KEY = 'shadowguard_openrouter_key';
    const MULTITURN_STORAGE_KEY = 'shadowguard_chat_multiturn';
    const LOCAL_MODEL_KEY = 'shadowguard_local_model';

    const DEFAULT_MODEL = 'facebook/blenderbot-400M-distill';
    const DEFAULT_OPENROUTER_MODEL = 'openai/gpt-4o';
    const DEFAULT_LOCAL_MODEL = 'Xenova/distilgpt2';
    const GROK_MODEL = 'x-ai/grok-4.1-fast:free';

    // If no model configured yet, prefer the provided Grok free model identifier
    if (!localStorage.getItem(HF_MODEL_STORAGE_KEY)) {
        try { localStorage.setItem(HF_MODEL_STORAGE_KEY, GROK_MODEL); } catch (e) { /* ignore storage errors */ }
    }

    // load saved key
    function loadKey() { return localStorage.getItem(HF_STORAGE_KEY) || ''; }
    function saveKey(k) { localStorage.setItem(HF_STORAGE_KEY, k || ''); }
    function clearKey() { localStorage.removeItem(HF_STORAGE_KEY); }

    const saved = loadKey();
    const savedModel = localStorage.getItem(HF_MODEL_STORAGE_KEY) || DEFAULT_MODEL;
    const savedProvider = localStorage.getItem(PROVIDER_STORAGE_KEY) || 'huggingface';
    const savedOpenRouterKey = localStorage.getItem(OPENROUTER_KEY_STORAGE_KEY) || '';
    const savedOpenRouterModel = localStorage.getItem(HF_MODEL_STORAGE_KEY) || DEFAULT_OPENROUTER_MODEL;
    const savedMultiturn = localStorage.getItem(MULTITURN_STORAGE_KEY) === '1';
    if (saved) hfInput.value = saved;
    if (hfModelInput) hfModelInput.value = savedModel;
    if (providerSelect) providerSelect.value = savedProvider;
    if (openrouterKeyInput) openrouterKeyInput.value = savedOpenRouterKey;
    if (hfModelOpenrouterInput) hfModelOpenrouterInput.value = savedOpenRouterModel;
    if (multiturnCheckbox) multiturnCheckbox.checked = savedMultiturn;

    function updateProviderUI() {
        const p = (providerSelect && providerSelect.value) || savedProvider;
        const hfSection = document.getElementById('provider-huggingface');
        const orSection = document.getElementById('provider-openrouter');
        const localSection = document.getElementById('provider-local');
        const localNote = document.getElementById('local-model-note');
        if (hfSection) hfSection.style.display = p === 'huggingface' ? 'block' : 'none';
        if (orSection) orSection.style.display = p === 'openrouter' ? 'block' : 'none';
        if (localSection) localSection.style.display = p === 'local' ? 'block' : 'none';
        providerLabel.innerText = p === 'openrouter' ? `OpenRouter (${hfModelOpenrouterInput?.value || DEFAULT_OPENROUTER_MODEL})` : (p === 'local' ? `Local (browser)` : `HuggingFace (${hfModelInput?.value || DEFAULT_MODEL})`);
        if (localNote) localNote.style.display = p === 'local' ? 'block' : 'none';
    }
        // local model select wiring
        const localModelSelect = document.getElementById('local-model-select');
        const storedLocalModel = localStorage.getItem(LOCAL_MODEL_KEY) || DEFAULT_LOCAL_MODEL;
        if (localModelSelect) {
            // ensure stored value exists in select; if not, append
            let found = false;
            for (let i = 0; i < localModelSelect.options.length; i++) {
                if (localModelSelect.options[i].value === storedLocalModel) { found = true; break; }
            }
            if (!found) {
                const opt = document.createElement('option'); opt.value = storedLocalModel; opt.innerText = storedLocalModel; localModelSelect.appendChild(opt);
            }
            localModelSelect.value = storedLocalModel;
            localModelSelect.addEventListener('change', () => {
                localStorage.setItem(LOCAL_MODEL_KEY, localModelSelect.value);
            });
        }
    if (providerSelect) providerSelect.addEventListener('change', updateProviderUI);
    updateProviderUI();

    function openWidget() { widget.classList.add('open'); panel.focus(); }
    function closeWidget() { widget.classList.remove('open'); settingsPanel.style.display = 'none'; }

    toggle.addEventListener('click', () => {
        if (widget.classList.contains('open')) closeWidget(); else openWidget();
    });
    closeBtn.addEventListener('click', closeWidget);
    settingsBtn.addEventListener('click', () => {
        const visible = settingsPanel.style.display === 'block';
        settingsPanel.style.display = visible ? 'none' : 'block';
    });

    saveKeyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const v = hfInput.value.trim();
        saveKey(v);
        // also save model selection if present
        if (hfModelInput) {
            const m = hfModelInput.value.trim() || DEFAULT_MODEL;
            localStorage.setItem(HF_MODEL_STORAGE_KEY, m);
        }
        // save provider selection
        if (providerSelect) localStorage.setItem(PROVIDER_STORAGE_KEY, providerSelect.value);
        // save openrouter key and model
        if (openrouterKeyInput) {
            const ok = openrouterKeyInput.value.trim();
            if (ok) localStorage.setItem(OPENROUTER_KEY_STORAGE_KEY, ok);
        }
        if (hfModelOpenrouterInput) {
            const m2 = hfModelOpenrouterInput.value.trim() || DEFAULT_OPENROUTER_MODEL;
            localStorage.setItem(HF_MODEL_STORAGE_KEY, m2);
        }
        // save local model choice if present
        const localModelSelect = document.getElementById('local-model-select');
        if (localModelSelect) localStorage.setItem(LOCAL_MODEL_KEY, localModelSelect.value || DEFAULT_LOCAL_MODEL);
        // save multiturn preference
        if (multiturnCheckbox) localStorage.setItem(MULTITURN_STORAGE_KEY, multiturnCheckbox.checked ? '1' : '0');
        updateProviderUI();
        alert('Settings saved locally. Keys are stored in your browser only.');
    });
    clearKeyBtn.addEventListener('click', (e) => { e.preventDefault(); hfInput.value = ''; if (openrouterKeyInput) openrouterKeyInput.value = ''; clearKey(); localStorage.removeItem(OPENROUTER_KEY_STORAGE_KEY); alert('Keys cleared.'); });

    function appendMessage(text, who = 'bot') {
        const div = document.createElement('div');
        div.className = 'message ' + (who === 'user' ? 'user' : 'bot');
        div.innerText = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function appendError(text) {
        const div = document.createElement('div');
        div.className = 'message bot error';
        div.innerText = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function sendToHF(message, history = []) {
        const key = loadKey();
        if (!key) return null;
        // model chosen by user (fallback to default)
        const model = localStorage.getItem(HF_MODEL_STORAGE_KEY) || DEFAULT_MODEL;
        const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;
        try {
            // If multi-turn history provided, join into a single prompt for HF models
            let payload = { inputs: message };
            if (history && history.length) {
                // build a concatenated conversation string
                const conv = history.map(m => (m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`)).join('\n') + `\nUser: ${message}`;
                payload = { inputs: conv };
            }
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
                body: JSON.stringify(payload)
            });
            if (!resp.ok) {
                const txt = await resp.text();
                console.warn('HF response not ok:', resp.status, txt);
                return null;
            }
            const data = await resp.json();
            // HF text-generation returns an array or object; try to extract text
            if (Array.isArray(data) && data.length && data[0].generated_text) return data[0].generated_text;
            if (data && data.generated_text) return data.generated_text;
            // some models return {error:...} or other shape
            if (typeof data === 'string') return data;
            // as fallback, try first key
            const first = data[0];
            if (first && typeof first === 'object') {
                return first.generated_text || first[0] || JSON.stringify(first);
            }
            return null;
        } catch (err) {
            console.error('HF request failed', err);
            return null;
        }
    }

    async function sendToOpenRouter(message) {
        const key = localStorage.getItem(OPENROUTER_KEY_STORAGE_KEY) || (openrouterKeyInput ? openrouterKeyInput.value.trim() : '');
        if (!key) return null;
        const model = localStorage.getItem(HF_MODEL_STORAGE_KEY) || DEFAULT_OPENROUTER_MODEL;
        const url = 'https://openrouter.ai/api/v1/chat/completions';
        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ model: model, messages: [{ role: 'user', content: message }] })
            });
            if (!resp.ok) {
                const txt = await resp.text();
                console.warn('OpenRouter response not ok:', resp.status, txt);
                return null;
            }
            const data = await resp.json();
            if (data?.choices && data.choices[0]) {
                const ch = data.choices[0];
                if (ch.message && ch.message.content) return ch.message.content;
                if (ch.text) return ch.text;
            }
            if (data?.output) return data.output;
            return JSON.stringify(data);
        } catch (err) {
            console.error('OpenRouter request failed', err);
            return null;
        }
    }

    // Local in-browser model init + generation using transformers.js
    let _localGenerator = null;
    async function initLocalModel() {
        if (_localGenerator) return _localGenerator;
        if (!window.transformers) {
            console.warn('transformers.js not available in page.');
            return null;
        }
        try {
            // small/lightweight model hosted via Xenova (may download model files)
            const modelId = localStorage.getItem(LOCAL_MODEL_KEY) || DEFAULT_LOCAL_MODEL;
            // pipeline returns a callable
            _localGenerator = await window.transformers.pipeline('text-generation', modelId);
            console.info('Local model initialized:', modelId);
            return _localGenerator;
        } catch (err) {
            console.error('Local model init failed:', err);
            return null;
        }
    }

    async function generateLocal(text, max_new_tokens = 64) {
        const gen = await initLocalModel();
        if (!gen) return null;
        try {
            const out = await gen(text, { max_new_tokens });
            if (Array.isArray(out) && out.length && out[0].generated_text) return out[0].generated_text;
            if (out && out.generated_text) return out.generated_text;
            // some pipelines return string
            if (typeof out === 'string') return out;
            return JSON.stringify(out);
        } catch (err) {
            console.error('Local generation failed:', err);
            return null;
        }
    }

    // Proxy-forwarding helper (calls local server /api/chat)
    async function sendViaProxy({ provider = 'huggingface', model = null, messages = null, input = null } = {}) {
        // Allow overriding proxy base via global var or localStorage
        const DEFAULT_PROXY = 'http://localhost:3000';
        const stored = localStorage.getItem('shadowguard_proxy_url');
        const proxyBase = (window.SHADOWGUARD_PROXY_URL && window.SHADOWGUARD_PROXY_URL.trim())
            ? window.SHADOWGUARD_PROXY_URL.trim().replace(/\/$/, '')
            : (stored && stored.trim())
                ? stored.trim().replace(/\/$/, '')
                : DEFAULT_PROXY;
        const url = proxyBase + '/api/chat';
        console.debug('sendViaProxy -> proxy URL:', url);
        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, model, messages, input })
            });
            const data = await resp.json().catch(() => null);
            if (!resp.ok) {
                // return structured error so caller can display it
                const errText = data && (data.error || data.details || JSON.stringify(data)) || `Proxy error ${resp.status}`;
                console.warn('Proxy returned error', resp.status, errText);
                return { text: null, error: errText, raw: data };
            }
            return { text: data?.text || null, error: null, raw: data };
        } catch (err) {
            console.warn('Proxy request failed', err);
            return null;
        }
    }

    // fallback simple bot
    function cannedReply(msg) {
        const lc = msg.toLowerCase();
        if (lc.includes('hello') || lc.includes('hi')) return 'Hello — I am ShadowGuard AI. How can I assist you?';
        if (lc.includes('scan')) return 'You can upload a file in the Scan section to analyze it.';
        if (lc.includes('contact')) return 'Use the Contact form in the Contact section to reach support.';
        return "I don't have an API key configured. Paste a free Hugging Face token in Settings to enable AI replies.";
    }

    // maintain session conversation in memory
    const conversation = [];

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        appendMessage(text, 'user');
        input.value = '';

        // show typing indicator
        const typing = document.createElement('div'); typing.className = 'message bot'; typing.innerText = '...';
        messagesEl.appendChild(typing);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        // choose provider
        const provider = localStorage.getItem(PROVIDER_STORAGE_KEY) || (providerSelect ? providerSelect.value : 'huggingface');
        // prepare history if multiturn enabled
        const multiturn = localStorage.getItem(MULTITURN_STORAGE_KEY) === '1';
        let respText = null;
        if (provider === 'openrouter') {
            const messagesForOpenRouter = multiturn ? [...conversation.slice(-6), { role: 'user', content: text }] : [{ role: 'user', content: text }];
            // try proxy first
            const proxyResult = await sendViaProxy({ provider: 'openrouter', model: localStorage.getItem(HF_MODEL_STORAGE_KEY) || DEFAULT_OPENROUTER_MODEL, messages: messagesForOpenRouter });
            if (proxyResult && proxyResult.error) {
                // show proxy error then try fallback
                appendError('Proxy error: ' + proxyResult.error);
                try {
                    respText = await sendToOpenRouter(text);
                } catch (err) { console.error('OpenRouter fallback error', err); }
            } else if (proxyResult && proxyResult.text) {
                respText = proxyResult.text;
            } else {
                // no proxy result, try direct
                respText = await sendToOpenRouter(text);
            }
        } else if (provider === 'local') {
            // local in-browser generation
            let prompt = text;
            if (multiturn && conversation.length) {
                prompt = conversation.slice(-6).map(m => (m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`)).join('\n') + `\nUser: ${text}`;
            }
            const gen = await generateLocal(prompt, 128);
            if (gen) {
                respText = gen;
            } else {
                appendError('Local model generation failed or is not initialized.');
            }
        } else {
            const history = multiturn ? conversation.slice(-6) : [];
            const proxyResult = await sendViaProxy({ provider: 'huggingface', model: localStorage.getItem(HF_MODEL_STORAGE_KEY) || DEFAULT_MODEL, messages: history, input: text });
            if (proxyResult && proxyResult.error) {
                appendError('Proxy error: ' + proxyResult.error);
                respText = await sendToHF(text, history);
            } else if (proxyResult && proxyResult.text) {
                respText = proxyResult.text;
            } else {
                respText = await sendToHF(text, history);
            }
        }
        messagesEl.removeChild(typing);
        if (respText) {
            appendMessage(respText, 'bot');
            // save to conversation history
            conversation.push({ role: 'user', content: text });
            conversation.push({ role: 'assistant', content: respText });
        } else {
            const fallback = cannedReply(text);
            appendMessage(fallback, 'bot');
            conversation.push({ role: 'user', content: text });
            conversation.push({ role: 'assistant', content: fallback });
        }
    });

    // Image generation handler
    imageBtn.addEventListener('click', async () => {
        const prompt = input.value.trim();
        if (!prompt) { alert('Enter an image prompt in the input first.'); return; }
        appendMessage(prompt, 'user');
        const typing = document.createElement('div'); typing.className = 'message bot'; typing.innerText = 'Generating image...';
        messagesEl.appendChild(typing);

        // pick provider/model
        const provider = localStorage.getItem(PROVIDER_STORAGE_KEY) || (providerSelect ? providerSelect.value : 'huggingface');
        const model = (provider === 'openrouter') ? (localStorage.getItem(HF_MODEL_STORAGE_KEY) || DEFAULT_OPENROUTER_MODEL) : (localStorage.getItem(HF_MODEL_STORAGE_KEY) || DEFAULT_MODEL);

        try {
            const proxyUrl = (window.SHADOWGUARD_PROXY_URL && window.SHADOWGUARD_PROXY_URL.trim()) ? window.SHADOWGUARD_PROXY_URL.trim().replace(/\/$/, '') : (localStorage.getItem('shadowguard_proxy_url') || 'http://localhost:3001');
            const resp = await fetch(proxyUrl + '/api/image', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, model, prompt })
            });
            const data = await resp.json();
            messagesEl.removeChild(typing);
            if (!resp.ok) {
                appendError('Image error: ' + (data.error || JSON.stringify(data)));
                return;
            }
            if (data.dataUri) {
                const div = document.createElement('div'); div.className = 'message bot';
                const img = document.createElement('img'); img.src = data.dataUri; img.style.maxWidth = '100%'; img.style.borderRadius = '6px';
                div.appendChild(img);
                messagesEl.appendChild(div);
                messagesEl.scrollTop = messagesEl.scrollHeight;
                // clear input
                input.value = '';
            } else {
                appendError('No image returned.');
            }
        } catch (err) {
            messagesEl.removeChild(typing);
            appendError('Image generation failed: ' + (err.message || err));
        }
    });

    // display initial provider info (updateProviderUI keeps it current)
    // providerLabel will be updated by updateProviderUI
})();